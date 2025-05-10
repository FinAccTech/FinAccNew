import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsReports } from '../../Classes/ClsReports';
import { TypeLoan } from '../../Classes/ClsLoan';
import { ExcelExportService } from 'src/app/Services/excel-export.service';

@AutoUnsubscribe
@Component({
  selector: 'app-pendingpayments',
  standalone: true,
  imports: [MatDialogClose],
  templateUrl: './pendingpayments.component.html',
  styleUrl: './pendingpayments.component.scss'
})

export class PendingpaymentsComponent {

    constructor(
      public dialogRef: MatDialogRef<PendingpaymentsComponent>,
      private globals: GlobalsService,
      @Inject(MAT_DIALOG_DATA) public data: any,        
      private dataService: DataService,
      private excelService: ExcelExportService,      
    )  {}

  LoansList: TypeLoan[] = [];

    ngOnInit(){
      let rep = new ClsReports(this.dataService)
      rep.getPendingLoanPayments().subscribe(data=>{        
        this.LoansList =     JSON.parse(data.apiData);
        this.LoansList.map(ln=>{
          ln.Customer = JSON.parse (ln.Party_Json)[0];
        })
      })
    }

    DownloadasExcel(){
      let ExcelData: any = [];
      this.LoansList.forEach((ln: TypeLoan)=>{
        ExcelData.push({"IFSC Code": ln.Customer.Bank_Ifsc, "Account Number": ln.Customer.Bank_AccountNo, "Beneficiary Name": ln.Customer.Bank_AccName, 
          "Sender Information": "Loan Disbursed","Amount": ln.Nett_Payable
         })
      });

      this.excelService.exportAsExcelFile(ExcelData,"Payments List");
      this.globals.SnackBar("info","Payment List downloaded successfully")
    }
    
}
