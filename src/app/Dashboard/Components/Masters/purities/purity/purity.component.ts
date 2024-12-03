import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsItemGroups, TypeItemGroup } from 'src/app/Dashboard/Classes/ClsItemGroups';
import { ClsPurities, TypePurity } from 'src/app/Dashboard/Classes/ClsPurities';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-purity',
  templateUrl: './purity.component.html',
  styleUrls: ['./purity.component.scss']
})

@AutoUnsubscribe
export class PurityComponent implements OnInit {
  
  Purity!:          TypePurity;
  GroupsList!:    TypeItemGroup[];
  SelectedGroup!: TypeItemGroup;
  
  // For Validations  
  CodeAutoGen: boolean = false;
  PurityNameValid: boolean = true;
  PurityValid: boolean = true;
  GrpNameValid: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<PurityComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypePurity,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService
  ) 
  {
    this.Purity = data;            
    this.SelectedGroup = this.data.IGroup!;    
  }

  ngOnInit(): void {    
    
      if (this.globals.AppSetup().PurityCode_AutoGen== 1){
        this.CodeAutoGen = true;
        if (this.Purity.PuritySno == 0){      
        let it = new ClsPurities(this.dataService)
        it.getPurityCode().subscribe(data => {
          this.Purity.Purity_Code = data.apiData;
        })
      }
      }
    
    let grp = new ClsItemGroups(this.dataService);
    grp.getItemGroups(0).subscribe(data => {      
      this.GroupsList = JSON.parse (data.apiData);   
    });    
  }

  SavePurity(){    
    if (this.ValidateInputs() == false) {return};    
    let pur = new ClsPurities(this.dataService);    
    pur.Purity = this.Purity;
    pur.Purity.BranchSno = this.auth.SelectedBranchSno;
    pur.savePurity().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          pur.Purity.PuritySno = data.RetSno;
          pur.Purity.Name = pur.Purity.Purity_Name;
          pur.Purity.Details = 'Purity: ' + pur.Purity.Purity;
          this.globals.SnackBar("info", this.Purity.PuritySno == 0 ? "Purity Created successfully" : "Purity updated successfully");  
          this.CloseDialog(pur.Purity);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeletePurity(){
    if (this.Purity.PuritySno == 0){
      this.globals.SnackBar("error", "No Purity selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Purity?").subscribe(Response => {      
      if (Response == 1){
        let pur = new ClsPurities(this.dataService);
        pur.Purity = this.Purity;
        pur.deletePurity().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Purity deleted successfully");            
            this.CloseDialog(pur.Purity);
          }
        })        
      }
    })
  }

  CloseDialog(pur: TypePurity)  {
    this.dialogRef.close(pur);
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{            
    if (!this.Purity.Purity_Name.length )  { this.PurityNameValid = false;  return false; }  else  {this.PurityNameValid = true; }    
    if (!this.Purity.IGroup  || this.Purity.IGroup.GrpSno == 0)  { this.GrpNameValid = false;  return false; }  else  {this.GrpNameValid = true; }    
    if (!this.Purity.Purity )  { this.PurityValid = false;  return false; }  else  {this.PurityValid = true; }    
    
    return true;
  }
  // SetActiveStatus($event: any){    
  //   console.log (this.ItemGroup.Active_Status);
  //   console.log ($event.target.checked);
  // }
  getGroup($event: TypeItemGroup){
    this.SelectedGroup = $event;
    this.Purity.IGroup = this.SelectedGroup;    
  }
}
