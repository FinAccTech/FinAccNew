import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsLedgerGroups, TypeLedgerGroup } from 'src/app/Dashboard/Classes/ClsLedgerGroup';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-ledgergroup',
  templateUrl: './ledgergroup.component.html',
  styleUrls: ['./ledgergroup.component.scss']
})

@AutoUnsubscribe
export class LedgergroupComponent implements OnInit {
  
  LedgerGroup!:          TypeLedgerGroup;  
  DataChanged:    boolean = false;
  GrpsList: TypeLedgerGroup[] = [];
//  SelectedGroupUnder!: TypeLedgerGroup;
  // For Validations  
  CodeAutoGen: boolean = false;
  LedgerGroupNameValid: boolean = true;
  LedegerGroupUnderValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<LedgergroupComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeLedgerGroup,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService
  ) 
  {
    this.LedgerGroup = data;                
  }

  ngOnInit(): void {    
    this.CodeAutoGen = true;    
    let grp = new ClsLedgerGroups(this.dataService);
    grp.getLedgerGroups(0).subscribe(data => {
      this.GrpsList = JSON.parse (data.apiData);
    })
  }

  SaveLedgerGroup(){    
    if (this.ValidateInputs() == false) {return};    
    let ar = new ClsLedgerGroups(this.dataService);
    ar.LedgerGroup = this.LedgerGroup;
        
    ar.saveLedgerGroup().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.globals.SnackBar("info", this.LedgerGroup.GrpSno == 0 ? "Ledger Group Created successfully" : "Ledger Group updated successfully");
          this.DataChanged = true;
          this.CloseDialog();
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteLedgerGroup(){
    if (this.LedgerGroup.GrpSno == 0){
      this.globals.SnackBar("error", "No Ledger Group selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Ledger Group?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsLedgerGroups(this.dataService);
        ar.LedgerGroup = this.LedgerGroup;
        ar.deleteLedgerGroup().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Ledger Group deleted successfully");
            this.DataChanged = true;
            this.CloseDialog();
          }
        })        
      }
    })
  }

  CloseDialog()  {
    this.dialogRef.close(this.DataChanged);
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{            
    if (!this.LedgerGroup.Grp_Name.length )  { this.LedgerGroupNameValid = false;  return false; }  else  {this.LedgerGroupNameValid = true; }        
    if (!this.LedgerGroup.GroupUnder || this.LedgerGroup.GroupUnder.GrpSno ==0 ) 
      {
      this.LedegerGroupUnderValid = false;
      return false;
    }
    else{
      this.LedegerGroupUnderValid = true;
    }
    return true;
  }

  getGroup($event: TypeLedgerGroup){
  //  this.SelectedGroupUnder = $event;
    this.LedgerGroup.GroupUnder = $event;    
  }

}
