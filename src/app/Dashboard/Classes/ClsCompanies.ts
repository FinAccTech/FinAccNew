import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsCompanies{
    public Comp!: TypeCompanies;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!; ;    
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; ;
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 
    
    constructor(private dataService: DataService){
        
    	}

    getCompanies(UserSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "UserSno" :  UserSno }; 
        return this.dataService.HttpGet(postdata, "/getCompanies");                
    }

    saveCompany(): Observable<TypeHttpResponse> {        
        let postdata = this.Comp;
        return this.dataService.HttpPost(postdata, "/saveCompany");                        
    }

    deleteCompany(): Observable<TypeHttpResponse> {
        let postdata ={ "CompSno" :  this.Comp.CompSno }; 
        return this.dataService.HttpPost(postdata, "/deleteCompany");                
    }

    Initialize(){
        let Company: TypeCompanies = {
            CompSno: 0,    
            ClientSno: 0,
            Comp_Code: "AUTO",
            Comp_Name: "",            
            Fin_From: DateToInt(new Date()),                        
            Fin_To: DateToInt(new Date()),
            Books_From: DateToInt(new Date()),
            Address1: "",
            Address2: "",
            Address3: "",
            City: "",
            State: "",
            Pincode: "", 
            Email: "",
            Phone: "",
            License_No: "",
            Hide_Status: 0,
            App_Version: 0,
            Db_Version: 0,
            Status: 0,
            CommMasters: 0,            
        }
        return Company
    }
}

export interface TypeCompanies{
    CompSno: number;    
    ClientSno: number;
    Comp_Code: string;
    Comp_Name: string;
    Fin_From: number;
    Fin_To: number;
    Books_From: number;
    Address1: string;
    Address2: string;
    Address3: string;
    City: string;
    State: string;
    Pincode: string;
    Email: string;
    Phone: string;
    License_No: string;
    Hide_Status: number;
    App_Version: number;
    Db_Version: number;
    Status: number;
    CommMasters: number;    
}

function DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }
