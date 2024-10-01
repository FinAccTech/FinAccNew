import { Observable, Subject} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { TypeVoucherSeries } from "./ClsVoucherSeries";
import { ClsLoans, TypeLoan } from "./ClsLoan";
import { ClsRedemptions, TypeRedemption } from "./ClsRedemptions";
import { ClsTransactions } from "./ClsTransactions";
import { TypeParties } from "./ClsParties";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsReLoans{
    public ReLoan!: TypeReLoan;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;     
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){
        
    	}

    getReLoans(ReLoanSno: number, FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={ "ReLoanSno" :  ReLoanSno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getReLoans");                
    }

    saveReLoan(): Observable<TypeHttpResponse>  {              
        let postdata = this.ReLoan;
        return this.dataService.HttpGet(postdata, "/saveReLoan"); 
    }

    deleteReLoan(): Observable<TypeHttpResponse> {
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.deleteTransaction(this.ReLoan.ReLoanSno, this.ReLoan.ReLoan_No).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();              
    }

    getReLoanNumber(SeriesSno: number): Observable<TypeHttpResponse>  {   
        var subject = new Subject<TypeHttpResponse>();  
        let trans = new ClsTransactions(this.dataService);
        trans.getTransactionNumber(SeriesSno).subscribe(data => {
            subject.next(data);
        })
        return subject.asObservable();
    }
    
    Initialize(){
        let ln = new ClsLoans(this.dataService);
        let red = new ClsRedemptions(this.dataService);
        let ReLoan: TypeReLoan = {
            ReLoanSno: 0,
            ReLoan_Date: DateToInt(new Date()),
            ReLoan_No: "",
            Series: {"SeriesSno":0, "Series_Name":"", "VouType" :{"VouTypeSno":20, "VouType_Name": "ReLoan"}},
            Customer: {"PartySno":0, "Party_Code":", ","Party_Name":""},
            OldLoan: ln.Initialize(),
            NewLoan: ln.Initialize(),
            Redemption: red.Initialize(),
            Remarks: "",
            UserSno: this.UserSno,
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            ItemDetailXML: "",
            ImageDetailXML: "",            
            Name: "",
            Details: "",
        }
        return ReLoan
    }
}

export interface TypeReLoan{
    ReLoanSno: number;
    Series: TypeVoucherSeries;
    ReLoan_No: string;    
    ReLoan_Date: number;
    Customer: TypeParties;
    OldLoan: TypeLoan;    
    NewLoan: TypeLoan;
    Redemption: TypeRedemption;
    Remarks: string;     
    UserSno: number;
    CompSno?: number;
    BranchSno?: number;
    ItemDetailXML: string;
    ImageDetailXML: string;          
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
