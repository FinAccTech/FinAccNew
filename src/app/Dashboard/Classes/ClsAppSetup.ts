import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsAppSetup{
    public AppSetup!: TypeAppSetup;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 
    
    constructor(private dataService: DataService){        
    	}

    getAppSetup(SetupSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "SetupSno" :  SetupSno, "CompSno" :  this.CompSno, "BranchSno": this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getTransactionSetup");                
    }

    saveAppSetup(): Observable<TypeHttpResponse> {        
        let postdata = this.AppSetup;
        console.log(postdata);
        
        return this.dataService.HttpPost(postdata, "/saveAppSetup");                        
    }

    Initialize(){
        let AppSetup: TypeAppSetup = {
            SetupSno: 0,
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,            
            AreaCode_AutoGen : 0,
            AreaCode_Prefix: "",
            AreaCode_CurrentNo   : 0,

            PartyCode_AutoGen:   0,
            PartyCode_Prefix:    "",
            PartyCode_CurrentNo: 0,

            SuppCode_AutoGen:   0,
            SuppCode_Prefix:    "",
            SuppCode_CurrentNo:  0,

            BwrCode_AutoGen:   0,
            BwrCode_Prefix:    "",
            BwrCode_CurrentNo  : 0,

            GrpCode_AutoGen: 0,
            GrpCode_Prefix: "",
            GrpCode_CurrentNo: 0,

            ItemCode_AutoGen:    0,
            ItemCode_Prefix:     "",
            ItemCode_CurrentNo: 0,

            SchemeCode_AutoGen:  0,
            SchemeCode_Prefix:   "",
            SchemeCode_CurrentNo: 0,

            LocCode_AutoGen:     0,
            LocCode_Prefix:      "",
            LocCode_CurrentNo: 0,

            PurityCode_AutoGen:  0,
            PurityCode_Prefix:   "",
            PurityCode_CurrentNo: 0,

            BranchCode_AutoGen:  0,
            BranchCode_Prefix:   "",
            BranchCode_CurrentNo: 0,

            Enable_Opening:      0,
            Enable_RegLang:      0,
            Reg_FontName:        "",
            Reg_FontSize:    0,

            Enable_FingerPrint:  0,
            MakeFp_Mandatory:    0,

            Allow_NullInterest:  0,
            Show_CashBalance:    0,
            Images_Mandatory:    0,
            Enable_ReturnImage:  0,
            Allow_DuplicateItems:  0,
            Disable_AddLess:       0,
            Entries_LockedUpto: 0,
            Enable_Authentication: 0,
            Enable_OldEntries:     0,
            IntCalcinDays:         0,
            MobileNumberMandatory: 0,        
            Enable_AutoApproval: 0,     
            Lock_PreviousDate: 0,       
            
        }
        return AppSetup
    }
}

export interface TypeAppSetup{
    SetupSno: number;
    CompSno: number;
    BranchSno: number;
    AreaCode_AutoGen : number;
    AreaCode_Prefix: string;
    AreaCode_CurrentNo   : number;
    
    PartyCode_AutoGen:   number;
    PartyCode_Prefix:    string;
    PartyCode_CurrentNo  : number;

    SuppCode_AutoGen:   number;
    SuppCode_Prefix:    string;
    SuppCode_CurrentNo  : number;

    BwrCode_AutoGen:   number;
    BwrCode_Prefix:    string;
    BwrCode_CurrentNo  : number;

    GrpCode_AutoGen:     number;
    GrpCode_Prefix:      string;
    GrpCode_CurrentNo: number;

    ItemCode_AutoGen:    number;
    ItemCode_Prefix:     string;
    ItemCode_CurrentNo: number;

    SchemeCode_AutoGen:  number;
    SchemeCode_Prefix:   string;
    SchemeCode_CurrentNo: number;

    LocCode_AutoGen:     number;
    LocCode_Prefix:      string;
    LocCode_CurrentNo: number;

    PurityCode_AutoGen:  number;
    PurityCode_Prefix:   string;
    PurityCode_CurrentNo: number;

    BranchCode_AutoGen:  number;
    BranchCode_Prefix:   string;
    BranchCode_CurrentNo: number;

    Enable_Opening:      number;
    Enable_RegLang:      number;
    Reg_FontName:        string,
    Reg_FontSize:    number;

    Enable_FingerPrint:  number;
    MakeFp_Mandatory:    number;

    Allow_NullInterest:  number;
    Show_CashBalance:    number;
    Images_Mandatory:    number;
    Enable_ReturnImage:  number;
    Allow_DuplicateItems:  number;
    Disable_AddLess:       number;
    Entries_LockedUpto: number;
    Enable_Authentication: number;
    Enable_OldEntries:     number;
    IntCalcinDays:         number;    
    MobileNumberMandatory: number;    
    Enable_AutoApproval: number;
    Lock_PreviousDate: number;
}


