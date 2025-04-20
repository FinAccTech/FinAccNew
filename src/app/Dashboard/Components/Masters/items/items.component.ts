import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsItems, TypeItem } from 'src/app/Dashboard/Classes/ClsItems';
import { ItemComponent } from './item/item.component';
import { AuthService } from 'src/app/Services/auth.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeFieldInfo } from 'src/app/Dashboard/Types/TypeFieldInfo';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})

@AutoUnsubscribe
export class ItemsComponent {

  constructor(private dataService: DataService, private auth: AuthService, private globals: GlobalsService, private dialog: MatDialog ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  ItemList: TypeItem[] = [];
  

  FieldNames: TypeFieldInfo[] = [
      {Field_Name:"#", Data_Type:"string" }, 
      {Field_Name:"Item_Code", Data_Type:"string" }, 
      {Field_Name:"Item_Name", Data_Type:"string" }, 
      {Field_Name:"IGroup", Data_Type:"nested", "NestedField":"Grp_Name" },       
      {Field_Name:"Active_Status", Data_Type:"boolean"}, 
      {Field_Name:"Actions", Data_Type:"object" },     
    ]
  
    RemoveSignal: number = 0;

  // dataSource!: MatTableDataSource<TypeItem>;  
  // columnsToDisplay: string[] = [ '#', 'Item_Code', 'Item_Name','IGroup', 'Active_Status','crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadItemsList();
    
  }

  LoadItemsList(){    
    let item = new ClsItems(this.dataService);     
    
    item.getItems(0,0).subscribe ( data => {          
      
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.ItemList = JSON.parse(data.apiData);           
        console.log(this.ItemList);  
        if (!this.ItemList){
          this.ItemList = [];
        }
        // this.LoadDataIntoMatTable();
      }
    },
    error => {
      console.log(error);
      
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewItem(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdItems, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var item = new ClsItems(this.dataService);    
    this.OpenItem(item.Initialize());    
  }

  OpenItem(item: TypeItem){       
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdItems, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    let Sno = item.ItemSno; 
    const dialogRef = this.dialog.open(ItemComponent, 
      {
        data: item,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        {           
          if (Sno !== 0) { return; }
          this.ItemList.push(result);
          // this.LoadDataIntoMatTable();
        }        
      });  
  } 

  DeleteItem(group: TypeItem){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdItems, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Group?").subscribe(Response => {      
      if (Response == 1){
        let item = new ClsItems(this.dataService);
        item.Item = group;
        item.deleteItem().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Group deleted successfully");
            const index =  this.ItemList.indexOf(group);
            this.ItemList.splice(index,1);
            // this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  // LoadDataIntoMatTable(){
  //   this.dataSource = new MatTableDataSource<TypeItem> (this.ItemList);       
  //   if (this.dataSource.filteredData)
  //   {  
  //     setTimeout(() => this.dataSource.paginator = this.paginator);
  //     setTimeout(() => this.dataSource.sort = this.sort);      
  //   }
  // }

  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();

  //   if (this.dataSource.paginator) {
  //     this.dataSource.paginator.firstPage();
  //   }
  // }
 
  handleActionFromTable($event: any){ 
    //Open Group   
    if ($event.Action == 1){
      this.OpenItem($event.Data);
    }
    else if ($event.Action == 2){
      //Delete Group
      this.globals.QuestionAlert("Are you sure you want to delete this Record").subscribe(data=>{
        if (data == 1){
          this.DeleteItem($event.Data);
        }
      });
      
    }
  }

}
