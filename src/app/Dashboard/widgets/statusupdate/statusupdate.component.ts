import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsTransactions } from '../../Classes/ClsTransactions';
import { DataService } from 'src/app/Services/data.service';
import { AuthService } from 'src/app/Services/auth.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-statusupdate',
  templateUrl: './statusupdate.component.html',
  styleUrls: ['./statusupdate.component.scss']
})

@AutoUnsubscribe
export class StatusupdateComponent {
  
  Update_Type: number = 0;
  Document_Type: number = 0;
  UpdateTypeCaption: string = "";
  Approval_Date: number = 0;
  Remarks: string = "";

  constructor(    
    private auth: AuthService,
    private globals: GlobalsService,
    private dataService: DataService,
    public dialogRef: MatDialogRef<StatusupdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,        
    public dialog: MatDialog
  ) {} 

  ngOnInit(){
    this.Approval_Date = this.globals.DateToInt(new Date());
    this.Update_Type = this.data.Updation_Type;        
    this.Document_Type = this.data.Document_Type;        
    this.UpdateTypeCaption = this.Update_Type == 1 ? "Approve Loan" : "Cancel Loan";
  }

  Submit(print: boolean){    
    let trans = new ClsTransactions(this.dataService);
    trans.updateStatus(this.Update_Type, this.Document_Type, this.data.LoanSno, 1, this.Remarks).subscribe(data =>{
      if (data.queryStatus == 1){
        this.globals.SnackBar("info",  this.Update_Type == 1 ? "Approved" : "Cancelled" + " successfully")
        this.CloseDialog(print);
      }
      else{
        this.globals.ShowAlert(3,data.apiData);
      }
    })    
  }

  CloseDialog(print: boolean){
    this.dialogRef.close(print);
  }
  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
}
