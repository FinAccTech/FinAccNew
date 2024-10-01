import { Observable, Subject} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { TypeVoucherSeries } from "./ClsVoucherSeries";
import { FileHandle } from "../Types/file-handle";
import { TypeLedger } from "./ClsLedgers";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsVouchers{
    public Voucher!: TypeVoucher;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private ClientSno: number = JSON.parse (sessionStorage.getItem("sessionLoggedClient")!).ClientSno; 
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getVouchers(VouSno: number, FromDate: number, ToDate: number, VouTypeSno: number, SeriesSno: number, Cancel_Status: number ): Observable<TypeHttpResponse> {
        let postdata ={ "VouSno" :  VouSno, "CompSno" : this.CompSno, "FromDate": FromDate, "ToDate": ToDate, "VouTypeSno": VouTypeSno, "SeriesSno": SeriesSno, "Cancel_Status": Cancel_Status }; 
        return this.dataService.HttpGet(postdata, "/getVouchers");          
    }

    saveVoucher(): Observable<TypeHttpResponse>  {              
        let postdata = this.Voucher;		
        return this.dataService.HttpPost(postdata, "/saveVoucher");  
    }

    deleteVoucher(): Observable<TypeHttpResponse> {
        let postdata ={ "ClientSno": this.ClientSno, "CompSno": this.CompSno, "VouSno" :  this.Voucher.VouSno, "Vou_No": this.Voucher.Vou_No }; 
        return this.dataService.HttpPost(postdata, "/deleteVoucher");                
    }

    getVoucherNumber(SeriesSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "SeriesSno" :  SeriesSno}; 
        return this.dataService.HttpGet(postdata, "/getTransactionNumber");                
    }

   Initialize () { 
		let Voucher: TypeVoucher = {
            VouSno: 0,		
            VouTypeSno: 0,
            Series: {"SeriesSno":0, "Series_Name":"","VouType":{"VouTypeSno":0, "VouType_Name":""}},
            Vou_No: "",
            Vou_Date: DateToInt(new Date()),
            Narration: "",
            TrackSno: 0,
            IsAuto: 0,
            GenType: 0,
            UserSno: this.UserSno,
            CompSno: this.CompSno,
            Cancel_Status: 0,
            Cancel_Date: 0,
            Cancel_Remarks: "",
            VouDetailXML: "",
            fileSource: [],
            Series_Json: "",
            VouDetails_Json: "",
            Images_Json: "",
            Name: "",
            Details: ""
		  }
		  return Voucher;
	}
}

	export interface TypeVoucher{
		VouSno: number;		
        VouTypeSno: number;
        Series: TypeVoucherSeries;
        Vou_No: string;
        Vou_Date: number;
        Narration: string;
        TrackSno: number;
        IsAuto: number;
        GenType: number;
        UserSno: number;
        CompSno: number;
        Cancel_Status: number;
        Cancel_Date: number;
        Cancel_Remarks: string;                
        VouDetailXML: string;        
        fileSource: FileHandle[];
        Series_Json: string;        
        VouDetails_Json: string;
        Images_Json: string;
        Name: string;
        Details: string;
	}

    export interface TypeVoucherLedger{
        Type: number;
        Ledger: TypeLedger;
        Debit: number;
        Credit: number
      }

function DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }
