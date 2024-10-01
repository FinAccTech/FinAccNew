import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ItemgroupComponent } from './itemgroup/itemgroup.component';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsItemGroups, TypeItemGroup } from 'src/app/Dashboard/Classes/ClsItemGroups';
import { AuthService } from 'src/app/Services/auth.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-itemgroups',
  templateUrl: './itemgroups.component.html',
  styleUrls: ['./itemgroups.component.scss']
})
@AutoUnsubscribe
export class ItemgroupsComponent {

  constructor(private dataService: DataService, private globals: GlobalsService, private dialog: MatDialog, private auth: AuthService ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  ItemGroupList!: TypeItemGroup[];
  dataSource!: MatTableDataSource<TypeItemGroup>;  
  columnsToDisplay: string[] = [ '#', 'Grp_Code', 'Grp_Name','Market_Rate', 'Loan_PerGram', 'Active_Status','crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadGroupList();    
  }

  LoadGroupList(){    
    let grp = new ClsItemGroups(this.dataService);     
    
    grp.getItemGroups(0).subscribe ( data => {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.ItemGroupList = JSON.parse(data.apiData);
        if (!this.ItemGroupList){
          this.ItemGroupList = [];
        }
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewGroup(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdItemGroups, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var grp = new ClsItemGroups(this.dataService);    
    this.OpenItemGroup(grp.Initialize());    
  }

  OpenItemGroup(grp: TypeItemGroup){       
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdItemGroups, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; } 
    let Sno = grp.GrpSno;
    const dialogRef = this.dialog.open(ItemgroupComponent, 
      {
        data: grp,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.ItemGroupList.push(result);
          this.LoadDataIntoMatTable();          
        }        
      });  
  } 

  DeleteItemGroup(group: TypeItemGroup){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdItemGroups, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Group?").subscribe(Response => {      
      if (Response == 1){
        let grp = new ClsItemGroups(this.dataService);
        grp.ItemGroup = group;
        grp.deleteItemGroup().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Group deleted successfully");
            const index =  this.ItemGroupList.indexOf(group);
            this.ItemGroupList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeItemGroup> (this.ItemGroupList);       
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
