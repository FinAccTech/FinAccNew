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

    saveReportProperties(): Observable<TypeHttpResponse> {                
        let postdata = this.ReportPropertie;
        console.log(postdata);
        
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
            Report_Style: "",
            CompSno: 0,   
        }
        return ReportPropertie
    }
}

export interface TypeReportPropertie{
    ReportSno: number;    
    Report_Name: string;
    Report_Style: string;
    CompSno: number;    
}

