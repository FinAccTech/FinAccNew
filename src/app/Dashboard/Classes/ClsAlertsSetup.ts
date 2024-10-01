import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsAlertSetup{
    public AlertSetup!: TypeAlertsSetup;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 
    
    constructor(private dataService: DataService){        
    	}

    getAlertSetup(SetupSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "SetupSno" :  SetupSno, "CompSno" :  this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getAlertsSetup");                
    }

    saveAlertSetup(): Observable<TypeHttpResponse> {        
        let postdata = this.AlertSetup;
        return this.dataService.HttpPost(postdata, "/saveAlertsSetup");                        
    }

    saveTemplate(Template: TypeTemplate): Observable<TypeHttpResponse> {        
        let postdata = Template;
        return this.dataService.HttpPost(postdata, "/saveTemplate");                        
    }

    deleteTemplate(Template: TypeTemplate): Observable<TypeHttpResponse> {        
        let postdata = Template;
        return this.dataService.HttpPost(postdata, "/deleteTemplate");                        
    }

    insertAlert(Alert: TypeAlertHistory): Observable<TypeHttpResponse> {        
        let postdata = Alert;
        return this.dataService.HttpPost(postdata, "/insertAlert");                        
    }
    
    Initialize(){
        let AlertSetup: TypeAlertsSetup = {
            SetupSno: 0,
            CompSno: 0,
            Admin_Mobile: "",
            Sms_Api: "",
            Sms_Sender_Id: "",
            Sms_UserName: "",
            Sms_Password: "",
            Sms_Peid: "",
            WhatsApp_Instance: "",
            Templates: [],
            TemplateXml: "",
            Templates_Json: "",
            Alerts: [],
            AlertXml: "",
            Alerts_Json: "",
        }
        return AlertSetup
    }

    IntializeAlertHistory(){
        let AlertHistory: TypeAlertHistory = {
            HisSno: 0,
            Alert_Date: new Date(),
            Alert_Destination: "",
            Alert_Text: "",
            Alert_Url: "",
            Alert_Type: 0,
            Alert_Mode: 0,
            TrackSno: 0,
            Response: "",
            Alert_Status: 0,
            Retry_Count: 0
        }
        return AlertHistory
    }
}

export interface TypeAlertsSetup{
    SetupSno: number;
    CompSno: number;
    Admin_Mobile: string;
    Sms_Api: string;
    Sms_Sender_Id: string;
    Sms_UserName: string;
    Sms_Password: string;
    Sms_Peid: string;
    WhatsApp_Instance: string;
    Templates: TypeTemplate[];
    TemplateXml: string;
    Templates_Json: string;
    Alerts: TypeAlert[];
    AlertXml: string;
    Alerts_Json: string;
}

export interface TypeTemplate{
    TempSno: number;
    SetupSno?: number;
    Template_Name?: string;
    Template_Id?: string;
    Template_Text?: string;
    Create_Date?: number;
    Name?: string;
    Details?: string;
}

export interface TypeAlert{    
    AlertSno: number;
    SetupSno: number;
    Alert_Type: number;
    Alert_Caption: string;
    Sms_Alert_Template: TypeTemplate;
    WhatsApp_Alert_Template: TypeTemplate;
    Email_Alert_Template: TypeTemplate;
    Voice_Alert_Template: TypeTemplate;    
}

export interface TypeAlertHistory{
    HisSno: number,
    Alert_Date: Date,
    Alert_Destination: string,
    Alert_Text: string,
    Alert_Url: string,
    Alert_Type: number,
    Alert_Mode: number, /* Sms / WhatsApp/ Email / Voice */
    TrackSno: number,
    Response: string,  
    Alert_Status: number, /* -- 1-Pending, 2-Sent, 3-Failed */
    Retry_Count: number,
}
