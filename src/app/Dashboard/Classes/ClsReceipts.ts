import { Observable, Subject} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { ClsTransactions } from "./ClsTransactions";
import { TypeVoucherSeries } from "./ClsVoucherSeries";
import { FileHandle } from "../Types/file-handle";
import { ClsLoans, TypeLoan } from "./ClsLoan";
import { TypeParties } from "./ClsParties";
import { TypePayMode } from "../Types/TypePayMode";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsReceipts{
    public Receipt!: TypeReceipt;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getReceipts(ReceiptSno: number, FromDate: number, ToDate: number, Open_Status: number): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getReceipts(ReceiptSno,FromDate, ToDate, Open_Status).subscribe(data => {            
            subject.next(data);
        }) 
        return subject.asObservable(); 
    }

    saveReceipt(): Observable<TypeHttpResponse>  {   
           
        var subject = new Subject<TypeHttpResponse>();        

        let trans = new ClsTransactions(this.dataService); 
        let newTrans = trans.Initialize();
        
        newTrans.TransSno               = this.Receipt.ReceiptSno;
        newTrans.VouTypeSno             = 13;
        newTrans.SeriesSno              = this.Receipt.Series.SeriesSno;
        newTrans.IsOpen                 = this.Receipt.IsOpen;
        newTrans.Trans_No               = this.Receipt.Receipt_No;        
        newTrans.Trans_Date             = this.Receipt.Receipt_Date;
        newTrans.Party                  = this.Receipt.Customer;
        newTrans.RefSno                 = this.Receipt.Loan.LoanSno;                
        newTrans.Rec_Principal          = this.Receipt.Rec_Principal;                
        newTrans.Rec_IntMonths          = this.Receipt.Rec_IntMonths;                
        newTrans.Rec_IntDays            = this.Receipt.Rec_IntDays;                
        newTrans.Rec_Interest           = this.Receipt.Rec_Interest;                
        newTrans.Rec_Other_Credits      = this.Receipt.Rec_Other_Credits;                
        newTrans.Rec_Other_Debits       = this.Receipt.Rec_Other_Debits;                
        newTrans.Rec_Default_Amt        = this.Receipt.Rec_Default_Amt;                
        newTrans.Rec_Add_Less           = this.Receipt.Rec_Add_Less;                
        newTrans.Rec_DuesCount           = this.Receipt.Rec_DuesCount;                        
        newTrans.Rec_DueAmount           = this.Receipt.Rec_DueAmount;                
        newTrans.VouSno                 = this.Receipt.VouSno;                

        /*FOR REDEMPTION */
        newTrans.Red_Method             = this.Receipt.Red_Method;                
        newTrans.Nett_Payable           = this.Receipt.Nett_Payable;                

        newTrans.PaymentModesXML        = this.Receipt.PaymentModesXML;
        newTrans.Remarks               = this.Receipt.Remarks;        
        newTrans.UserSno               = this.Receipt.UserSno;
        newTrans.BranchSno             = this.BranchSno;          
        newTrans.Payment_Status         = this.Receipt.Payment_Status;
        newTrans.ItemDetailXML         = this.Receipt.ItemDetailXML;        
        newTrans.ImageDetailXML        = this.Receipt.ImageDetailXML;
        newTrans.RepledgeLoansXML        = null!;        
        //newTrans.VouDetailXML        = this.Receipt.VouDetailXML;
        newTrans.fileSource            = this.Receipt.fileSource;

        trans.Transaction = newTrans;
        trans.saveTransaction().subscribe(data => {
            subject.next(data);
        });        
        return subject.asObservable();
    }

    deleteReceipt(): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.deleteTransaction(this.Receipt.ReceiptSno, this.Receipt.Receipt_No).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();              
    }


    getReceiptNumber(SeriesSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionNumber(SeriesSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

   Initialize () { 
    let ln = new ClsLoans(this.dataService);
		let Receipt: TypeReceipt = {
			ReceiptSno: 0,		
            Series: { "SeriesSno":0, "VouType": {"VouTypeSno":13,"VouType_Name": "Loan Receipt"}, "Series_Name": "" },
            Receipt_No: "",
            Receipt_Date: DateToInt(new Date()), 
            IsOpen: 0,

		/* FOR RECEIPT */
		    Loan: ln.Initialize() ,
            Loan_No: "",
            Customer: {"PartySno":0,},
            Customer_Name: "",
            Rec_Principal: 0,
		    Rec_IntMonths: 0,
		    Rec_IntDays: 0,
		    Rec_Interest: 0,
		    Rec_Other_Credits: 0,
		    Rec_Other_Debits: 0,
		    Rec_Default_Amt: 0,
		    Rec_Add_Less: 0,
            Rec_DuesCount: 0,
            Rec_DueAmount: 0,
	  /*FOR REDEMPTION */
		    Red_Method: 0,
		    Nett_Payable: 0,
		
		    PaymentMode: [],
		    Remarks: "",
		
            VouSno: 0,
		    UserSno: this.UserSno,
		    CompSno: this.CompSno,
		    BranchSno: this.BranchSno,
            Payment_Status: 1,
            ItemDetailXML: "",
            Item_Details: "",
		    ImageDetailXML: "",
            //VouDetailXML: "",
            PaymentModesXML: "",
            PaymentModes_Json: "",
		    fileSource: [],		  
            Series_Json: "",
            Loans_Json: "",              
            Images_Json: "",

		  }
		  return Receipt;
	}
}

	export interface TypeReceipt{        
		ReceiptSno: number;		
		Series: TypeVoucherSeries;
		Receipt_No: string;
        Receipt_Date: number;    
        IsOpen: number;

		/* FOR RECEIPT */
		Loan: TypeLoan;
        Loan_No: string;
        Customer: TypeParties;
        Customer_Name: string;
		Rec_Principal: number;
		Rec_IntMonths: number;
		Rec_IntDays: number;
		Rec_Interest: number;
		Rec_Other_Credits: number;
		Rec_Other_Debits: number;
		Rec_Default_Amt: number;
		Rec_Add_Less: number;
        Rec_DuesCount: number;
        Rec_DueAmount: number;
	
	  /*FOR REDEMPTION */
		Red_Method: number;  
		Nett_Payable: number;
		
		PaymentMode: TypePayMode[];
		
		Remarks: string;
		
		UserSno: number;
		CompSno: number;
		BranchSno: number;
        Payment_Status: number;
        VouSno: number;

        ItemDetailXML: string;
        Item_Details: string;
		ImageDetailXML: string;
        //VouDetailXML: string;
        PaymentModesXML: string;
        PaymentModes_Json: string,
		fileSource: FileHandle[];		
        Series_Json: string;
        Loans_Json: string;        
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