import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { TypeParties } from "./ClsParties";
import { TypeLoan } from "./ClsLoan";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

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

    getLoanHistory(LoanStatus: number, AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ "LoanStatus" :  LoanStatus, "CompSno": this.CompSno,  "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getLoanHistory");                
    }
    
    getLoanStatusCount(AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={ "CompSno": this.CompSno,  "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getLoanStatusCount");                
    }

    getAuctionHistory(AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={"CompSno": this.CompSno,  "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getAuctionHistory");                
    }

    getPendingReport(AsOn: number): Observable<TypeHttpResponse> {
        let postdata ={"CompSno": this.CompSno,  "AsOn" :  AsOn }; 
        return this.dataService.HttpGet(postdata, "/getPendingReport");                
    }

    getDayHistory(HistFromDate: number, HistToDate: number): Observable<TypeHttpResponse> {
        let postdata ={"CompSno": this.CompSno,  "HistFromDate" :  HistFromDate, "HistToDate": HistToDate }; 
        return this.dataService.HttpGet(postdata, "/getDayHistory");                
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

export interface TypeLoanHistory extends TypeLoan{
    StatusCount_Json: string;
}

export interface TypePendingReport extends TypeLoan{
    Pending_Dues: number;
    Pending_Days: number;
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