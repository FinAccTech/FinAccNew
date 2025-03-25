import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { TypeVoucherSeries } from "./ClsVoucherSeries";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsSchemes{
    public Scheme!: TypeScheme;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!; ;    
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; ;
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getSchemes(SchemeSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "SchemeSno" :  SchemeSno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getSchemes");                
    }

    getSchemesforSelectedCompany(SchemeSno: number, CompSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "SchemeSno" :  SchemeSno, "CompSno" :  CompSno }; 
        return this.dataService.HttpGet(postdata, "/getSchemes");                
    }

    getSchemeCode(){
        let postdata ={ "BranchSno" :  this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getSchemeCode");                
    }

    saveScheme(): Observable<TypeHttpResponse> {        
        let postdata = this.Scheme;
        return this.dataService.HttpPost(postdata, "/saveScheme");                        
    }

    deleteScheme(): Observable<TypeHttpResponse> {
        let postdata ={ "SchemeSno" :  this.Scheme.SchemeSno }; 
        return this.dataService.HttpPost(postdata, "/deleteScheme");                
    }

    getRoiforAmoount(SchemeSno: number, Amount: number): Observable<TypeHttpResponse> {
        let postdata ={ "SchemeSno" :  SchemeSno, "Amount" :  Amount }; 
        return this.dataService.HttpGet(postdata, "/getRoiforAmoount");                
    }

    Initialize(){
        let Scheme: TypeScheme = {
            SchemeSno:0,
            Scheme_Code: "AUTO",
            Scheme_Name: "",
            Roi: 0,
            EmiDues:0,
            OrgRoi: 0,
            IsStdRoi: false,
            Calc_Basis: 0,
            Calc_Method: 0,
            Custom_Style: 0,
            Payment_Frequency: 0,
            Enable_AmtSlab: false,
            Enable_FeeSlab: false,
            Preclosure_Days: 30,
            Min_CalcDays: 15,
            Grace_Days: 3,
            Series: {"SeriesSno":0,"VouType":{"VouTypeSno": 12,"VouType_Name":"Loan Payment"}, "Series_Name":""},
            LpYear: 1,
            LpMonth: 0,
            LpDays: 7,
            AdvanceMonth:0,
            ProcessingFeePer:0,
            Min_MarketValue: 0,
            Max_MarketValue: 100,
            Min_LoanValue:0,
            Max_LoanValue:0,
            Remarks: "",
            MultiIntXml: "",
            AmtIntXml:"",
            FeeSlabXml: "",
            Active_Status: true,
            Create_Date: 20230908,
            UserSno:this.UserSno,            
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            Name:"",
            Details: "",
            Slab_Json: "",
            AmtSlab_Json: "",
            FeeSlab_Json: "",
        }
        return Scheme
    }
}

export interface TypeScheme {    
    SchemeSno: number;
    Scheme_Code?: string;
    Scheme_Name?: string;
    Roi?: number;
    EmiDues?: number;
    OrgRoi?: number;
    IsStdRoi?: boolean;
    Calc_Basis?: number;
    Calc_Method?: number;
    Custom_Style?: number;
    Payment_Frequency?: number;
    Enable_AmtSlab?: boolean;
    Enable_FeeSlab?: boolean;
    Preclosure_Days?: number;
    Min_CalcDays?: number;
    Grace_Days?: number;
    Series?: TypeVoucherSeries;
    LpYear?: number;
    LpMonth?: number;
    LpDays?: number;
    AdvanceMonth?: number;
    ProcessingFeePer?: number;
    Min_MarketValue?: number;
    Max_MarketValue?: number;
    Min_LoanValue?: number;
    Max_LoanValue?: number;
    Remarks?: string;
    MultiIntXml?: string;
    AmtIntXml?: string;
    FeeSlabXml?: string;
    Active_Status?: boolean;
    Create_Date?: number;
    UserSno?: number;
    CompSno?: number;
    BranchSno?: number;
    Name?: string;    
    Details?: string;
    Slab_Json?: any;
    AmtSlab_Json?: any;
    FeeSlab_Json?: any;
}
