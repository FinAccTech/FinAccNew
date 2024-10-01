import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsSchemes, TypeScheme } from 'src/app/Dashboard/Classes/ClsSchemes';
import { SchemeComponent } from './scheme/scheme.component';
import { AuthService } from 'src/app/Services/auth.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-schemes',
  templateUrl: './schemes.component.html',
  styleUrls: ['./schemes.component.scss']
})

@AutoUnsubscribe
export class SchemesComponent {

  constructor(private dataService: DataService, private auth: AuthService, private globals: GlobalsService, private dialog: MatDialog ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  SchemeList!: TypeScheme[];
  dataSource!: MatTableDataSource<TypeScheme>;  
  columnsToDisplay: string[] = [ '#', 'Scheme_Code', 'Scheme_Name','Roi', 'Calc_Method', 'Active_Status','crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadSchemeList();    
  }

  LoadSchemeList(){    
    let sch = new ClsSchemes(this.dataService);     
    
    sch.getSchemes(0).subscribe ( data => {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.SchemeList = JSON.parse(data.apiData);        
        if (!this.SchemeList){
          this.SchemeList = []
        }
        
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewScheme(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdSchemes, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var sch = new ClsSchemes(this.dataService);    
    this.OpenScheme(sch.Initialize());    
  }

  OpenScheme(sch: TypeScheme){    
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdSchemes, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    let Sno = sch.SchemeSno;    
    const dialogRef = this.dialog.open(SchemeComponent, 
      {
        width:"35vw",
        height:"100vh",
        position:{"right":"0","top":"0" },
        data: {"Scheme": sch},
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.SchemeList.push(result);
          this.LoadDataIntoMatTable();
        }        
      });  
  } 

  DeleteScheme(Scheme: TypeScheme){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdSchemes, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Scheme?").subscribe(Response => {      
      if (Response == 1){
        let sch = new ClsSchemes(this.dataService);
        sch.Scheme = Scheme;
        sch.deleteScheme().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Scheme deleted successfully");
            const index =  this.SchemeList.indexOf(Scheme);
            this.SchemeList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeScheme> (this.SchemeList);       
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
