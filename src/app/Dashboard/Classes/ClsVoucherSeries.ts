import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { TypeScheme } from "./ClsSchemes";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsVoucherSeries{
    public Series!: TypeVoucherSeries;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;             
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}
            
    getVoucherTypes(VouTypeSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "VouTypeSno": VouTypeSno}; 
        return this.dataService.HttpGet(postdata, "/getVoucherTypes");                
    }

    getVoucherSeries(SeriesSno: number, VouTypeSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "SeriesSno" :  SeriesSno, "BranchSno": this.BranchSno, "VouTypeSno": VouTypeSno, "CompSno" :  this.CompSno}; 
        return this.dataService.HttpGet(postdata, "/getVoucherSeries");                
    }

    saveVoucherSeries(): Observable<TypeHttpResponse> {        
        let postdata = this.Series;
        console.log(postdata);
        
        return this.dataService.HttpPost(postdata, "/saveVoucherSeries");                        
    }

    deleteVoucherSeries(): Observable<TypeHttpResponse> {
        let postdata ={ "SeriesSno" :  this.Series.SeriesSno }; 
        return this.dataService.HttpPost(postdata, "/deleteVoucherSeries");                
    }

    Initialize(){
        let Series: TypeVoucherSeries = {
            SeriesSno:0,            
            VouType: {"VouTypeSno":0, "VouType_Name" : ""},
            Series_Name: "",            
            Num_Method:0,
            Allow_Duplicate:false, 
            Start_No: 0,
            Current_No:0,
            Prefix:"",
            Suffix:"",
            Width: 0,
            Prefill: "",
            MapScheme: {"SchemeSno":0, "Scheme_Code":"", "Scheme_Name":""},
            Scheme_Json: "",
            Print_Voucher: false,
            Print_On_Save: false,
            Show_Preview : false,
            Print_Style: "",
            IsDefault : false,     
            IsStd: false,       
            Active_Status: false,
            Create_Date: DateToInt(new Date()),
            UserSno:this.UserSno,            
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            Name: "",
            Details:""
        }
        return Series
    }
}

export interface TypeVoucherSeries {
    SeriesSno: number;
    VouType: TypeVoucherTypes;
    Series_Name: string;
    BranchSno?: number;
    Num_Method?: number;
    Allow_Duplicate?: boolean;
    Start_No?: number;
    Current_No?: number;
    Prefix?: string;
    Suffix?: string;
    Width?: number;
    Prefill?: string;
    MapScheme?: TypeScheme;
    Scheme_Json?: string;
    Print_Voucher?: boolean;
    Print_On_Save?: boolean;
    Show_Preview?: boolean;
    Print_Style?: string;
    IsDefault?: boolean;
    IsStd?: boolean;
    Active_Status?: boolean;
    Create_Date?: number;
    UserSno?: number;
    CompSno?: number;
    Name?: string;
    Details?: string;
}

export interface TypeVoucherTypes {
    VouTypeSno: number;
    VouType_Name: string;
}


function DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }
