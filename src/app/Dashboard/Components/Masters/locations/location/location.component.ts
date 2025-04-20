import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsLocations, TypeLocation } from 'src/app/Dashboard/Classes/ClsLocations';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})

@AutoUnsubscribe
export class LocationComponent implements OnInit {
  
  Location!:      TypeLocation;  
  
  // For Validations  
  CodeAutoGen: boolean = false;
  LocationNameValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<LocationComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeLocation,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService
  ) 
  {
    this.Location = data;                
  }

  ngOnInit(): void {    
      if (this.globals.AppSetup()[0].LocCode_AutoGen == 1){
        this.CodeAutoGen = true;
        if (this.Location.LocationSno == 0){      
          let it = new ClsLocations(this.dataService)
          it.getLocationCode().subscribe(data => {
            this.Location.Loc_Code = data.apiData;
          })
        }
      }
    
  }

  SaveLocation(){    
    if (this.ValidateInputs() == false) {return};    
    let loc = new ClsLocations(this.dataService);
    loc.Location = this.Location;
    loc.Location.BranchSno = this.auth.SelectedBranchSno();
    
    loc.saveLocation().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          loc.Location.LocationSno = data.RetSno;
          loc.Location.Name = loc.Location.Loc_Name;
          loc.Location.Details = 'Code: ' + loc.Location.Loc_Code;
          this.globals.SnackBar("info", this.Location.LocationSno == 0 ? "Location Created successfully" : "Location updated successfully");  
          this.CloseDialog(loc.Location);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteLocation(){
    if (this.Location.LocationSno == 0){
      this.globals.SnackBar("error", "No Location selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Location?").subscribe(Response => {      
      if (Response == 1){
        let loc = new ClsLocations(this.dataService);
        loc.Location = this.Location;
        loc.deleteLocation().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Location deleted successfully");            
            this.CloseDialog(loc.Location);
          }
        })        
      }
    })
  }

  CloseDialog(loc: TypeLocation)  {
    this.dialogRef.close(loc);
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{            
    if (!this.Location.Loc_Name!.length )  { this.LocationNameValid = false;  return false; }  else  {this.LocationNameValid = true; }        
    return true;
  }
  
}
