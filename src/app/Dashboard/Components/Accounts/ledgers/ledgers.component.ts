import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsLedgers, TypeLedger } from 'src/app/Dashboard/Classes/ClsLedgers';
import { AuthService } from 'src/app/Services/auth.service';
import { LedgerComponent } from './ledger/ledger.component';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-ledgers',
  templateUrl: './ledgers.component.html',
  styleUrls: ['./ledgers.component.scss']
})
@AutoUnsubscribe
export class LedgersComponent {

  constructor(private dataService: DataService, private auth: AuthService, private globals: GlobalsService, private dialog: MatDialog ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  LedgerList!: TypeLedger[];
  dataSource!: MatTableDataSource<TypeLedger>;  
  columnsToDisplay: string[] = [ '#', 'Led_Code', 'Led_Name', 'Group', 'IsStd','crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadLedgersList();    
  }

  LoadLedgersList(){    
    let ar = new ClsLedgers(this.dataService);     
    
    ar.getLedgers(0,0,0).subscribe ( data => {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.LedgerList = JSON.parse(data.apiData);        
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewLedger(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLedgers, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var ar = new ClsLedgers(this.dataService);    
    this.OpenLedger(ar.Initialize());    
  }

  OpenLedger(ar: TypeLedger){        
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLedgers, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    const dialogRef = this.dialog.open(LedgerComponent, 
      {        
        height:"100%",
        position:{"right":"0","top":"0" },
        data: ar,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (result == true)
          {
            this.LoadLedgersList();
          }          
        }        
      });  
  } 

  DeleteLedger(Ledger: TypeLedger){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLedgers, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Ledger?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsLedgers(this.dataService);
        ar.Ledger = Ledger;
        ar.deleteLedger().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Ledger deleted successfully");
            const index =  this.LedgerList.indexOf(Ledger);
            this.LedgerList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeLedger> (this.LedgerList);       
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
