import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { FileHandle } from "../Types/file-handle";
import { TypeParties } from "./ClsParties";
import { TypePayMode } from "../Types/TypePayMode";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";
import { TypeFileImport } from "../Types/TypeFileImport";

@AutoUnsubscribe
export class ClsTransactions{ 
    public Transaction!: TypeTransaction;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
	private ClientSno: number = JSON.parse (sessionStorage.getItem("sessionLoggedClient")!).ClientSno; 
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!;      
	private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

	getTransactions(TransSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "TransSno" :  TransSno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getTransactions");                
    }

	saveTransaction(): Observable<TypeHttpResponse> {        
		let postdata = this.Transaction;		
        return this.dataService.HttpPost(postdata, "/saveTransaction");                        
    }

    deleteTransaction(TransSno: number, Trans_No: string): Observable<TypeHttpResponse> {
        let postdata ={ "ClientSno": this.ClientSno, "CompSno": this.CompSno, "TransSno" :  TransSno, "Trans_No": Trans_No }; 
        return this.dataService.HttpPost(postdata, "/deleteTransaction");                
    }

	cancelTransaction(TransSno: number, Cancel_Remarks: string): Observable<TypeHttpResponse> {
        let postdata ={ "TransSno" :  TransSno, "Cancel_Remarks": Cancel_Remarks }; 
        return this.dataService.HttpPost(postdata, "/cancelTransaction");                
    }

