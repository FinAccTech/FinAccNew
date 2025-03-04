import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { TypeItemGroup } from "./ClsItemGroups";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";


@AutoUnsubscribe
export class ClsItems{
    public Item!: TypeItem;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!; ;    
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; ;
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getItems(ItemSno: number, GrpSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "ItemSno" :  ItemSno, "GrpSno" :  GrpSno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getItems");                
    }

    getItemCode(){
        let postdata ={ "BranchSno" :  this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getItemCode");                
    }

    saveItem(): Observable<TypeHttpResponse> {        
        let postdata = this.Item;
        return this.dataService.HttpPost(postdata, "/saveItem");                        
    }

    deleteItem(): Observable<TypeHttpResponse> {
        let postdata ={ "ItemSno" :  this.Item.ItemSno }; 
        return this.dataService.HttpPost(postdata, "/deleteItem");                
    }

    Initialize(){
        let Item: TypeItem = {
            ItemSno:0,
            Item_Code: "",
            Item_Name: "",
            IGroup:  {GrpSno:0, Grp_Code:"", Grp_Name: "", Create_Date:0},            
            Remarks: "",
            Active_Status: 1,
            Create_Date: DateToInt(new Date()),
            UserSno: this.UserSno,
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            Name: "",
            Details: ""
        }
        return Item
    }
}

export interface TypeItem{
    ItemSno: number;
    Item_Code: string;
    Item_Name: string;
    IGroup?: TypeItemGroup;
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
