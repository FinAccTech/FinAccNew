import { Observable, Subject} from "rxjs";
import { TypeParties } from "./ClsParties";
import { TypeScheme } from "./ClsSchemes";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { ClsTransactions } from "./ClsTransactions";
import { TypeItemGroup } from "./ClsItemGroups";
import { TypeVoucherSeries } from "./ClsVoucherSeries";
import { TypeLocation } from "./ClsLocations";
import { FileHandle } from "../Types/file-handle";
import { TypePayMode } from "../Types/TypePayMode";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";
import { TypeAgent } from "./ClsAgents";

@AutoUnsubscribe
export class ClsLoans{
    public Loan!: TypeLoan;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    // getLoans(LoanSno: number, FromDate: number, ToDate: number, Loan_Status: number, Approval_Status: number, Cancel_Status: number, Open_Status: number): Observable<TypeHttpResponse> {
    //     var subject = new Subject<TypeHttpResponse>();  
    //     let trans = new ClsTransactions(this.dataService);
    //     trans.getLoans(LoanSno, FromDate, ToDate, Loan_Status, Approval_Status,Cancel_Status, Open_Status).subscribe(data => {
    //         subject.next(data);
    //     }) 
    //     return subject.asObservable();              
    // }

    
    getLoanBySno(LoanSno: number, FromDate: number, ToDate: number, Loan_Status: number, Approval_Status: number, Cancel_Status: number, Open_Status: number): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getLoans(LoanSno, FromDate, ToDate, Loan_Status, Approval_Status,Cancel_Status, Open_Status).subscribe(data => {
            subject.next(data);
        }) 
        return subject.asObservable();              
    }

    getLoanbySearch(Search_String: string, Loan_Status: number, Approval_Status: number, Cancel_Status: number, Open_Status: number): Observable<TypeHttpResponse> {
        let postdata ={ "BranchSno": this.BranchSno, "CompSno" : this.CompSno, "Search_String": Search_String, "Loan_Status": Loan_Status, "Approval_Status": Approval_Status, "Cancel_Status": Cancel_Status, "Open_Status" : Open_Status }; 
        return this.dataService.HttpGet(postdata, "/getLoanbySearch");                
    }


    saveLoan(): Observable<TypeHttpResponse>  {              
        var subject = new Subject<TypeHttpResponse>();        
        let trans = new ClsTransactions(this.dataService);
        let newTrans = trans.Initialize();

        newTrans.TransSno               = this.Loan.LoanSno;
        newTrans.VouTypeSno             = 12;
        newTrans.SeriesSno              = this.Loan.Series.SeriesSno;
        newTrans.Trans_No               = this.Loan.Loan_No;
        newTrans.Ref_No                 = this.Loan.Ref_No;
        newTrans.IsOpen                 = this.Loan.IsOpen;
        newTrans.Trans_Date             = this.Loan.Loan_Date;
        newTrans.Party                  = this.Loan.Customer;
        newTrans.SchemeSno              = this.Loan.Scheme.SchemeSno;
        newTrans.GrpSno                 = this.Loan.IGroup.GrpSno;
        newTrans.Market_Rate            = this.Loan.IGroup.Market_Rate!;
        newTrans.Loan_PerGram           = this.Loan.IGroup.Loan_PerGram!;
        newTrans.TotQty                 = this.Loan.TotQty;
        newTrans.TotGrossWt             = this.Loan.TotGrossWt;
        newTrans.TotNettWt              = this.Loan.TotNettWt;
        newTrans.TotPureWt              = this.Loan.TotPureWt;
        newTrans.Market_Value           = this.Loan.Market_Value;
        newTrans.Principal              = this.Loan.Principal;
        newTrans.Roi                    = this.Loan.Roi;
        newTrans.AdvIntDur              = this.Loan.AdvIntDur;
        newTrans.AdvIntAmt              = this.Loan.AdvIntAmt;
        newTrans.DocChargesPer          = this.Loan.DocChargesPer;
        newTrans.DocChargesAmt          = this.Loan.DocChargesAmt;
        newTrans.Emi_Due_Amt            = this.Loan.Emi_Due_Amt;
        newTrans.OrgEmi_Due_Amt         = this.Loan.OrgEmi_Due_Amt;
        newTrans.Due_Start_Date         = this.Loan.Due_Start_Date;
        newTrans.Emi_Principal          = this.Loan.Emi_Principal;
        newTrans.Emi_Interest           = this.Loan.Emi_Interest;
        newTrans.Nett_Payable           = this.Loan.Nett_Payable;
        newTrans.Mature_Date            = this.Loan.Mature_Date;
        newTrans.PayMode                = this.Loan.PaymentMode;
        newTrans.LocationSno            = this.Loan.Location.LocationSno;
        newTrans.AgentSno               = this.Loan.Agent.AgentSno;
        newTrans.Remarks                = this.Loan.Remarks;
        newTrans.Approval_Status        = this.Loan.Approval_Status;
        newTrans.Loan_Status            = this.Loan.Loan_Status;
        newTrans.VouSno                 = this.Loan.VouSno;
        newTrans.UserSno                = this.Loan.UserSno;
        newTrans.BranchSno              = this.BranchSno;
        newTrans.ItemDetailXML          = this.Loan.ItemDetailXML;
        newTrans.ImageDetailXML         = this.Loan.ImageDetailXML;        
        newTrans.RepledgeLoansXML       = null!;        
        newTrans.PaymentModesXML        = this.Loan.PaymentModesXML;
        newTrans.fileSource             = this.Loan.fileSource;

        trans.Transaction = newTrans;
        trans.saveTransaction().subscribe(data => {
            subject.next(data);
        });        
        return subject.asObservable();
    }

    deleteLoan(): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.deleteTransaction(this.Loan.LoanSno, this.Loan.Loan_No).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();              
    }

    getLoanImages(LoanSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionImages(LoanSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

    getLoanMasters(): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getLoanMasters().subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

    getLoanItemDetails(LoanSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionDetails(LoanSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }

    getLoanNumber(SeriesSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionNumber(SeriesSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }
 
   Initialize () { 
		let Loan: TypeLoan = {
			LoanSno: 0,			            
            Series: { "SeriesSno":0,"VouType": {"VouTypeSno":12,"VouType_Name": "Loan Payment"}, "Series_Name": "" },
            Loan_No: "",
            IsOpen: 0,
            Ref_No: "",
            Loan_Date: DateToInt(new Date()),
            Customer: {"PartySno": 0},
            Scheme: {"SchemeSno": 0},
            IGroup: {"GrpSno": 0},
            TotQty: 0,
            TotGrossWt: 0,
            TotNettWt: 0,
            TotPureWt:0,
            Market_Value: 0,
            Principal: 0,
            Roi: 0,
            AdvIntDur: 0,
            AdvIntAmt: 0,
            DocChargesPer: 0,
            DocChargesAmt: 0,
            Emi_Due_Amt: 0, 
            OrgEmi_Due_Amt: 0, 
            Emi_Principal:0,
            Emi_Interest:0,
            Due_Start_Date: DateToInt(new Date()),
            Nett_Payable: 0,
            Mature_Date: DateToInt(new Date()),            
            Location: {"LocationSno":0},
            Agent:{"AgentSno":0},
            Remarks: "",
            Approval_Status: 0,
            Cancel_Status: 0,
            Cancel_Date: 0,
            Cancel_Remarks: "",
            Loan_Status: 1,    
            Loan_Repledge_Status:0,        
            Loan_RepledgeSno: 0,
            Loan_Repledge_No: "",
            Item_Details: "",
            ItemDetailXML: "",
            ImageDetailXML: "",
            Loan_Image: "",
            VouDetailXML: "",  
            PaymentModesXML: "",      
            fileSource: [],
            VouSno: 0,
            UserSno: this.UserSno,       
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            Series_Json: "",
            Party_Json: "",
            Scheme_Json:"",
            SchemeSlab_Json: "",
            Group_Json: "",
            Location_Json: "",
            Agent_Json:"",
            IGroup_Json: "",
            PaymentModes_Json: "",
            PaymentMode: [],
            Items_Json: "",
            Images_Json: "",
            Name: "",
            Details: ""
		  }
		  return Loan;
	}
}

	export interface TypeLoan{
		LoanSno: number;		
        Series: TypeVoucherSeries;
        Loan_No: string;
        IsOpen: number;
        Ref_No: string;
        Loan_Date: number;
        Customer: TypeParties;
        Scheme: TypeScheme;
        IGroup: TypeItemGroup;
        TotQty: number;
        TotGrossWt: number;
        TotNettWt: number;
        TotPureWt: number;
        Market_Value: number;
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
        Nett_Payable: number;
        Mature_Date: number;        
        Location: TypeLocation;
        Agent: TypeAgent;
        Remarks: string;
        Approval_Status: number;
        Cancel_Status: number;
        Cancel_Date: number;
        Cancel_Remarks: string;
        Loan_Status: number;
        Loan_Repledge_Status: number;
        Loan_RepledgeSno: number;
        Loan_Repledge_No: string;
        VouSno: number;
        UserSno: number;
        CompSno: number;
        BranchSno: number
        Item_Details: string;
        ItemDetailXML: string;
        ImageDetailXML: string;        
        Loan_Image: string;
        VouDetailXML: string;        
        PaymentModesXML: string;
        fileSource: FileHandle[];
        Series_Json: string;
        Party_Json: string;
        Scheme_Json: string;
        SchemeSlab_Json: string;
        Group_Json: string;
        Location_Json: string;
        Agent_Json: string;
        IGroup_Json: string;
        PaymentMode: TypePayMode[];
        PaymentModes_Json: string;
        Items_Json: string;
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
