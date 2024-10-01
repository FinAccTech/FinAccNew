import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAccReports, TypeLedgerBook, TypeTrialBalance } from 'src/app/Dashboard/Classes/ClsAccReports';
import { TypeCompanies } from 'src/app/Dashboard/Classes/ClsCompanies';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-trialbalance',
  templateUrl: './trialbalance.component.html',
  styleUrls: ['./trialbalance.component.scss']
})

@AutoUnsubscribe
export class TrialbalanceComponent {

  constructor(private globals: GlobalsService, private dataService: DataService, private renderer: Renderer2){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  FromDate: number = 0;
  ToDate: number  = 0;
  Opening_Balance: number = 0;
  Closing_Balance: number = 0;
  TrialBalancelist:       TypeTrialBalance[] = [];
  CompInfo!: TypeCompanies;
  GrpType: number = 0;
  DetType: number = 0;
  ShowTransactions: number = 0;
  
  ngOnInit(){   
    this.CompInfo = JSON.parse (sessionStorage.getItem("sessionSelectedCompany")!);      
    this.FromDate = this.CompInfo.Fin_From;
    this.ToDate   = this.globals.DateToInt(new Date());
    this.LoadTrialBalance(this.CompInfo.Fin_From, this.globals.DateToInt(new Date()));    
  }

  LoadTrialBalance(FromDate: number, ToDate: number){
    let ln = new ClsAccReports(this.dataService);    
    ln.getTrialBalance(1,FromDate, ToDate, this.GrpType, this.DetType).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                        
        this.TrialBalancelist = JSON.parse(data.apiData);         
        let DebitTotal = 0;
        let CreditTotal = 0;
        let TransDebitTotal = 0;
        let TransCreditTotal = 0;

        this.TrialBalancelist.forEach(vou=>{
          DebitTotal += +vou.ClsDr;
          CreditTotal += +vou.ClsCr;
          TransDebitTotal += +vou.TrnDr;
          TransCreditTotal += +vou.TrnCr;
        })
        
        
        this.TrialBalancelist.push({"Sno":0, "IsGrp": 1, "Name" : "Total", "Grp_Level":0, "Grp_Nature":0, "Affect_Gp" :0, "OpnCr" :0, "OpnDr":0, "TrnCr": TransCreditTotal , "TrnDr": TransDebitTotal , "ClsCr":CreditTotal, "ClsDr":DebitTotal})
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  FilterTrialBalance(){
    this.LoadTrialBalance(this.FromDate,this.ToDate);
  }
  
  DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
}
exportexcel(){
  let element = document.getElementById('trialbalance'); 
  const sheet: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
  
  // let element = document.getElementById('Loans'); For Direct Table
  // const sheet4: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
  
  const wb: XLSX.WorkBook = XLSX.utils.book_new();    
  XLSX.utils.book_append_sheet(wb, sheet, 'Trial Balance');  
  
  /* save to file */  
  XLSX.writeFile(wb, "Trial Balance.xlsx");
}

}
function AutoUnsubscrib(target: typeof TrialbalanceComponent): void | typeof TrialbalanceComponent {
  throw new Error('Function not implemented.');
}

