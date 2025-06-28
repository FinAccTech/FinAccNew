import { Observable} from "rxjs";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { DataService } from "src/app/Services/data.service";
import { TypeCompanies } from "./ClsCompanies";
import { FileHandle } from "../Types/file-handle";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";
import { TypeBranchRights } from "./ClsBranches";

@AutoUnsubscribe
export class ClsUser{
    public User!: TypeUser;
    private ClientSno: number = JSON.parse (sessionStorage.getItem("sessionLoggedClient")!).ClientSno; 
    constructor(private dataService: DataService){}

    getUsers(UserSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "UserSno" :  UserSno }; 
        return this.dataService.HttpGet(postdata, "/getUsers");                
    } 

    saveUser(): Observable<TypeHttpResponse> {
        this.User.ClientSno = this.ClientSno;
        let postdata = this.User;
        return this.dataService.HttpPost(postdata, "/saveUser");                
    }

    deleteUser(): Observable<TypeHttpResponse> {
        let postdata ={ "UserSno" :  this.User.UserSno }; 
        return this.dataService.HttpPost(postdata, "/deleteUser");                
    }

    Initialize(){
        let User: TypeUser = {            
            UserSno:0,
            UserName: "",
            Password: "",           
            User_Type:0,            
            Active_Status: 1,            
            Rights_Json: "",
            Rights_List: [],
            UserRightsXml: "",            
            
            Comp_Rights_Json: "",
            Comp_Rights_List: [],
            CompRightsXml: "",

            Branch_Rights_Json: "",
            Branch_Rights_List: [],
            BranchRightsXml: "",

            Profile_Image: "",   
            Image_Name: "",  
            fileSource: {"Image_File":null!, "Image_FilesBlob":null!, "Image_Name":"", "Image_Url":"","DelStatus":0,"SrcType":0},
            ClientSno : this.ClientSno,
            Enable_WorkingHours: 0,
            FromTime: "",
            ToTime: "",
            Ip_Restrict: ""
        }
        return User
    }

    GetDefaultRightList(){
        let UserRights: TypeUserRights[] = 
        [            
            { FormSno: 1, Form_Name: "Loans", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 2, Form_Name: "Receipts", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 3, Form_Name: "Redemptions", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 4, Form_Name: "Auctions", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 5, Form_Name: "ReLoan", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 6, Form_Name: "OpeningLoan", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 7, Form_Name: "OpeningReceipt", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

            { FormSno: 8, Form_Name: "ItemGroups", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 9, Form_Name: "Items", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 10, Form_Name: "Customers", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 11, Form_Name: "Suppliers", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 12, Form_Name: "Purity", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 13, Form_Name: "Areas", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 14, Form_Name: "Schemes", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 15, Form_Name: "Locations", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

            { FormSno: 16, Form_Name: "Repledge", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 17, Form_Name: "RpPayments", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 18, Form_Name: "RpRedemption", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

            { FormSno: 19, Form_Name: "LoanSummary", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},            
            { FormSno: 20, Form_Name: "PartyHistory", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 21, Form_Name: "LoanHistory", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 22, Form_Name: "AuctionHistory", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 23, Form_Name: "PendingReport", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

            { FormSno: 24, Form_Name: "LedgerGroups", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 25, Form_Name: "Ledgers", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 26, Form_Name: "Vouchers", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

            { FormSno: 27, Form_Name: "DayBook", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 28, Form_Name: "GroupSummary", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 29, Form_Name: "TrialBalance", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 30, Form_Name: "ProfitandLoss", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 31, Form_Name: "BalanceSheet", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 32, Form_Name: "DayHistory", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 33, Form_Name: "SupplierHistory", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 34, Form_Name: "AgeAnalysis", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 35, Form_Name: "MarketValueAnalysis", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 36, Form_Name: "IntStatementCustom", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

            { FormSno: 37, Form_Name: "RepledgeSummary", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 38, Form_Name: "RepledgeHistory", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 39, Form_Name: "Agents", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 40, Form_Name: "AuctionHistoryRP", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
            { FormSno: 41, Form_Name: "BusinessRegister", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        ];
           
        return UserRights;
    }

}

export interface TypeUser {
    UserSno: number;    
    UserName?: string;        
    Password?: string, 
    User_Type?: number;
    Active_Status?: number;    
    Rights_Json: string;
    Rights_List: TypeUserRights[];
    UserRightsXml: string;

    Comp_Rights_Json: string;
    Comp_Rights_List: TypeCompRights[],
    CompRightsXml: string;          

    Branch_Rights_Json: string;
    Branch_Rights_List: TypeBranchRights[],
    BranchRightsXml: string;          

    Profile_Image: string;
    Image_Name: string;
    fileSource: FileHandle;
    ClientSno: number;
    Enable_WorkingHours: number;
    FromTime: string;
    ToTime: string;
    Ip_Restrict: string;
}

export interface TypeCompRights extends TypeCompanies{    
    Comp_Right: boolean;
}

export interface TypeUserRights{     
    FormSno: number;
    Form_Name: string;
    View_Right: boolean;
    Edit_Right: boolean;
    Print_Right: boolean;
    Delete_Right: boolean;
    Create_Right: boolean;
    Report_Right: boolean;
    Date_Access: boolean;
    Search_Access: boolean;
}

