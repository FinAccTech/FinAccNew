import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsLedgerGroups, TypeLedgerGroup } from 'src/app/Dashboard/Classes/ClsLedgerGroup';
import { LedgergroupComponent } from './ledgergroup/ledgergroup.component';
import { AuthService } from 'src/app/Services/auth.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-ledgergroups',
  templateUrl: './ledgergroups.component.html',
  styleUrls: ['./ledgergroups.component.scss']
})
@AutoUnsubscribe
export class LedgergroupsComponent {

  constructor(private dataService: DataService, private auth: AuthService, private globals: GlobalsService, private dialog: MatDialog ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  LedgerGroupList!: TypeLedgerGroup[];
  dataSource!: MatTableDataSource<TypeLedgerGroup>;  
  columnsToDisplay: string[] = [ '#', 'Grp_Code', 'Grp_Name', 'GroupUnder', 'IsStd','crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadLedgerGroupsList();    
  }

  LoadLedgerGroupsList(){    
    let ar = new ClsLedgerGroups(this.dataService);     
    
    ar.getLedgerGroups(0).subscribe ( data => {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.LedgerGroupList = JSON.parse(data.apiData);
        console.log (this.LedgerGroupList)
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewLedgerGroup(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLedgerGroups, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var ar = new ClsLedgerGroups(this.dataService);    
    this.OpenLedgerGroup(ar.Initialize());    
  }

  OpenLedgerGroup(ar: TypeLedgerGroup){   
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLedgerGroups, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }     
    const dialogRef = this.dialog.open(LedgergroupComponent, 
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
            this.LoadLedgerGroupsList();
          }          
        }        
      });  
  } 

  DeleteLedgerGroup(LedgerGroup: TypeLedgerGroup){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLedgerGroups, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this LedgerGroup?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsLedgerGroups(this.dataService);
        ar.LedgerGroup = LedgerGroup;
        ar.deleteLedgerGroup().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","LedgerGroup deleted successfully");
            const index =  this.LedgerGroupList.indexOf(LedgerGroup);
            this.LedgerGroupList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeLedgerGroup> (this.LedgerGroupList);       
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
