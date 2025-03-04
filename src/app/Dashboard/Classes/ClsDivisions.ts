import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsDivisions{
    public Division!: TypeDivision;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){
        
        }

    getDivisions(DivSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "DivSno" :  DivSno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getDivisions");                
    }

    getDivisionCode(){
        let postdata ={ "BranchSno" :  this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getDivisionCode");                
    }

    saveDivision(): Observable<TypeHttpResponse> {        
        let postdata = this.Division;
        return this.dataService.HttpPost(postdata, "/saveDivision");                        
    }

    deleteDivision(): Observable<TypeHttpResponse> {
        let postdata ={ "DivSno" :  this.Division.DivSno }; 
        return this.dataService.HttpPost(postdata, "/deleteDivision");                
    }

    Initialize(){
        let Division: TypeDivision = {
            DivSno:0,
            Div_Code: "",
            Div_Name: "",            
            Remarks: "",            
            Create_Date: DateToInt(new Date()),            
            CompSno: this.CompSno,            
            Name: "",
            Details:""
        }
        return Division
    }
}

export interface TypeDivision{
    DivSno: number;
    Div_Code: string;
    Div_Name: string;    
    Remarks?: string;    
    Create_Date?: number;    
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

