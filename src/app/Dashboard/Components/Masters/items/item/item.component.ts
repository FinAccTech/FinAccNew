import { JsonPipe } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAppSetup } from 'src/app/Dashboard/Classes/ClsAppSetup';
import { ClsItemGroups, TypeItemGroup } from 'src/app/Dashboard/Classes/ClsItemGroups';
import { ClsItems, TypeItem } from 'src/app/Dashboard/Classes/ClsItems';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';


@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})

@AutoUnsubscribe
export class ItemComponent implements OnInit {
  
  Item!:          TypeItem;
  GroupsList!:    TypeItemGroup[]; 
  SelectedGroup!: TypeItemGroup;
  DataChanged:    boolean = false;

  // For Validations  
  CodeAutoGen: boolean = false;
  ItemNameValid: boolean = true;
  GrpNameValid: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ItemComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeItem,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService
  ) 
  {
    this.Item = data;      
    this.SelectedGroup = this.data.IGroup!;    
  }

  ngOnInit(): void {        

      if (this.globals.AppSetup()[0].ItemCode_AutoGen == 1){ 
        this.CodeAutoGen = true;
        if (this.Item.ItemSno == 0){      
          let it = new ClsItems(this.dataService)
          it.getItemCode().subscribe(data => {
            this.Item.Item_Code = data.apiData;
          })
        }
      }    

    let grp = new ClsItemGroups(this.dataService);
    grp.getItemGroups(0).subscribe(data => {      
      this.GroupsList = JSON.parse (data.apiData);   
    });    
  }

  SaveItem(){          
    if (this.ValidateInputs() == false) {return};    
    let itm = new ClsItems(this.dataService);
    itm.Item = this.Item; 
    itm.Item.BranchSno = this.auth.SelectedBranchSno;
    itm.saveItem().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          itm.Item.ItemSno = data.RetSno;
          itm.Item.Name = itm.Item.Item_Name;
          itm.Item.Details = 'Code: ' +  itm.Item.Item_Code;

          this.globals.SnackBar("info", this.Item.ItemSno == 0 ? "Item Created successfully" : "Item updated successfully");                    
          this.CloseDialog(itm.Item);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteItem(){
    if (this.Item.ItemSno == 0){
      this.globals.SnackBar("error", "No Item selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Item?").subscribe(Response => {      
      if (Response == 1){
        let itm = new ClsItems(this.dataService);
        itm.Item = this.Item;
        itm.deleteItem().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Item deleted successfully");
            this.DataChanged = true;
            this.CloseDialog(itm.Item);
          }
        })        
      }
    })
  }

  CloseDialog(item: TypeItem)  {
    this.dialogRef.close(item);
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{            
    if (!this.Item.Item_Name.length )  { this.ItemNameValid = false;  return false; }  else  {this.ItemNameValid = true; }   
    
    if (!this.Item.IGroup || this.Item.IGroup.GrpSno == 0 )  { this.GrpNameValid = false;  return false; }  else  {this.GrpNameValid = true; }    
    return true;
  }
  // SetActiveStatus($event: any){    
  //   console.log (this.ItemGroup.Active_Status);
  //   console.log ($event.target.checked);
  // }
  getGroup($event: TypeItemGroup){
    this.SelectedGroup = $event;
    this.Item.IGroup = this.SelectedGroup;    
  }
}
