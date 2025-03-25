import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsReports } from '../../Classes/ClsReports';
import { TypeParties } from '../../Classes/ClsParties';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-loan-selection',
  templateUrl: './loan-selection.component.html',
  styleUrls: ['./loan-selection.component.scss']
})
@AutoUnsubscribe
export class LoanSelectionComponent { 
  LoanData: any[] = [];

  searchText: string = "";

  constructor(
    public dialogRef: MatDialogRef<LoanSelectionComponent>,
    private globals: GlobalsService,
    @Inject(MAT_DIALOG_DATA) public data: any,        
    private dataService: DataService
  )  {}

  ngOnInit(){
    this.LoanData = this.data.LoanData;
    // let rep = new ClsReports(this.dataService);
    //   rep.getCustomerDetailed(this.data.PartySno).subscribe(data =>{        
    //     //this.CustomerDetails = JSON.parse (data.apiData)[0];                
    //     this.LoanData = JSON.parse(JSON.parse (data.apiData)[0].Loans_Json!);                
    //     this.LoanData = this.LoanData.filter(ln => {
    //       return (ln.Approval_Status == this.globals.ApprovalStatusApproved) && (ln.Loan_Status == this.globals.LoanStatusOpen || ln.Loan_Status == this.globals.LoanStatusMatured)
    //     })
    //   })
  }

  SelectLoan(loan: any){        
    this.dialogRef.close(loan);
  }
}
