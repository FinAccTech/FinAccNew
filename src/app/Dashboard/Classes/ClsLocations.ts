import { Observable} from "rxjs";
import { DataService } from "src/app/Services/data.service";
import { TypeHttpResponse } from "../Types/TypeHttpResponse";
import { AutoUnsubscribe } from "src/app/auto-unsubscribe.decorator";

@AutoUnsubscribe
export class ClsLocations{
    public Location!: TypeLocation;
    private CompSno: number = +sessionStorage.getItem("sessionSelectedCompSno")!;    
    private BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!; 
    private UserSno: number =   JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno; 

    constructor(private dataService: DataService){}

    getLocations(LocationSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "LocationSno" :  LocationSno, "CompSno" :  this.CompSno }; 
        return this.dataService.HttpGet(postdata, "/getLocations");                
    }

    getLocationCode(){
        let postdata ={ "BranchSno" :  this.BranchSno }; 
        return this.dataService.HttpGet(postdata, "/getLocationCode");                
    }

    saveLocation(): Observable<TypeHttpResponse> {        
        let postdata = this.Location;
        return this.dataService.HttpPost(postdata, "/saveLocation");                        
    }

    deleteLocation(): Observable<TypeHttpResponse> {
        let postdata ={ "LocationSno" :  this.Location.LocationSno }; 
        return this.dataService.HttpPost(postdata, "/deleteLocation");                
    }

    Initialize(){
        let Location: TypeLocation = {
            LocationSno:0,
            Loc_Code: "AUTO",
            Loc_Name: "", 
            Loc_Type: 0,           
            Remarks: "",
            Active_Status: 1,
            Create_Date: 20230908,
            UserSno: this.UserSno,    
            CompSno: this.CompSno,
            BranchSno: this.BranchSno,
            Name: "",
            Details:""
        }
        return Location
    }
}

export interface TypeLocation{
    LocationSno: number;
    Loc_Code?: string;
    Loc_Name?: string;    
    Loc_Type?: number;
    Remarks?: string;
    Active_Status?: number;
    Create_Date?: number;
    UserSno?: number;
    CompSno?: number;
    BranchSno?: number;
    Name?: string;
    Details?: string;
}

