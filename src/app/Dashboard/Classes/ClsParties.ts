import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { TypeArea } from "./ClsAreas";
import { FileHandle } from "../Types/file-handle";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsParties{
    public Party!: TypeParties;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private ClientSno: number = JSON.parse(sessionStorage.getItem("sessionLoggedClient")!).ClientSno; 
    private CommMasters: number = JSON.parse(sessionStorage.getItem("sessionSelectedCompany")!).CommMasters; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getParties(PartySno: number, Party_Cat: number, Verify_Status: number, Fp_Status: number, Active_Status: number): Observable<TypeHttpResponse> {
        let postdata ={ "PartySno" :  PartySno, "Party_Cat": Party_Cat, "Verify_Status": Verify_Status, "Fp_Status": Fp_Status, "Active_Status": Active_Status, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getParties");                
    }

    checkPartyExists(CheckValue: string, CheckbyParam: number): Observable<TypeHttpResponse> {
        //  CheckByParam 1-- By Party Code,  2-- By MobileNumber
        let postdata ={ "CheckValue" :  CheckValue, "CheckbyParam": CheckbyParam, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/checkPartyExists");                
    }

    getPartyCode(Party_Type: number){
        let postdata ={ "BranchSno" :  this.BranchSno, "Party_Type" :  Party_Type }; 
        return this.dataService.HttpGet(postdata, "/getPartyCode");                
    }

    saveParty(): Observable<TypeHttpResponse> {        
        let postdata = this.Party;
        return this.dataService.HttpPost(postdata, "/saveParty");                        
    }

    deleteParty(): Observable<TypeHttpResponse> {
        let postdata ={"ClientSno": this.ClientSno, "CompSno": this.CompSno, "CommMasters": this.CommMasters,  "PartySno" :  this.Party.PartySno, "Party_Code" :  this.Party.Party_Code,}; 
        return this.dataService.HttpPost(postdata, "/deleteParty");                
    }

    getPartyImages(PartySno: number): Observable<TypeHttpResponse> {
        let postdata ={ "PartySno" :  PartySno}; 
        return this.dataService.HttpGet(postdata, "/getPartyImages");                
    }

    Initialize(){
        let Party: TypeParties = {
            PartySno:0,
            Party_Code: "",
            Party_Name: "",            
            Print_Name: "",  
            Party_Cat: 0,          
            Area : {AreaSno:0, Area_Code:'', Area_Name: '', Create_Date: 0},
            Rel: 0,
            RelName: "",
            Address1: "",
            Address2: "",
            Address3: "",
            Address4: "",
            City: "",
            State: "",
            Pincode: "",
            Phone: "",
            Mobile: "",
            Email: "",
            Reference: "",
            Dob: 0,
            Sex: 1,

            Aadhar_No: "",
            Pancard_No:"",
            Smartcard_No:"",
            Voterid_No:"",
            Nominee: "",    
            Nominee_Rel:"",
            Nominee_Aadhar:"",
            
            Remarks: "",
            Occupation: "",
            Monthly_Income: 0,
            Loan_Value_Limit: 0,
            Allow_More_Value: 0,
            Verify_Code: 0,
            Verify_Status:0,
            Fp_Status: 0,
            Active_Status: 1,
            IsFavorite: false, 
            BlackListed: false,      
            Create_Date: DateToInt(new Date()),            
            UserSno:this.UserSno,            
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            ImageDetailXML: "",
            LedSno: 0,

            Bank_AccName: "",
            Bank_Name: "",
            Bank_Branch_Name: "",
            Bank_AccountNo: "",
            Bank_Ifsc: "",

            ProfileImage:"",
            fileSource: [],
            Name: "",
            Details:"",
            ClientSno: this.ClientSno,
            CommMasters:this.CommMasters,
        }
        return Party
    }
}

export interface TypeParties{
    PartySno: number;
    Party_Code?: string;
    Party_Name?: string;
    Print_Name?: string;
    Party_Cat?: number;
    Area? : TypeArea;
    Rel?: number;
    RelName?: string;
    Address1?: string;
    Address2?: string;
    Address3?: string;
    Address4?: string;
    City?: string;
    State?: string;
    Pincode?: string;
    Phone?: string;
    Mobile?: string;
    Email?: string;
    Reference?: string;
    Dob?: number;
    Sex?: number;

    Aadhar_No?: string;
    Pancard_No?:string;
    Smartcard_No?:string;
    Voterid_No?:string;
    Nominee?: string;
    Nominee_Rel?:string;
    Nominee_Aadhar?:string;

    Remarks?: string; 
    Occupation?: string;
    Monthly_Income?: number;
    Loan_Value_Limit?: number;
    Allow_More_Value?: number;
    Verify_Code?: number;
    Verify_Status?: number;
    Fp_Status?: number;
    Active_Status?: number;
    IsFavorite?: boolean;    
    BlackListed?: boolean;    
    Create_Date?: number;    
    UserSno?: number;
    CompSno?: number;
    BranchSno?: number;
    ImageDetailXML?: string;
    LedSno?: number;

    Bank_AccName?: string,
    Bank_Name?: string,
    Bank_Branch_Name?: string,
    Bank_AccountNo?: string,
    Bank_Ifsc?: string,  

    ProfileImage?:string;
    fileSource?: FileHandle[];
    Name?: string;
    Details?: string;
    ClientSno?: number;
    CommMasters?:number;
    Loans_Json?:string;
}

function DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }
