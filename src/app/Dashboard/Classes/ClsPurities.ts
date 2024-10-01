import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { TypeItemGroup } from "./ClsItemGroups";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsPurities{
    public Purity!: TypePurity;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!; ;    
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; ;
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){
        
    	}

    getPurities(PuritySno: number, GrpSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "PuritySno" :  PuritySno, "GrpSno" :  GrpSno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getPurities");                
    }

    getPurityCode(){
        let postdata ={ "BranchSno" :  this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getPurityCode");                
    }

    savePurity(): Observable<TypeHttpResponse> {        
        let postdata = this.Purity;
        return this.dataService.HttpPost(postdata, "/savePurity");                        
    }

    deletePurity(): Observable<TypeHttpResponse> {
        let postdata ={ "PuritySno" :  this.Purity.PuritySno }; 
        return this.dataService.HttpPost(postdata, "/deletePurity");                
    }

    Initialize(){
        let Purity: TypePurity = {
            PuritySno:0,
            Purity_Code: "AUTO",
            Purity_Name: "",
            Purity: 0,
            IGroup:  {GrpSno:0, Grp_Code:"", Grp_Name: "", Create_Date:0},            
            Remarks: "",
            Active_Status: 1,
            Create_Date: 20230908,
            UserSno:this.UserSno,            
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            Name: "",
            Details: ""
        }
        return Purity
    }
}


export interface TypePurity{
    PuritySno: number;
    Purity_Code: string;
    Purity_Name: string;
    Purity?: number;
    IGroup?: TypeItemGroup;
    Remarks?: string;
    Active_Status?: number;
    Create_Date?: number;
    UserSno?: number;
    CompSno?: number;
    BranchSno?: number;
    Name?: string;
    Details?:string;
}
