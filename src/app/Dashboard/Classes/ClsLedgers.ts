import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { TypeLedgerGroup } from "./ClsLedgerGroup";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsLedgers{
    public Ledger!: TypeLedger;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){
        
    	}

    getLedgers(LedSno: number, GrpSno: number, ExcludeGrpSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "LedSno" :  LedSno, "GrpSno" : GrpSno,  "CompSno" :  this.CompSno, "ExcludeGrpSno" :  ExcludeGrpSno }; 
        return this.dataService.HttpGet(postdata, "/getLedgers");                
    }
    
    saveLedger(): Observable<TypeHttpResponse> {        
        let postdata = this.Ledger;
        return this.dataService.HttpPost(postdata, "/saveLedger");                        
    }

    deleteLedger(): Observable<TypeHttpResponse> {
        let postdata ={ "LedSno" :  this.Ledger.LedSno }; 
        return this.dataService.HttpPost(postdata, "/deleteLedger");                
    }
    
    getPaymentModes(): Observable<TypeHttpResponse> {
        let postdata ={ "CompSno" :  this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getPaymentModes");                
    }

    getStandardLedgers(): Observable<TypeHttpResponse> {
        let postdata ={ "CompSno" :  this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getStandardLedgers");                
    }
    
    Initialize(){
        let Ledger: TypeLedger = {
            LedSno:0,            
            Led_Code: "AUTO",
            Led_Name: "",
            Group: {"GrpSno":0, "Grp_Code":"", Grp_Name:""},
            OpenSno: 0, 
            Opening_Balance:0,
            AcType: 0,
            Led_Desc: "",
            IsStd: false,   
            Created_Date: DateToInt(new Date()),
            CompSno: this.CompSno,
            UserSno: this.UserSno,            
            Name: "",
            Details:""
        }
        return Ledger
    }
}

export interface TypeLedger{
    LedSno: number;
    Led_Code: string;
    Led_Name: string;    
    Group?: TypeLedgerGroup;
    OpenSno?: number;
    Opening_Balance?: number;
    AcType?: number;
    Led_Desc?: string;    
    IsStd?: boolean; 
    Std_No?: number;   
    Created_Date?: number;    
    CompSno?: number;
    UserSno?: number;    
    Name?: string;
    Details?: string;
}




function DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }

