import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsLedgerGroups{
    public LedgerGroup!: TypeLedgerGroup;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    
    constructor(private dataService: DataService){
        
    	}

    getLedgerGroups(GrpSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "GrpSno" :  GrpSno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getLedgerGroups");                
    }

    saveLedgerGroup(): Observable<TypeHttpResponse> {        
        let postdata = this.LedgerGroup;        
        return this.dataService.HttpPost(postdata, "/saveLedgerGroup");                        
    }

    deleteLedgerGroup(): Observable<TypeHttpResponse> {
        let postdata ={ "GrpSno" :  this.LedgerGroup.GrpSno }; 
        return this.dataService.HttpPost(postdata, "/deleteLedgerGroup");                
    }

    Initialize(){
        let LedgerGroup: TypeLedgerGroup = {
            GrpSno:0,
            Grp_Code: "AUTO",
            Grp_Name: "",            
            GroupUnder: {"GrpSno":0, "Grp_Code":"", "Grp_Name":""},
            Grp_Level: 0,
            Grp_Desc: "",
            Grp_Nature: 0,
            Affect_Gp: false,
            Remarks: "",
            IsStd: false,
            Created_Date: DateToInt(new Date()),            
            Name: "",
            Details:""
        }
        return LedgerGroup
    }
}

export interface TypeLedgerGroup{
    GrpSno: number;
    Grp_Code: string;
    Grp_Name: string;    
    GroupUnder?: TypeLedgerGroup;
    Grp_Level?: number;
    Grp_Desc?: string;
    Grp_Nature?: number
    Affect_Gp?: boolean;
    Remarks?: string;
    IsStd?: boolean;    
    Created_Date?: number;    
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

