import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsLedgerGroups, TypeLedgerGroup } from 'src/app/Dashboard/Classes/ClsLedgerGroup';
import { ClsLedgers, TypeLedger } from 'src/app/Dashboard/Classes/ClsLedgers';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-ledger',
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.scss']
})

@AutoUnsubscribe
export class LedgerComponent implements OnInit {  
  Ledger!:          TypeLedger;  
  DataChanged:    boolean = false;
  GrpsList: TypeLedger[] = [];
//  SelectedGroupUnder!: TypeLedger;
  // For Validations  
  CodeAutoGen: boolean = false;
  LedgerNameValid: boolean = true;
  LedegerGroupUnderValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<LedgerComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeLedger,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService 
  ) 
  {
    this.Ledger = data;                
  }

  ngOnInit(): void {    
    this.CodeAutoGen = true;    
    let grp = new ClsLedgerGroups(this.dataService);
    grp.getLedgerGroups(0).subscribe(data => {
      this.GrpsList = JSON.parse (data.apiData);
    })
    console.log(this.Ledger);
    
  }

  SaveLedger(){    
    if (this.ValidateInputs() == false) {return};    
    let ar = new ClsLedgers(this.dataService);
    ar.Ledger = this.Ledger;
        
    ar.saveLedger().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.globals.SnackBar("info", this.Ledger.LedSno == 0 ? "Ledger Created successfully" : "Ledger Group updated successfully");
          this.DataChanged = true;
          this.CloseDialog();
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteLedger(){
    if (this.Ledger.LedSno == 0){
      this.globals.SnackBar("error", "No Ledger Group selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Ledger Group?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsLedgers(this.dataService);
        ar.Ledger = this.Ledger;
        ar.deleteLedger().subscribe(data => {
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
    if (!this.Ledger.Led_Name.length )  { this.LedgerNameValid = false;  return false; }  else  {this.LedgerNameValid = true; }        
    if (!this.Ledger.Group || this.Ledger.Group.GrpSno ==0 ) 
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
    this.Ledger.Group = $event;    
  }

}