	getTransactionImages(TransSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "TransSno" :  TransSno}; 
        return this.dataService.HttpGet(postdata, "/getTransactionImages");                
    }
	
	getTransactionDetails(TransSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "TransSno" :  TransSno}; 
        return this.dataService.HttpGet(postdata, "/getTransactionDetails");                
    }

	insertLoan_Payments(LoanSno: number, PaymentsXML: string): Observable<TypeHttpResponse> {        		
        let postdata = {"LoanSno": LoanSno, "PaymentsXML": PaymentsXML}
        return this.dataService.HttpPost(postdata, "/insertLoan_Payments");                        
    }

	getLoan_Payments(LoanSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "LoanSno" :  LoanSno}; 
        return this.dataService.HttpGet(postdata, "/getLoan_Payments");                
    }

	getTransactionNumber(SeriesSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "SeriesSno" :  SeriesSno}; 
        return this.dataService.HttpGet(postdata, "/getTransactionNumber");                
    }

	getLoans(LoanSno: number, FromDate: number, ToDate: number, Loan_Status: number, Approval_Status: number, Cancel_Status: number, Open_Status: number): Observable<TypeHttpResponse> {
        let postdata ={ "BranchSno": this.BranchSno, "LoanSno" :  LoanSno, "CompSno" : this.CompSno, "FromDate": FromDate, "ToDate": ToDate, "Loan_Status": Loan_Status, "Approval_Status": Approval_Status, "Cancel_Status": Cancel_Status, "Open_Status" : Open_Status }; 
        return this.dataService.HttpGet(postdata, "/getLoans");                
    }

	getLoanMasters(): Observable<TypeHttpResponse> {
		let postdata ={ CompSno: this.CompSno, "BranchSno": this.BranchSno  }; 
        return this.dataService.HttpGet(postdata, "/getLoanMasters");  
	}
	
	getLoansforRepledge(): Observable<TypeHttpResponse> {
		let postdata ={ CompSno: this.CompSno, BranchSno: this.BranchSno  }; 
        return this.dataService.HttpGet(postdata, "/getLoansforRepledge");  
	}

	getRepledgeMasters(): Observable<TypeHttpResponse> {
		let postdata ={ BranchSno:this.BranchSno, CompSno: this.CompSno  }; 
        return this.dataService.HttpGet(postdata, "/getRepledgeMasters");  
	}

	updateStatus(Updation_Type: number, Document_Type: number, TransSno: number, UserSno: number, Remarks: string ): Observable<TypeHttpResponse> {
        let postdata ={ "Updation_Type" :  Updation_Type, "Document_Type": Document_Type,  "TransSno": TransSno, "UserSno": UserSno, "Remarks": Remarks}; 
        return this.dataService.HttpGet(postdata, "/updateStatus");                
    }

	getReceipts(ReceiptSno: number, FromDate: number, ToDate: number, Open_Status: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno:this.BranchSno, "ReceiptSno" :  ReceiptSno, "CompSno" : this.CompSno, "FromDate": FromDate, "ToDate": ToDate , "Open_Status" : Open_Status }; 
        return this.dataService.HttpGet(postdata, "/getReceipts");                
    }

	getRedemptions(RedemptionSno: number, FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={BranchSno:this.BranchSno, "RedemptionSno" :  RedemptionSno, "CompSno" : this.CompSno, "FromDate": FromDate, "ToDate": ToDate  }; 
        return this.dataService.HttpGet(postdata, "/getRedemptions");                
    }
	
	getAuctionEntries(AuctionSno: number, FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={BranchSno:this.BranchSno, "AuctionSno" :  AuctionSno, "CompSno" : this.CompSno, "FromDate": FromDate, "ToDate": ToDate  }; 
        return this.dataService.HttpGet(postdata, "/getAuctionEntries");                
    }

	getRepledges(RepledgeSno: number, FromDate: number, ToDate: number, Repledge_Status: number, Cancel_Status: number, Open_Status: number ): Observable<TypeHttpResponse> {
        let postdata ={BranchSno:this.BranchSno, "RepledgeSno" :  RepledgeSno, "CompSno" : this.CompSno, "FromDate": FromDate, "ToDate": ToDate, "Repledge_Status": Repledge_Status, "Cancel_Status": Cancel_Status, "Open_Status" : Open_Status }; 
        return this.dataService.HttpGet(postdata, "/getRepledges");                
    }

	getRpPayments(RpPaymentSno: number, FromDate: number, ToDate: number, Open_Status: number ): Observable<TypeHttpResponse> {
        let postdata ={BranchSno:this.BranchSno, "RpPaymentSno" :  RpPaymentSno, "CompSno" : this.CompSno, "FromDate": FromDate, "ToDate": ToDate,"Open_Status" : Open_Status }; 
        return this.dataService.HttpGet(postdata, "/getRpPayments");                
    }

	getRpClosures(RpClosureSno: number, FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={BranchSno:this.BranchSno, "RpClosureSno" :  RpClosureSno, "CompSno" : this.CompSno, "FromDate": FromDate, "ToDate": ToDate}; 
        return this.dataService.HttpGet(postdata, "/getRpClosures");                
    }

	getStatusCard(StatusType: number): Observable<TypeHttpResponse> {
        let postdata ={BranchSno:this.BranchSno, "StatusType" :  StatusType, "CompSno" : this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getStatusCard");                
    }

	getRecentTransactions(): Observable<TypeHttpResponse> {
        let postdata ={BranchSno:this.BranchSno, "CompSno" : this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getRecentTransactions");                
    }

	getSummedMonthlyLoanAmount(Period: number): Observable<TypeHttpResponse> {
		let postdata ={BranchSno:this.BranchSno, "Period": Period, "CompSno" : this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getSummedMonthlyLoanAmount");                
    }

	repostVouchers(): Observable<TypeHttpResponse> {
        let postdata ={ "CompSno" :  this.CompSno}; 
        return this.dataService.HttpPost(postdata, "/repostVouchers");                
    }

	importLoan(importData: TypeFileImport): Observable<TypeHttpResponse> {        
		let postdata = importData;		
        return this.dataService.HttpPost(postdata, "/importLoan");                        
    }

	// getLoansList(): Observable<TypeHttpResponse> {
	// 	let postdata ={ "CompSno" : this.CompSno }; 
    //     return this.dataService.HttpGet(postdata, "/getLoansList");                
    // }

	// getReceiptsList(): Observable<TypeHttpResponse> {
	// 	let postdata ={ "CompSno" : this.CompSno }; 
    //     return this.dataService.HttpGet(postdata, "/getReceiptsList");                
    // }

	// getRedemptionsList(): Observable<TypeHttpResponse> {
	// 	let postdata ={ "CompSno" : this.CompSno }; 
    //     return this.dataService.HttpGet(postdata, "/getRedemptionsList");                
    // }

	Initialize () { 
		let Transaction: TypeTransaction = {
			TransSno: 0,
			VouTypeSno:0,
			SeriesSno:0,
			Trans_No: "",  
			IsOpen: 0,
			Ref_No: "",
			BorrowerSno: 0,  
			Trans_Date: 0,
			Party: {"PartySno":0},
			Borrower: {"PartySno":0},
			SchemeSno: 0,
			GrpSno: 0,
			TotQty: 0,
			TotGrossWt: 0,
			TotNettWt: 0,
			TotPureWt: 0,
			Market_Value: 0,

			Market_Rate: 0,
			Loan_PerGram: 0,

			Principal: 0,
			Roi: 0,
			AdvIntDur: 0,
			AdvIntAmt: 0,
			DocChargesPer: 0,
			DocChargesAmt: 0,        

			Emi_Due_Amt: 0,
			OrgEmi_Due_Amt: 0,
			Due_Start_Date: 0,
			Emi_Principal:0,
            Emi_Interest:0,

			RefSno: 0,
			Rec_Principal: 0,
			Rec_IntMonths: 0,
			Rec_IntDays: 0,
			Rec_Interest: 0,
			Rec_Other_Credits: 0,
			Rec_Other_Debits: 0,
			Rec_Default_Amt: 0,
			Rec_Add_Less: 0,      
			Rec_DuesCount:0,
			Rec_DueAmount:0,
			
			Red_Method: 0,
			Nett_Payable: 0,
			Mature_Date: 0,
			PayMode: [],
			LocationSno: 0,
			AgentSno:0,
			Remarks: "",
			Approval_Status: 0,
			Loan_Status: 0,
			VouSno:0,
			UserSno: this.UserSno,
			CompSno: this.CompSno,
            BranchSno: this.BranchSno,
			ItemDetailXML: "",
			ImageDetailXML: "",
			RepledgeLoansXML: "",
			PaymentModesXML: "",
			fileSource: [],
			ClientSno: this.ClientSno,
		  }
		  return Transaction;
	}
}

	export interface TypeTransaction{
		TransSno: number;
		VouTypeSno: number;
		SeriesSno: number;
		Trans_No: string;
		IsOpen: number;
	  /*FOR REPLEDGE */
		Ref_No: string;
		BorrowerSno: number;
	
		Trans_Date: number;
		Party: TypeParties;
		Borrower: TypeParties;
		SchemeSno: number;

		GrpSno: number;
		TotQty: number;
		TotGrossWt: number;
		TotNettWt: number;
		TotPureWt: number;
		Market_Value: number;

		Market_Rate: number;
		Loan_PerGram: number;

		Principal: number;
		Roi: number;
		AdvIntDur: number;
		AdvIntAmt: number;
		DocChargesPer: number;
		DocChargesAmt: number;
		
		Emi_Due_Amt: number;
		OrgEmi_Due_Amt: number;
		Due_Start_Date: number;
		Emi_Principal: number;
		Emi_Interest: number;
		/* FOR RECEIPT */
		RefSno: number;
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
		Mature_Date: number;
		PayMode: TypePayMode[];
		LocationSno: number; 
		AgentSno: number; 
		Remarks: string;
		Approval_Status: number;
		Loan_Status: number;
		VouSno: number;
		UserSno: number;
		CompSno: number;
		BranchSno: number;

		ItemDetailXML: string;
		ImageDetailXML: string;
		RepledgeLoansXML: string;
		PaymentModesXML : string;
		fileSource: FileHandle[];
		ClientSno: number;
	}
	


