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
export class ClsRedemptions{
    public Redemption!: TypeRedemption;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getRedemptions(RedemptionSno: number, FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getRedemptions(RedemptionSno, FromDate, ToDate).subscribe(data => {            
            subject.next(data);
        }) 
        return subject.asObservable(); 
    }

    saveRedemption(): Observable<TypeHttpResponse>  {   
           
        var subject = new Subject<TypeHttpResponse>();        

        let trans = new ClsTransactions(this.dataService); 
        let newTrans = trans.Initialize();
        
        newTrans.TransSno              = this.Redemption.RedemptionSno;
        newTrans.VouTypeSno                = 14;
        newTrans.SeriesSno             = this.Redemption.Series.SeriesSno;
        newTrans.Trans_No              = this.Redemption.Redemption_No;        
        newTrans.Trans_Date            = this.Redemption.Redemption_Date;
        newTrans.Party                  = this.Redemption.Customer;
        newTrans.RefSno                = this.Redemption.Loan.LoanSno;                
        newTrans.Rec_Principal         = this.Redemption.Rec_Principal;                
        newTrans.Rec_IntMonths          = this.Redemption.Rec_IntMonths;                
        newTrans.Rec_IntDays            = this.Redemption.Rec_IntDays;                
        newTrans.Rec_Interest           = this.Redemption.Rec_Interest;                
        newTrans.Rec_Other_Credits      = this.Redemption.Rec_Other_Credits;                
        newTrans.Rec_Other_Debits       = this.Redemption.Rec_Other_Debits;                
        newTrans.Rec_Default_Amt        = this.Redemption.Rec_Default_Amt;                
        newTrans.Rec_Add_Less           = this.Redemption.Rec_Add_Less;         
        newTrans.VouSno                 = this.Redemption.VouSno;                       

        /*FOR REDEMPTION */
        newTrans.Red_Method             = this.Redemption.Red_Method;                
        newTrans.Nett_Payable           = this.Redemption.Nett_Payable;                

        newTrans.PaymentModesXML        = this.Redemption.PaymentModesXML;  
        newTrans.Remarks               = this.Redemption.Remarks;        
        newTrans.UserSno               = this.Redemption.UserSno;
        newTrans.BranchSno             = this.BranchSno;          
        newTrans.ItemDetailXML         = this.Redemption.ItemDetailXML;        
        newTrans.ImageDetailXML        = this.Redemption.ImageDetailXML;
        newTrans.RepledgeLoansXML        = null!;        
        //newTrans.VouDetailXML        = this.Redemption.VouDetailXML;
        newTrans.fileSource            = this.Redemption.fileSource;

        trans.Transaction = newTrans;
        trans.saveTransaction().subscribe(data => {
            subject.next(data);
        });        
        return subject.asObservable();
    }

    deleteRedemption(): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.deleteTransaction(this.Redemption.RedemptionSno, this.Redemption.Redemption_No).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();              
    }


    getRedemptionNumber(SeriesSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionNumber(SeriesSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

   Initialize () { 
    let ln = new ClsLoans(this.dataService);
		let Redemption: TypeRedemption = {
			RedemptionSno: 0,		
            Series: { "SeriesSno":0, "VouType": {"VouTypeSno":14,"VouType_Name": "Loan Redemption"}, "Series_Name": "" },
            Redemption_No: "",
            Redemption_Date: DateToInt(new Date()), 
            				
		/* FOR Redemption */
		    Loan: ln.Initialize() ,            
            Loan_No: "",
            Customer: {"PartySno":0},
            Customer_Name: "",
            Rec_Principal: 0,
		    Rec_IntMonths: 0,
		    Rec_IntDays: 0,
		    Rec_Interest: 0,
		    Rec_Other_Credits: 0,
		    Rec_Other_Debits: 0,
		    Rec_Default_Amt: 0,
		    Rec_Add_Less: 0,
	
	  /*FOR REDEMPTION */
		    Red_Method: 0,
		    Nett_Payable: 0,
		
		    PaymentMode: [],		
		    Remarks: "",
            VouSno: 0,
		    UserSno: this.UserSno,
		    CompSno: this.CompSno,
		    BranchSno: this.BranchSno,
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
		  return Redemption;
	}
}

	export interface TypeRedemption{        
		RedemptionSno: number;		
		Series: TypeVoucherSeries;
		Redemption_No: string;
        Redemption_Date: number;    
        
		/* FOR Redemption */
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
	
	  /*FOR REDEMPTION */
		Red_Method: number;  
		Nett_Payable: number;
		
		PaymentMode: TypePayMode[];		
		Remarks: string;
		
        VouSno: number;
		UserSno: number;
		CompSno: number;
		BranchSno: number;

        ItemDetailXML: string;
        Item_Details: string;
		ImageDetailXML: string;
        //VouDetailXML: string;
        PaymentModesXML: string;
        PaymentModes_Json: string;
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