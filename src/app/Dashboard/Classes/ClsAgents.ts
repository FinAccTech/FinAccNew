import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";


@AutoUnsubscribe
export class ClsAgents{
    public Agent!: TypeAgent;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!; ;    
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; ;
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getAgents(AgentSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "AgentSno" :  AgentSno, "CompSno" :  this.CompSno , "BranchSno": this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getAgents");                
    }

    getAgentCode(){
        let postdata ={ "BranchSno" :  this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getAgentCode");                
    }

    saveAgent(): Observable<TypeHttpResponse> {        
        let postdata = this.Agent;
        return this.dataService.HttpPost(postdata, "/saveAgent");                        
    }

    deleteAgent(): Observable<TypeHttpResponse> {
        let postdata ={ "AgentSno" :  this.Agent.AgentSno }; 
        return this.dataService.HttpPost(postdata, "/deleteAgent");                
    }

    Initialize(){
        let Agent: TypeAgent = {
            AgentSno:0,
            Agent_Code: "",
            Agent_Name: "",            
            Remarks: "",            
            Create_Date: DateToInt(new Date()),            
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            Name: "",
            Details: ""
        }
        return Agent
    }
}

export interface TypeAgent{
    AgentSno: number;
    Agent_Code?: string;
    Agent_Name?: string;    
    Remarks?: string;    
    Create_Date?: number;    
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
