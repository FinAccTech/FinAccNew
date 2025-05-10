import { Observable, Subject} from "rxjs";
import { TypeParties } from "./ClsParties";
import { TypeScheme } from "./ClsSchemes";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { ClsTransactions } from "./ClsTransactions";
import { TypeVoucherSeries } from "./ClsVoucherSeries";
import { TypeLocation } from "./ClsLocations";
import { FileHandle } from "../Types/file-handle";
import { TypePayMode } from "../Types/TypePayMode";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsRepledges{
    public Repledge!: TypeRepledge;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getRepledges(RepledgeSno: number, FromDate: number, ToDate: number, Repledge_Status: number, Cancel_Status: number, Open_Status: number): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getRepledges(RepledgeSno, FromDate, ToDate, Repledge_Status,Cancel_Status, Open_Status).subscribe(data => {
            subject.next(data);
        }) 
        return subject.asObservable();              
    }

    saveRepledge(): Observable<TypeHttpResponse>  {              
        var subject = new Subject<TypeHttpResponse>();        
        let trans = new ClsTransactions(this.dataService);
        let newTrans = trans.Initialize();

        newTrans.TransSno              = this.Repledge.RepledgeSno;
        newTrans.VouTypeSno            = 17;
        newTrans.SeriesSno             = this.Repledge.Series.SeriesSno;
        newTrans.Trans_No              = this.Repledge.Repledge_No;
        newTrans.Ref_No                = this.Repledge.Ref_No;
        newTrans.IsOpen                = this.Repledge.IsOpen;
        newTrans.Trans_Date            = this.Repledge.Repledge_Date;
        newTrans.Party                 = this.Repledge.Supplier;
        newTrans.Borrower              = this.Repledge.Borrower;
        newTrans.SchemeSno             = this.Repledge.Scheme.SchemeSno;
        newTrans.GrpSno                = 0;
        newTrans.TotQty                = this.Repledge.TotQty;
        newTrans.TotGrossWt            = this.Repledge.TotGrossWt;
        newTrans.TotNettWt             = this.Repledge.TotNettWt;
        newTrans.Market_Value          = this.Repledge.Market_Value;
        newTrans.Principal             = this.Repledge.Principal;
        newTrans.Roi                   = this.Repledge.Roi;
        newTrans.AdvIntDur             = 0;
        newTrans.AdvIntAmt             = 0;
        newTrans.DocChargesPer         = this.Repledge.DocChargesPer;
        newTrans.DocChargesAmt         = this.Repledge.DocChargesAmt;
        newTrans.Nett_Payable          = this.Repledge.Nett_Payable;
        newTrans.Mature_Date           = this.Repledge.Mature_Date;
        newTrans.PayMode               = this.Repledge.PaymentMode;
        newTrans.LocationSno           = 0;
        newTrans.Remarks               = this.Repledge.Remarks;
        newTrans.Approval_Status       = 0;        
        newTrans.VouSno                = this.Repledge.VouSno;
        newTrans.UserSno               = this.Repledge.UserSno;
        newTrans.BranchSno             = this.BranchSno;
        newTrans.Payment_Status          = this.Repledge.Payment_Status;
        newTrans.ItemDetailXML         = null!;
        newTrans.RepledgeLoansXML      = this.Repledge.RepledgeLoansXML;
        newTrans.ImageDetailXML        = this.Repledge.ImageDetailXML;        
        newTrans.PaymentModesXML       = this.Repledge.PaymentModesXML;
        newTrans.fileSource            = this.Repledge.fileSource;

        trans.Transaction = newTrans;
        trans.saveTransaction().subscribe(data => {
            subject.next(data);
        });        
        return subject.asObservable();
    }

    deleteRepledge(): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.deleteTransaction(this.Repledge.RepledgeSno, this.Repledge.Repledge_No).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();             
    }

    getRepledgeImages(RepledgeSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionImages(RepledgeSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

    getRepledgeMasters(): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getRepledgeMasters().subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

    getRepledgeItemDetails(RepledgeSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionDetails(RepledgeSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

    getRepledgeNumber(SeriesSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionNumber(SeriesSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }
 
   Initialize () { 
		let Repledge: TypeRepledge = {
			RepledgeSno: 0,			            
            Series: { "SeriesSno":0,"VouType": {"VouTypeSno":17,"VouType_Name": "Repledge"}, "Series_Name": "" },
            Repledge_No: "",
            IsOpen: 0,
            Ref_No: "",
            Repledge_Date: DateToInt(new Date()),
            Supplier: {"PartySno": 0},
            Borrower: {"PartySno": 0},
            Scheme: {"SchemeSno": 0},            
            TotQty: 0,
            TotGrossWt: 0,
            TotNettWt: 0,
            Market_Value: 0,
            Principal: 0,
            Roi: 0,                        
            DocChargesPer: 0,
            DocChargesAmt: 0,
            Nett_Payable: 0,
            Mature_Date: DateToInt(new Date()),            
            Location: {"LocationSno":0},
            Remarks: "",            
            Cancel_Status: 0,
            Cancel_Date: 0,
            Cancel_Remarks: "",
            Repledge_Status: 1,                 
            RepledgeLoan_Details: "",
            RepledgeLoansXML: "",
            ImageDetailXML: "",
            Repledge_Image: "",
            VouDetailXML: "",  
            PaymentModesXML: "",      
            fileSource: [],
            VouSno: 0,
            UserSno: this.UserSno,       
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            Payment_Status: 1,
            Series_Json: "",
            Party_Json: "",
            Borrower_Json: "",
            Scheme_Json:"",                                    
            RepledgeLoans_Json: "",        
            PaymentModes_Json: "",
            PaymentMode: [],
            
            Images_Json: "",
            Name: "",
            Details: ""
		  }
		  return Repledge;
	}
}
	export interface TypeRepledge{
		RepledgeSno: number;		
        Series: TypeVoucherSeries;
        Repledge_No: string;
        IsOpen: number;
        Ref_No: string;
        Repledge_Date: number;
        Supplier: TypeParties;
        Borrower: TypeParties;
        Scheme: TypeScheme;        
        TotQty: number;
        TotGrossWt: number;
        TotNettWt: number;
        Market_Value: number;
        Principal: number;
        Roi: number;        
        DocChargesPer: number;
        DocChargesAmt: number;
        Nett_Payable: number;
        Mature_Date: number;        
        Location: TypeLocation;
        Remarks: string;        
        Cancel_Status: number;
        Cancel_Date: number;
        Cancel_Remarks: string;
        Repledge_Status: number;
        VouSno: number;
        UserSno: number;
        CompSno: number;
        BranchSno: number;
        Payment_Status: number;

        RepledgeLoan_Details: string;
        RepledgeLoansXML: string;
        ImageDetailXML: string;        
        Repledge_Image: string;
        VouDetailXML: string;        
        PaymentModesXML: string;
        fileSource: FileHandle[];
        Series_Json: string;
        Party_Json: string;
        Borrower_Json: string;
        Scheme_Json: string;                        
        RepledgeLoans_Json: string;    
        PaymentMode: TypePayMode[];
        PaymentModes_Json: string;        
        Images_Json: string;
        Name: string;
        Details: string;
	}
	
    export interface TypeRepledgeSummary extends TypeRepledge {
        Interest_Balance: number;
        Principal_Balance: number;
        Last_Payment_Date: number;
        Ason_Duration_Months: number;
        Ason_Duration_Days: number;
        Struc_Json: string;
        Statement_Json: string;
    }

function DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }
