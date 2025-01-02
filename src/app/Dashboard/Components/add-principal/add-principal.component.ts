import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { GlobalsService } from 'src/app/Services/globals.service';
import { TypeLoanPayments } from '../../Types/TypeLoanPayments';
import { ClsTransactions } from '../../Classes/ClsTransactions';
import { DataService } from 'src/app/Services/data.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-add-principal',
  templateUrl: './add-principal.component.html',
  styleUrls: ['./add-principal.component.scss']
})

@AutoUnsubscribe
export class AddPrincipalComponent { 
  PaymentDate: number = 0;
  Amount: number  = 0;
  Remarks: string = "";

  PaymentsList: TypeLoanPayments[]= [];
  CurrentPayment!: TypeLoanPayments;

  constructor(
    public dialogRef: MatDialogRef<AddPrincipalComponent>,
    private globals: GlobalsService,
    @Inject(MAT_DIALOG_DATA) public data: any,        
    private dataService: DataService
  )  {}

  ngOnInit(){
    this.PaymentDate =  this.globals.DateToInt(new Date());
    let trans = new ClsTransactions(this.dataService);
    trans.getLoan_Payments(this.data.LoanSno).subscribe(data =>{      
      this.PaymentsList = JSON.parse(data.apiData);
    })
  }
  
  AddPayment(){
    if (this.Amount == 0) {this.globals.SnackBar("error","Amount is empty"); return;}    
    if ((this.PaymentDate > this.globals.DateToInt(new Date())) || (this.PaymentDate <= this.data.Loan_Date)  ) { this.globals.SnackBar("error","Invalid date !!!"); return; }

    if (this.CurrentPayment){
      this.CurrentPayment.Pmt_Date = this.PaymentDate;
      this.CurrentPayment.Amount = this.Amount;
      this.CurrentPayment.Remarks = this.Remarks;
      this.CurrentPayment = null!; 
    }

    else{
      this.PaymentsList.push({"PmtSno":0, "Pmt_Date": this.PaymentDate, "Amount": this.Amount, "Remarks" : this.Remarks })
    }
    
    this.Amount = 0;
    this.Remarks = "";
  }

  DeletePayment(index: number){
    this.PaymentsList.splice(index,1);
  }

  SelectCurrentPayment(pmt: TypeLoanPayments){
    this.CurrentPayment = pmt;
    this.PaymentDate = pmt.Pmt_Date;
    this.Amount = pmt.Amount;
    this.Remarks = pmt.Remarks;
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  SaveandClose(){
    let trans = new ClsTransactions(this.dataService);
    // if (this.PaymentsList.length < 1){
    //   this.globals.SnackBar("error", "No Payments to update.!!");
    //   return;
    // }

    var StrPaymentXml = "";
    StrPaymentXml = "<ROOT>"
    StrPaymentXml += "<Payments>"
  
    this.PaymentsList.forEach(pmt=>{
      StrPaymentXml += "<Payment_Details ";
      StrPaymentXml += " Pmt_Date='" + pmt.Pmt_Date + "' ";                 
      StrPaymentXml += " Amount='" + pmt.Amount + "' ";             
      StrPaymentXml += " Remarks='" + pmt.Remarks + "' ";                   
      StrPaymentXml += " >";
      StrPaymentXml += "</Payment_Details>";    
    })

  StrPaymentXml += "</Payments>"
  StrPaymentXml += "</ROOT>";

    trans.insertLoan_Payments(this.data.LoanSno, StrPaymentXml).subscribe(data =>{
      if (data.queryStatus == 0){
        this.globals.ShowAlert(3,"Error updating payments..");
        return;
      }
      else{
        this.globals.SnackBar("info","Payment updated successfully");
        setTimeout(() => {
          this.dialogRef.close();  
        }, 1000);        
      }
    });
  }
}
