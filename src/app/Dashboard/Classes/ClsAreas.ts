import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsAreas{
    public Area!: TypeArea;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){
        
    	}

    getAreas(AreaSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "AreaSno" :  AreaSno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getAreas");                
    }

    getAreaCode(){
        let postdata ={ "BranchSno" :  this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getAreaCode");                
    }

    saveArea(): Observable<TypeHttpResponse> {        
        let postdata = this.Area;
        return this.dataService.HttpPost(postdata, "/saveArea");                        
    }

    deleteArea(): Observable<TypeHttpResponse> {
        let postdata ={ "AreaSno" :  this.Area.AreaSno }; 
        return this.dataService.HttpPost(postdata, "/deleteArea");                
    }

    Initialize(){
        let Area: TypeArea = {
            AreaSno:0,
            Area_Code: "AUTO",
            Area_Name: "",            
            Remarks: "",
            Active_Status: 1,
            Create_Date: DateToInt(new Date()),
            UserSno:this.UserSno,            
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            Name: "",
            Details:""
        }
        return Area
    }
}

export interface TypeArea{
    AreaSno: number;
    Area_Code: string;
    Area_Name: string;    
    Remarks?: string;
    Active_Status?: number;
    Create_Date?: number;
    UserSno?: number;
    CompSno?: number;
    BranchSno?: number;
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

