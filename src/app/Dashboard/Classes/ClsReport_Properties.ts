import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";


@AutoUnsubscribe
export class ClsReportProperties{
    public ReportPropertie!: TypeReportPropertie;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!; ;        

    constructor(private dataService: DataService){}

    getReportProperties(ReportSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "ReportSno" :  ReportSno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getReportProperties");                
    }

    saveReportProperties(ReportSno: number, Report_Name: string,  Report_Styleslist: string): Observable<TypeHttpResponse> {                
        let postdata ={ "ReportSno" :  ReportSno, "CompSno" :  this.CompSno, "Report_Name": Report_Name, "Report_Styleslist": Report_Styleslist }; 
        return this.dataService.HttpPost(postdata, "/saveReportProperties");                        
    }

    deleteReportProperties(): Observable<TypeHttpResponse> {
        let postdata ={ "ReportPropertieSno" :  this.ReportPropertie.ReportSno }; 
        return this.dataService.HttpPost(postdata, "/deleteReportPropertie");                
    }

    Initialize(){
        let ReportPropertie: TypeReportPropertie = {
            ReportSno: 0,    
            Report_Name: "",
            Report_Styleslist: "",
            CompSno: 0,   
        }
        return ReportPropertie
    }
}

export interface TypeReportPropertie{
    ReportSno: number;    
    Report_Name: string;
    CompSno: number;        
    Report_Styleslist: string;    
}

