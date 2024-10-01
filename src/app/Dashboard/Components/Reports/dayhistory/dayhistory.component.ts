import { Component} from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsReports, TypeDayHistyory, } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dayhistory',
  templateUrl: './dayhistory.component.html',
  styleUrls: ['./dayhistory.component.scss']
})
@AutoUnsubscribe
export class DayhistoryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}
  
  FromDate: number = 0;
  ToDate: number = 0;
  ReportList:       TypeDayHistyory[] = [];
  LoansList:       TypeDayHistyory[] = [];
  ReceiptsList:       TypeDayHistyory[] = [];
  RedemptionsList:       TypeDayHistyory[] = [];
      
  ngOnInit(){
    this.FromDate = this.globals.DateToInt( new Date());
    this.ToDate = this.globals.DateToInt( new Date());
    this.LoadDayHistory();
  }

  LoadDayHistory(){
    let ln = new ClsReports(this.dataService);    
    ln.getDayHistory(this.FromDate, this.ToDate).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                
        this.ReportList = JSON.parse (data.apiData);        
        let LoanPrinTotal = 0;
        let RecPrintTotal = 0;
        let RedPrinTotal = 0;
        let LoanIntTotal = 0;
        let RecIntTotal = 0; 
        let RedIntTotal = 0;


        this.ReportList.forEach(rep=>{
          switch (rep.VouTypeSno) {
            case this.globals.VTypLoanPayment:
              LoanPrinTotal += +rep.Principal;
              LoanIntTotal += +rep.Interest;
              break;          

            case this.globals.VTypLoanReceipt:
              RecPrintTotal += +rep.Principal;
              RecIntTotal += +rep.Interest;
              break;
            case this.globals.VTypLoanRedemption:
              RedPrinTotal += +rep.Principal;
              RedIntTotal += +rep.Interest;
              break;
          }
        })
        this.LoansList = this.ReportList.filter(rep=> rep.VouTypeSno == this.globals.VTypLoanPayment);        
        this.LoansList.push({"TransSno":0,"Trans_No":"","Trans_Date":0,"Party_Name":"Total", "Ref_No":"", "Principal": LoanPrinTotal,"Interest":LoanIntTotal,"UserName":"","VouTypeSno": this.globals.VTypLoanPayment })
        this.ReceiptsList = this.ReportList.filter(rep=> rep.VouTypeSno == this.globals.VTypLoanReceipt);
        this.ReceiptsList.push({"TransSno":0,"Trans_No":"","Trans_Date":0,"Party_Name":"", "Ref_No":"Total", "Principal": RecPrintTotal,"Interest":RecIntTotal,"UserName":"","VouTypeSno": this.globals.VTypLoanReceipt })
        this.RedemptionsList = this.ReportList.filter(rep=> rep.VouTypeSno == this.globals.VTypLoanRedemption);        
        this.RedemptionsList.push({"TransSno":0,"Trans_No":"","Trans_Date":0,"Party_Name":"", "Ref_No":"Total", "Principal": RedPrinTotal,"Interest":RedIntTotal,"UserName":"","VouTypeSno": this.globals.VTypLoanRedemption })
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  exportexcel(): void
  {
    let LoanExcelList: Array<any> = [];
    let i = 1;
    this.LoansList.forEach(ln=>{
      if (ln.Party_Name == "Total"){
        LoanExcelList.push({ "#": "", "Loan_No": "", "Loan_Date": "", "Customer": "Total", "Principal": ln.Principal, "Interest" : ln.Interest, "User" : ln.UserName});
      }
      else{
        LoanExcelList.push({ "#": i, "Loan_No": ln.Trans_No, "Loan_Date": this.globals.IntToDateString (ln.Trans_Date), "Customer": ln.Party_Name, "Principal": ln.Principal, "Interest" : ln.Interest, "User" : ln.UserName});
      }      
      i++;
    });

    i=1;
    let ReceiptExcelList: Array<any> = [];
    this.ReceiptsList.forEach(ln=>{
      if (ln.Ref_No == "Total"){
        ReceiptExcelList.push({ "#": "", "Receipt_No": "", "Receipt_Date": "", "Customer": "", "Loan_No": "Total", "Principal": ln.Principal, "Interest" : ln.Interest, "User" : ln.UserName});
      }
      else{
        ReceiptExcelList.push({"#": i, "Receipt_No": ln.Trans_No, "Receipt_Date": this.globals.IntToDateString (ln.Trans_Date), "Customer": ln.Party_Name, "Loan_No": ln.Ref_No, "Principal": ln.Principal, "Interest" : ln.Interest, "User" : ln.UserName});
      }
      i++;
    })

    i=1;
    let RedemptionExcelList: Array<any> = [];
    this.RedemptionsList.forEach(ln=>{
      if (ln.Ref_No == "Total"){
        RedemptionExcelList.push({ "#": "", "Redemption_No": "", "Redemption_Date": "", "Customer": "", "Loan_No": "Total", "Principal": ln.Principal, "Interest" : ln.Interest, "User" : ln.UserName});
      }
      else{
      RedemptionExcelList.push({"#": i, "Redemption_No": ln.Trans_No, "Redemption_Date": this.globals.IntToDateString (ln.Trans_Date), "Customer": ln.Party_Name, "Loan_No": ln.Ref_No, "Principal": ln.Principal, "Interest" : ln.Interest, "User" : ln.UserName});
      }
      i++;
    })

    const sheet1: XLSX.WorkSheet =XLSX.utils.json_to_sheet(LoanExcelList);
    const sheet2: XLSX.WorkSheet =XLSX.utils.json_to_sheet(ReceiptExcelList);
    const sheet3: XLSX.WorkSheet =XLSX.utils.json_to_sheet(RedemptionExcelList);
    
    // let element = document.getElementById('Loans'); For Direct Table
    // const sheet4: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    
    const wb: XLSX.WorkBook = XLSX.utils.book_new();    
    XLSX.utils.book_append_sheet(wb, sheet1, 'Loans');
    XLSX.utils.book_append_sheet(wb, sheet2, 'Receipts');
    XLSX.utils.book_append_sheet(wb, sheet3, 'Redemptions');
    
    /* save to file */  
    XLSX.writeFile(wb, "DayHistory for " + this.globals.IntToDateString  (this.FromDate) + " to " + this.globals.IntToDateString  (this.ToDate)  +".xlsx");
 
  }

}
