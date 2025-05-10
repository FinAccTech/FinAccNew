import { Observable, Subject} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { ClsTransactions } from "./ClsTransactions";
import { TypeVoucherSeries } from "./ClsVoucherSeries";
import { FileHandle } from "../Types/file-handle";
import { ClsLoans, TypeLoan } from "./ClsLoan";
import { TypePayMode } from "../Types/TypePayMode";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsAuctionEntries{
    public Auction!: TypeAuctionEntry;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getAuctions(AuctionSno: number, FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getAuctionEntries(AuctionSno, FromDate, ToDate).subscribe(data => {
            subject.next(data);
        }) 
        return subject.asObservable();              
    }

    saveAuction(): Observable<TypeHttpResponse>  {              
        var subject = new Subject<TypeHttpResponse>();        
        let trans = new ClsTransactions(this.dataService);
        let newTrans = trans.Initialize();
        
        newTrans.TransSno              = this.Auction.AuctionSno;
        newTrans.VouTypeSno            = 15;
        newTrans.SeriesSno             = this.Auction.Series.SeriesSno;
        newTrans.Trans_No              = this.Auction.Auction_No;
        newTrans.Trans_Date            = this.Auction.Auction_Date;
        newTrans.RefSno                 = this.Auction.Loan.LoanSno;                
        newTrans.Market_Value          = this.Auction.Market_Value;        
        newTrans.Nett_Payable          = this.Auction.Auction_Amount;
        
        newTrans.PayMode                = this.Auction.PaymentMode;        
        newTrans.Remarks               = this.Auction.Remarks;
        newTrans.Approval_Status       = this.Auction.Approval_Status;        
        newTrans.VouSno               = this.Auction.VouSno;
        newTrans.UserSno               = this.Auction.UserSno;
        newTrans.BranchSno             = this.BranchSno;        
        newTrans.Payment_Status          = this.Auction.Payment_Status;
        newTrans.ItemDetailXML        = this.Auction.ItemDetailXML;
        newTrans.ImageDetailXML        = this.Auction.ImageDetailXML;
        newTrans.RepledgeLoansXML        = null!;        
        //newTrans.VouDetailXML        = this.Auction.VouDetailXML;
        newTrans.fileSource            = this.Auction.fileSource;

        trans.Transaction = newTrans;
        trans.saveTransaction().subscribe(data => {
            subject.next(data);
        });        
        return subject.asObservable();
    }

    deleteAuction(): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.deleteTransaction(this.Auction.AuctionSno, this.Auction.Auction_No).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();              
    }

    cancelAuction(AuctionSno: number, Cancel_Remarks: string): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.cancelTransaction(AuctionSno, Cancel_Remarks).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();              
    }


    getAuctionImages(AuctionSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionImages(AuctionSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

      getAuctionNumber(SeriesSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionNumber(SeriesSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

   Initialize () { 
    let ln = new ClsLoans(this.dataService);
		let Auction: TypeAuctionEntry = {
			AuctionSno: 0,			            
            Series: { "SeriesSno":0,"VouType": {"VouTypeSno":15,"VouType_Name": "Auction Entry"}, "Series_Name": "" },
            Auction_No: "",
            Loan: ln.Initialize() ,            
            Ref_No: "",
            Auction_Date:  DateToInt(new Date()),             
            Market_Value: 0,
            Auction_Amount: 0,
            PaymentMode: [],
            Remarks: "",
            Approval_Status: 0,
            Cancel_Status: 0,
            Cancel_Date: 0,
            Cancel_Remarks: "",            
            fileSource: [],
            VouSno: 0,
            UserSno: this.UserSno,
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            Payment_Status: 1,
            ItemDetailXML: "",            
            ImageDetailXML: "",     
            //VouDetailXML: "",       
            Series_Json: "",
            PaymentModesXML: "",      
            PaymentModes_Json: "",
            Images_Json: "",
            Name: "",
            Details: "",
		  }
		  return Auction;
	}
}

	export interface TypeAuctionEntry{
		AuctionSno: number;		
        Series: TypeVoucherSeries;
        Auction_No: string;
        Auction_Date: number;
        Loan: TypeLoan;
        Ref_No: string;                
        Market_Value: number;        
        Auction_Amount: number;        
        PaymentMode: TypePayMode[];        
        Remarks: string;
        Approval_Status: number;
        Cancel_Status: number;
        Cancel_Date: number;
        Cancel_Remarks: string;      
        VouSno: number;  
        UserSno: number;
        CompSno: number;
        BranchSno: number;
        Payment_Status: number;  
        ItemDetailXML: string;        
        ImageDetailXML: string;        
        //VouDetailXML: string;
        fileSource: FileHandle[];
        Series_Json: string;  
        PaymentModesXML: string;      
        PaymentModes_Json: string;    
        Images_Json: string;
        Name: string;
        Details: string;
	}
	

function DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }
