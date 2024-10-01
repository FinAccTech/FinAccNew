import { Observable, Subject} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { ClsTransactions } from "./ClsTransactions";
import { TypeVoucherSeries } from "./ClsVoucherSeries";
import { FileHandle } from "../Types/file-handle";
import { TypeParties } from "./ClsParties";
import { TypePayMode } from "../Types/TypePayMode";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";
import { ClsRepledges, TypeRepledge } from "./ClsRepledges";

@AutoUnsubscribe
export class ClsRpClosures{
    public RpClosure!: TypeRpClosure;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getRpClosures(RpClosureSno: number, FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getRpClosures(RpClosureSno,FromDate, ToDate).subscribe(data => {            
            subject.next(data);
        }) 
        return subject.asObservable(); 
    }

    saveRpClosure(): Observable<TypeHttpResponse>  {   
           
        console.log(this.RpClosure);
        
        var subject = new Subject<TypeHttpResponse>();        

        let trans = new ClsTransactions(this.dataService); 
        let newTrans = trans.Initialize();
        
        newTrans.TransSno               = this.RpClosure.RpClosureSno;
        newTrans.VouTypeSno             = 19;
        newTrans.SeriesSno              = this.RpClosure.Series.SeriesSno;        
        newTrans.Trans_No               = this.RpClosure.RpClosure_No;        
        newTrans.Trans_Date             = this.RpClosure.RpClosure_Date;
        newTrans.Party                  = this.RpClosure.Supplier;
        newTrans.RefSno                 = this.RpClosure.Repledge.RepledgeSno;                
        newTrans.Rec_Principal          = this.RpClosure.Rp_Principal;                                
        newTrans.Rec_Interest           = this.RpClosure.Rp_Interest;                        
        newTrans.Rec_Default_Amt        = this.RpClosure.Rp_Default_Amt;                
        newTrans.Rec_Add_Less           = this.RpClosure.Rp_Add_Less;                
        newTrans.VouSno                 = this.RpClosure.VouSno;                
        
        newTrans.Nett_Payable           = this.RpClosure.Nett_Payable;                
        newTrans.PaymentModesXML        = this.RpClosure.PaymentModesXML;
        newTrans.Remarks               = this.RpClosure.Remarks;        
        newTrans.UserSno               = this.RpClosure.UserSno;
        newTrans.BranchSno             = this.BranchSno;          
        newTrans.ItemDetailXML         = null!;        
        newTrans.ImageDetailXML        = this.RpClosure.ImageDetailXML;
        newTrans.RepledgeLoansXML        = null!;        
        //newTrans.VouDetailXML        = this.RpClosure.VouDetailXML;
        newTrans.fileSource            = this.RpClosure.fileSource;

        trans.Transaction = newTrans;
        trans.saveTransaction().subscribe(data => {
            subject.next(data);
        });        
        return subject.asObservable();
    }

    deleteRpClosure(): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.deleteTransaction(this.RpClosure.RpClosureSno, this.RpClosure.RpClosure_No).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();              
    }


    getRpClosureNumber(SeriesSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionNumber(SeriesSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

   Initialize () { 
    let rp = new ClsRepledges(this.dataService);
		let RpClosure: TypeRpClosure = {
			RpClosureSno: 0,		
            Series: { "SeriesSno":0, "VouType": {"VouTypeSno":19,"VouType_Name": "Repledge Closure"}, "Series_Name": "" },
            RpClosure_No: "",
            RpClosure_Date: DateToInt(new Date()),             
		    Repledge: rp.Initialize() ,
            Supplier: {"PartySno":0,},
            Borrower: {"PartySno":0,},
            Rp_Principal: 0,	
            Rp_Interest: 0,
            Rp_Default_Amt: 0,
            Rp_Add_Less: 0,        
            Nett_Payable: 0,            
            PaymentMode: [],		
            Remarks: "",            
            UserSno: this.UserSno,
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            VouSno: 0,

            ItemDetailXML: "",
            ImageDetailXML: "",
            PaymentModesXML: "",
            PaymentModes_Json: "",
            fileSource: [],		
            Series_Json: "",
            Repledge_Json: "",
            Supplier_Json: "",
            Images_Json: "",
		  }
		  return RpClosure;
	}
}

	export interface TypeRpClosure{        
		RpClosureSno: number;		
		Series: TypeVoucherSeries;
		RpClosure_No: string;
        RpClosure_Date: number;    
        
	    Repledge: TypeRepledge;        
        Supplier: TypeParties;
        Borrower: TypeParties;
		Rp_Principal: number;		
		Rp_Interest: number;		
		Rp_Default_Amt: number;
		Rp_Add_Less: number;
	
		Nett_Payable: number;
		
		PaymentMode: TypePayMode[];		
		Remarks: string;
		
		UserSno: number;
		CompSno: number;
		BranchSno: number;
        VouSno: number;

        ItemDetailXML: string;
		ImageDetailXML: string;        
        PaymentModesXML: string;
        PaymentModes_Json: string,
		fileSource: FileHandle[];		
        Series_Json: string;
        Repledge_Json: string;        
        Supplier_Json: string;
        Images_Json: string;        
	}
	

function DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }