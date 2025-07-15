import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { TypeParties } from "./ClsParties";
import { TypeLoan } from "./ClsLoan";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";
import { TypeRepledge } from "./ClsRepledges";

@AutoUnsubscribe
export class ClsReports{    
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 
    
    constructor(private dataService: DataService){
        
    	}

    getCustomerDetailed(PartySno: number): Observable<TypeHttpResponse> {
        let postdata ={ "PartySno" :  PartySno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getCustomerDetailed");                
    }

    getSupplierDetailed(PartySno: number): Observable<TypeHttpResponse> {
        let postdata ={ "PartySno" :  PartySno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getSupplierDetailed");                
    }

    getLoanDetailed(LoanSno: number, AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ "LoanSno" :  LoanSno, "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getLoanDetailed");                
    }

    getRepledgeDetailed(RepledgeSno: number, AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ "RepledgeSno" :  RepledgeSno, "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getRepledgeDetailed");                
    }

    getLoanStatement(LoanSno: number, AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ "LoanSno" :  LoanSno, "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getLoanStatement");                
    }

    getRepledgeStatement(RepledgeSno: number, AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ "RepledgeSno" :  RepledgeSno, "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getRepledgeStatement");                
    }

    getLoanHistory(LoanStatus: number, FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno,  "LoanStatus" :  LoanStatus, "CompSno": this.CompSno,  "FromDate" :  FromDate, "ToDate": ToDate }; 
        return this.dataService.HttpGet(postdata, "/getLoanHistory");                
    }
    
    getPledgeBook(FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno,  "CompSno": this.CompSno,  "FromDate" :  FromDate, "ToDate": ToDate }; 
        return this.dataService.HttpGet(postdata, "/getPledgeBook");                
    }

    getRepledgeHistory(RpStatus: number, FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata = { BranchSno: this.BranchSno,  "RpStatus" :  RpStatus, "CompSno": this.CompSno,  "FromDate" :  FromDate, "ToDate": ToDate }; 
        return this.dataService.HttpGet(postdata, "/getRepledgeHistory");                
    }

    getLoanStatusCount(AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno,  "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getLoanStatusCount");                
    }

    getRepledgeStatusCount(AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno,  "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getRepledgeStatusCount");                
    }
    
    getRepledgeAuctionHistory(AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno,  "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getRepledgeAuctionHistory");                
    }

    getAuctionHistory(AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno,  "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getAuctionHistory");                
    }

    getPendingReport(AsOn: number, DueDays: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno,  "AsOn" :  AsOn, "DueDays": DueDays }; 
        return this.dataService.HttpGet(postdata, "/getPendingReport");                
    }

    getDayHistory(HistFromDate: number, HistToDate: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno,  "HistFromDate" :  HistFromDate, "HistToDate": HistToDate }; 
        return this.dataService.HttpGet(postdata, "/getDayHistory");                
    }

    getAgeAnalysis(): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getAgeAnalysis");                
    }

    getAlertHistory(): Observable<TypeHttpResponse> {
        let postdata ={"CompSno": this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getAlertHistory");                
    }

    getMarketvalueAnalysis(): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getMarketvalueAnalysis");                
    }

    getIntStatementCustom(FromDate: number, ToDate: number, SubmitInt: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno, "FromDate": FromDate, "ToDate": ToDate, "SubmitInt": SubmitInt }; 
        return this.dataService.HttpGet(postdata, "/get1percentIntStatement");                
    }

    getBusinessRegisterMonthly(FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno,"CompSno": this.CompSno, "FromDate": FromDate, "ToDate": ToDate}; 
        return this.dataService.HttpGet(postdata, "/getBusinessRegisterMonthly");                
    }
    
    getBusinessRegisterDaily(FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno, "FromDate": FromDate, "ToDate": ToDate}; 
        return this.dataService.HttpGet(postdata, "/getBusinessRegisterDaily");                
    }

    getPendingLoanPayments(): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getPendingLoanPayments");                
    }
    
    getLoanHistoryCustomBr(): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getLoanHistoryCustomBr");                
    }

    getDayHistoryCustomFS2025061361(AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno, "AsOn": AsOn}; 
        return this.dataService.HttpGet(postdata, "/getDayHistoryCustomFS2025061361");                
    }

    getDayBookCustomFS2024122133(FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "CompSno": this.CompSno, "FromDate": FromDate, "ToDate": ToDate}; 
        return this.dataService.HttpGet(postdata, "/getDayBookCustomFS2024122133");                
    }
}

export interface TypeCustomerDetailed extends TypeParties{
    OpenLoans: number;
    ClosedLoans: number;
    MaturedLoans: number;
    AuctionedLoans: number;
}

export interface TypeSupplierDetailed extends TypeParties{
    OpenLoans: number;
    ClosedLoans: number;
    MaturedLoans: number;
    AuctionedLoans: number;
    RepledgeLoans_Json: string;
}

export interface TypeInterestDetails {
    Interest_Balance: number;
    Principal_Balance: number;
    Last_Receipt_Date: number;
    Ason_Duration_Months: number;
	Ason_Duration_Days: number;
    Struc_Json: string;
    Statement_Json: string;
    Total_Dues: number;
    Paid_Dues: number;
    Balance_Dues: number;
    Pending_Dues: number;
}

export interface TypeInterestStructure{
    FromDate: number;
    ToDate: number;
    Duration: number;
    DurType: number;
    Roi: number;
    IntAccured: number;
    TotIntAccured: number;
    IntPaid: number;
    PrinPaid: number;
    AddedPrincipal: number;
    AdjPrincipal: number;
    NewPrincipal: number;
}

export interface TypeInterestStructureEmi{
    DueNo: number;
    DueDate: string;
    DueAmt: number;
    PaidDate: string;
    PaidAmt: number;
    Delay_Days: number;
    OtherCredits: number;    
}

export interface TypeLoanStatement{
    Sno: number;
    VouTypeSno: number;
    Series_Name: string;
    Number: string;
    Date: number;
    Principal: number;
    Interest: number;
    Nett_Payable: number;
}

export interface TypePledgeBook extends TypeLoan {    
    Party_Code: string;
    Party_Name: string;
    Address1: string;
    Address2: string;
    Address3: string;
    Address4: string;
    City: string;
    Pincode: string;
    Mobile: string;
    Grp_Name: string;
    Scheme_Name: string;
    Principal: number;
    Item_Details: string;
    TotGrossWt: number;
    TotNettWt: number;
    Market_Value: number;
    CloseAmt: number;
    Redemption_Date: string;
}

export interface TypeLoanHistory extends TypeLoan{
    StatusCount_Json: string;
}

export interface TypeAuctionHistory extends TypeLoan{
    OtherLoans_Json: string;
}


export interface TypeRepledgeHistory extends TypeRepledge{
    StatusCount_Json: string;
}

export interface TypeMarketValueAnalysis extends TypeLoan{
    Then_Market_Rate: number;
    Then_Loan_PerGram: number;
    Then_Market_Value: number;
    Current_Market_Rate: number;
    Current_Loan_PerGram: number;
    Current_Market_Value: number;
    Nett_Payable_AsOn: number;
    Diff_Amount: number;
}

export interface TypePendingReport extends TypeLoan{
    Due_Date_Str: string;
    Pending_Dues: number;
    Pending_Days: number;
}

export interface TypeAgeAnalysis extends TypeLoan{
    Ason_Duration_Months: number;
    Ason_Duration_Days: number;
    Last_Receipt_Date: number;
}

export interface TypeIntStatementCustom extends TypeLoan{
    Redemption_Date: number;
    IntAmount: number;    
}

export interface TypeBusinessRegister{
    MonthStart: number;
    MonthEnd: number;    
    LoansCount: number;    
    LoansValue: number;    
    RedCount: number;    
    RedValue: number;    
    Interest: number;    
}

export interface TypeBusinessRegisterDaily{
    DayStart: number;    
    LoansCount: number;    
    LoansValue: number;    
    RedCount: number;    
    RedValue: number;    
    Interest: number;    
    DocCharges: number;    
}

export interface TypeDayHistyory {
    TransSno: number;
    Trans_No: string;
    Trans_Date: number; 
    VouTypeSno: number;
    Party_Name: string;
    Ref_No: string;
    Principal: number;
    Interest: number;
    UserName: string;
}

export interface TypeAlertHistory{
    HisSno: number;
    Alert_Date: string;
    Alert_Destination: string;
    Alert_Text: string;
    Alert_Type: string;
    Alert_Mode: string;
    TrackSno: number;
    Response: string;
    Alert_Status: string;
    Retry_Count: number;
    CompSno: number;
}