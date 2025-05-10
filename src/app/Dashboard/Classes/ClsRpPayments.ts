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
export class ClsRpPayments{
    public RpPayment!: TypeRpPayment;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getRpPayments(RpPaymentSno: number, FromDate: number, ToDate: number, Open_Status: number): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getRpPayments(RpPaymentSno,FromDate, ToDate,Open_Status).subscribe(data => {            
            subject.next(data);
        }) 
        return subject.asObservable(); 
    }

    saveRpPayment(): Observable<TypeHttpResponse>  {           
        var subject = new Subject<TypeHttpResponse>();        

        let trans = new ClsTransactions(this.dataService); 
        let newTrans = trans.Initialize();
        
        newTrans.TransSno               = this.RpPayment.RpPaymentSno;
        newTrans.VouTypeSno             = 18;
        newTrans.SeriesSno              = this.RpPayment.Series.SeriesSno;
        newTrans.IsOpen                 = this.RpPayment.IsOpen;
        newTrans.Trans_No               = this.RpPayment.RpPayment_No;        
        newTrans.Trans_Date             = this.RpPayment.RpPayment_Date;
        newTrans.Party                  = this.RpPayment.Supplier;
        newTrans.RefSno                 = this.RpPayment.Repledge.RepledgeSno;                
        newTrans.Rec_Principal          = this.RpPayment.Rp_Principal;                                
        newTrans.Rec_Interest           = this.RpPayment.Rp_Interest;                        
        newTrans.Rec_Default_Amt        = this.RpPayment.Rp_Default_Amt;                
        newTrans.Rec_Add_Less           = this.RpPayment.Rp_Add_Less;                
        newTrans.VouSno                 = this.RpPayment.VouSno;                
        
        newTrans.Nett_Payable           = this.RpPayment.Nett_Payable;                
        newTrans.PaymentModesXML        = this.RpPayment.PaymentModesXML;
        newTrans.Remarks               = this.RpPayment.Remarks;        
        newTrans.UserSno               = this.RpPayment.UserSno;
        newTrans.BranchSno             = this.BranchSno;          
        newTrans.Payment_Status          = this.RpPayment.Payment_Status;
        newTrans.ItemDetailXML         = null!;        
        newTrans.ImageDetailXML        = this.RpPayment.ImageDetailXML;
        newTrans.RepledgeLoansXML        = null!;        
        //newTrans.VouDetailXML        = this.RpPayment.VouDetailXML;
        newTrans.fileSource            = this.RpPayment.fileSource;

        trans.Transaction = newTrans;
        trans.saveTransaction().subscribe(data => {
            subject.next(data);
        });        
        return subject.asObservable();
    }

    deleteRpPayment(): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.deleteTransaction(this.RpPayment.RpPaymentSno, this.RpPayment.RpPayment_No).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();              
    }


    getRpPaymentNumber(SeriesSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionNumber(SeriesSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

   Initialize () { 
    let rp = new ClsRepledges(this.dataService);
		let RpPayment: TypeRpPayment = {
			RpPaymentSno: 0,		
            Series: { "SeriesSno":0, "VouType": {"VouTypeSno":18,"VouType_Name": "Repledge Payment"}, "Series_Name": "" },
            RpPayment_No: "",
            RpPayment_Date: DateToInt(new Date()), 
            IsOpen: 0,
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
            Payment_Status: 1,

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
		  return RpPayment;
	}
}

	export interface TypeRpPayment{        
		RpPaymentSno: number;		
		Series: TypeVoucherSeries;
		RpPayment_No: string;
        RpPayment_Date: number;    
        IsOpen: number;

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
        Payment_Status: number;
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