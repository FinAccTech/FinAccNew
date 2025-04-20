import { Observable} from "rxjs";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { DataService } from "../../Services/data.service";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsAccReports{    
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 
    
    constructor(private dataService: DataService){}

    getDayBook(FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={ BranchSno: this.BranchSno, "FromDate" :  FromDate, "ToDate": ToDate, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getDayBook");                
    }
    
    getTrialBalance(GrpSno: number, FromDate: number, ToDate: number, GrpType: number, DetType: number): Observable<TypeHttpResponse> {
        let postdata ={ "GrpSno": GrpSno,  "FromDate" :  FromDate, "ToDate": ToDate, "GrpType": GrpType, "DetType": DetType, "BranchSno": this.BranchSno,  "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getTrialBalance");                    
    }
    
    getProfitandLoss(FromDate: number, ToDate: number, GrpType: number): Observable<TypeHttpResponse> {
        let postdata ={"FromDate" :  FromDate, "ToDate": ToDate, "GrpType": GrpType, "BranchSno": this.BranchSno,  "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getProfitandLoss");                    
    }

    getBalanceSheet(FromDate: number, ToDate: number, GrpType: number, Valuation_Method: number): Observable<TypeHttpResponse> {
        let postdata ={"FromDate" :  FromDate, "ToDate": ToDate, "GrpType": GrpType, "Valuation_Method": Valuation_Method, "BranchSno": this.BranchSno,  "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getBalanceSheet");                    
    }

}

export interface TypeLedgerBook {
    DetSno: number;
    VouSno: number;
    Vou_Date: number;
    TrackSno: number;
    VouTypeSno: number;
    VouType_Name: string;
    Vou_No: string;
    LedSno: number;
    GrpSno: number;
    Grp_Name: string;
    Led_Name: string;
    Credit: number;
    Debit: number;
    Grp_Nature: number;
    BranchSno: number;
    Narration: number;
    CompSno: number;
}

export interface TypeTrialBalance {
    Sno: number;
    IsGrp: number;
    Name: string;
    Grp_Level: number;
    Grp_Nature: number;
    Affect_Gp: number;
    OpnCr: number;
    OpnDr: number;
    TrnCr: number;
    TrnDr: number;
    ClsCr: number;
    ClsDr: number;
}

export interface TypeBalanceSheet {
    Sno: number;
    Name: string;
    Grp_Level: number;
    IsGrp: number;
    Grp_Nature: number;
    Affect_Gp: number;
    Amount: number;
}