import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { PurityComponent } from './purity/purity.component';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsPurities, TypePurity } from 'src/app/Dashboard/Classes/ClsPurities';
import { AuthService } from 'src/app/Services/auth.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-purities',
  templateUrl: './purities.component.html',
  styleUrls: ['./purities.component.scss']
})

@AutoUnsubscribe
export class PuritiesComponent {

  constructor(private dataService: DataService, private auth: AuthService, private globals: GlobalsService, private dialog: MatDialog ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  PuritiesList!: TypePurity[];
  dataSource!: MatTableDataSource<TypePurity>;  
  columnsToDisplay: string[] = [ '#', 'Purity_Code', 'Purity_Name', 'Purity','IGroup', 'Active_Status','crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadPuritiesList();
  } 

  LoadPuritiesList(){
    let itm = new ClsPurities(this.dataService);    
    itm.getPurities(0,0).subscribe( data => {    
      console.log (data);
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.PuritiesList = JSON.parse(data.apiData);      
        if (!this.PuritiesList){
          this.PuritiesList = [];
        }  
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewPurity(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdPurity, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var pur = new ClsPurities(this.dataService);    
    this.OpenPurity(pur.Initialize());    
  }

  OpenPurity(pur: TypePurity){    
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdPurity, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    let Sno = pur.PuritySno;
    const dialogRef = this.dialog.open(PurityComponent, 
      {
        data: pur,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.PuritiesList.push(result);
          this.LoadDataIntoMatTable();
        }        
      });  
  } 

  DeletePurity(purity: TypePurity){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdPurity, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Purity?").subscribe(Response => {      
      if (Response == 1){
        let pur = new ClsPurities(this.dataService);
        pur.Purity = purity;
        pur.deletePurity().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Purity deleted successfully");
            const index =  this.PuritiesList.indexOf(purity);
            this.PuritiesList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypePurity> (this.PuritiesList);         
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
