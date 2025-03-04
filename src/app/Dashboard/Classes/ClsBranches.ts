import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";
import { TypeDivision } from "./ClsDivisions";

@AutoUnsubscribe
export class ClsBranches{
    public Branch!: TypeBranch;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){
        
        }

    getBranches(BranchSno: number, DivSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "BranchSno" :  BranchSno, "CompSno" :  this.CompSno, "DivSno": DivSno }; 
        return this.dataService.HttpGet(postdata, "/getBranches");                
    }

    getBranchCode(){
        let postdata ={ "BranchSno" :  this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getBranchCode");                
    }

    saveBranch(): Observable<TypeHttpResponse> {        
        let postdata = this.Branch;
        return this.dataService.HttpPost(postdata, "/saveBranch");                        
    }

    deleteBranch(): Observable<TypeHttpResponse> {
        let postdata ={ "BranchSno" :  this.Branch.BranchSno }; 
        return this.dataService.HttpPost(postdata, "/deleteBranch");                
    }

    Initialize(){
        let Branch: TypeBranch = {
            BranchSno:0,
            Branch_Code: "",
            Branch_Name: "",            
            Remarks: "",
            Division: {DivSno:0, Div_Code:"", Div_Name:""},
            Active_Status: 1,
            Create_Date: DateToInt(new Date()),
            UserSno:this.UserSno,            
            CompSno: this.CompSno,            
            Name: "",
            Details:""
        }
        return Branch
    }
}

export interface TypeBranch{
    BranchSno: number;
    Branch_Code: string;
    Branch_Name: string;    
    Remarks?: string;
    Division?: TypeDivision;
    Active_Status?: number;
    Create_Date?: number;
    UserSno?: number;
    CompSno?: number;    
    Name?: string;
    Details?: string;
}


function DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }

