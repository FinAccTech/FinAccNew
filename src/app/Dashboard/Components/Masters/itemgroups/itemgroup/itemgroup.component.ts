import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsItemGroups, TypeItemGroup } from 'src/app/Dashboard/Classes/ClsItemGroups';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';


interface RestrictType{ 
  value : number;
  text: string;
} 

@Component({
  selector: 'app-itemgroup',
  templateUrl: './itemgroup.component.html',
  styleUrls: ['./itemgroup.component.scss']
})
@AutoUnsubscribe
export class ItemgroupComponent implements OnInit {

  RestrictTypesList: RestrictType[] = [
    {value: 0, text: "Allow"},
    {value: 1, text: "Restrict"},
    {value: 2, text: "Show Alert"},    
  ];
  
  ItemGroup!: TypeItemGroup;

  // For Validations  
  CodeAutoGen: boolean = false;
  GrpNameValid: boolean = true;
  MarketRateValid: boolean = true;
  LPGValid: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ItemgroupComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeItemGroup,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService
  ) 
  {
    this.ItemGroup = data;    
  }

  ngOnInit(): void {    
    if (this.ItemGroup.GrpSno == 0){      
      if (this.globals.AppSetup.GrpCode_AutoGen == 1){
        this.CodeAutoGen = true;
        let it = new ClsItemGroups(this.dataService)
        it.getGrpCode().subscribe(data => {
          this.ItemGroup.Grp_Code = data.apiData;
        })
      }
    }
  }

  SaveItemGroup(){    
    if (this.ValidateInputs() == false) {return};    
    let grp = new ClsItemGroups(this.dataService);
    grp.ItemGroup = this.ItemGroup;
    grp.ItemGroup.BranchSno = this.auth.SelectedBranchSno;
    grp.saveItemGroup().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          grp.ItemGroup.GrpSno = data.RetSno;
          grp.ItemGroup.Name = grp.ItemGroup.Grp_Name;
          grp.ItemGroup.Details = 'Code: '  + grp.ItemGroup.Grp_Code;
          this.globals.SnackBar("info", this.ItemGroup.GrpSno == 0 ? "Group created successfully" : "Group updated successfully");          
          this.CloseDialog(grp.ItemGroup);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteItemGroup(){
    if (this.ItemGroup.GrpSno == 0){
      this.globals.SnackBar("error", "No Group selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Group?").subscribe(Response => {      
      if (Response == 1){
        let grp = new ClsItemGroups(this.dataService);
        grp.ItemGroup = this.ItemGroup;
        grp.deleteItemGroup().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Group deleted successfully");
            this.CloseDialog(grp.ItemGroup);
          }
        })        
      }
    })
  }

  CloseDialog(grp: TypeItemGroup)  {
    this.dialogRef.close(grp);
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{        
    if (!this.ItemGroup.Grp_Name!.length )  { this.GrpNameValid = false;  return false; }  else  {this.GrpNameValid = true; }
    if (!this.ItemGroup.Market_Rate)  { this.MarketRateValid = false; return false; } else { this.MarketRateValid = true; }
    if (!this.ItemGroup.Loan_PerGram) { this.LPGValid = false;  return false; } else { this.LPGValid = true;}
    return true;
  }
  // SetActiveStatus($event: any){    
  //   console.log (this.ItemGroup.Active_Status);
  //   console.log ($event.target.checked);
  // }
}
