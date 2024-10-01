import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsLocations, TypeLocation } from 'src/app/Dashboard/Classes/ClsLocations';
import { LocationComponent } from './location/location.component';
import { AuthService } from 'src/app/Services/auth.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})

@AutoUnsubscribe
export class LocationsComponent {

  constructor(private dataService: DataService, private auth: AuthService, private globals: GlobalsService, private dialog: MatDialog ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  LocationList!: TypeLocation[];
  dataSource!: MatTableDataSource<TypeLocation>;  
  columnsToDisplay: string[] = [ '#', 'Loc_Code', 'Loc_Name', 'Active_Status','crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadLocationList();    
  }

  LoadLocationList(){    
    let grp = new ClsLocations(this.dataService);     
    
    grp.getLocations(0).subscribe ( data => {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.LocationList = JSON.parse(data.apiData);       
        if (!this.LocationList){
          this.LocationList = [];
        }  
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewLocation(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLocations, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var grp = new ClsLocations(this.dataService);    
    this.OpenLocation(grp.Initialize());    
  }

  OpenLocation(loc: TypeLocation){     
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLocations, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    let Sno = loc.LocationSno;   
    const dialogRef = this.dialog.open(LocationComponent, 
      {
        data: loc,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.LocationList.push (result);
          this.LoadDataIntoMatTable();
        }        
      });  
  } 

  DeleteLocation(Location: TypeLocation){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLocations, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Location?").subscribe(Response => {      
      if (Response == 1){
        let grp = new ClsLocations(this.dataService);
        grp.Location = Location;
        grp.deleteLocation().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Location deleted successfully");
            const index =  this.LocationList.indexOf(Location);
            this.LocationList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeLocation> (this.LocationList);       
    if (this.dataSource.filteredData)
    {  
      setTimeout(() => this.dataSource.paginator = this.paginator);
      setTimeout(() => this.dataSource.sort = this.sort);      
    }
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
}
