import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsAreas, TypeArea } from 'src/app/Dashboard/Classes/ClsAreas';
import { AreaComponent } from './area/area.component';
import { AuthService } from 'src/app/Services/auth.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';


@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.scss']
})
@AutoUnsubscribe
export class AreasComponent {

  constructor(private dataService: DataService, private auth: AuthService, private globals: GlobalsService, private dialog: MatDialog ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  AreaList!: TypeArea[];
  dataSource!: MatTableDataSource<TypeArea>;  
  columnsToDisplay: string[] = [ '#', 'Area_Code', 'Area_Name', 'Active_Status','crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadAreaList();    
  }

  LoadAreaList(){    
    let ar = new ClsAreas(this.dataService);     
    
    ar.getAreas(0).subscribe ( data => {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.AreaList = JSON.parse(data.apiData);
                
        if (!this.AreaList){
          this.AreaList = [];
        }  
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewArea(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdAreas, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var ar = new ClsAreas(this.dataService);    
    this.OpenArea(ar.Initialize());    
  }

  OpenArea(ar: TypeArea){       
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdAreas, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    let Sno = ar.AreaSno; 
    const dialogRef = this.dialog.open(AreaComponent, 
      {
        data: ar,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        {           
          if (Sno !== 0) { return; }
          this.AreaList.push(result);
          this.LoadDataIntoMatTable()
        }        
      });  
  } 

  DeleteArea(Area: TypeArea){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdAreas, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Area?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsAreas(this.dataService);
        ar.Area = Area;
        ar.deleteArea().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Area deleted successfully");
            const index =  this.AreaList.indexOf(Area);
            this.AreaList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeArea> (this.AreaList);       
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
