import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsItemGroups{     
    public ItemGroup!: TypeItemGroup;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;    
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){
        
    }

    getItemGroups(GrpSno: number): Observable<any> {        
        let postdata ={ "GrpSno" :  GrpSno, "CompSno" : this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getItemGroups");                
    } 

    getGrpCode(){
        let postdata ={ "BranchSno" :  this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getGrpCode");                
    }

    saveItemGroup(): Observable<TypeHttpResponse> {
        let postdata = this.ItemGroup;         
        return this.dataService.HttpPost(postdata, "/saveItemGroup");                
    }

    deleteItemGroup(): Observable<TypeHttpResponse> {
        let postdata ={ "GrpSno" :  this.ItemGroup.GrpSno }; 
        return this.dataService.HttpPost(postdata, "/deleteItemGroup");                
    }

    Initialize(){
        let ItemGroup: TypeItemGroup = {
            GrpSno:0,
            Grp_Code: "AUTO",
            Grp_Name: "",
            Market_Rate:0,
            Loan_PerGram: 0,
            Restrict_Type: 1,
            Remarks: "",
            Active_Status: 1,
            Create_Date: 20230908,
            UserSno: this.UserSno,               
            CompSno: this.CompSno,
            BranchSno: this.BranchSno
        }
        return ItemGroup
    }
}

export interface TypeItemGroup {
    GrpSno: number;
    Grp_Code?: string;
    Grp_Name?: string;
    Market_Rate?: number;
    Loan_PerGram?: number;
    Restrict_Type?: number;
    Remarks?: string;
    Active_Status?: number;
    Create_Date?: number;
    UserSno?: number;
    CompSno?: number; 
    BranchSno?: number;
    Name?:string;
    Details?:string;   
}
