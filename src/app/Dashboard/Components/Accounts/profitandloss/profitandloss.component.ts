import { Component, ElementRef, ViewChild } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAccReports, TypeBalanceSheet } from 'src/app/Dashboard/Classes/ClsAccReports';
import { TypeCompanies } from 'src/app/Dashboard/Classes/ClsCompanies';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import * as XLSX from 'xlsx';

interface TypeBsHtmlList {
  LeftDetails: string;
  LeftAmount: any;
  RightDetails: string;
  RightAmount: any;
  IsGrp: boolean;
}

@Component({
  selector: 'app-profitandloss',
  templateUrl: './profitandloss.component.html',
  styleUrls: ['./profitandloss.component.scss']
})

@AutoUnsubscribe
export class ProfitandlossComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  FromDate: number = 0;
  ToDate: number  = 0;
  Opening_Balance: number = 0;
  Closing_Balance: number = 0;
  ProfitandLosslist:       TypeBalanceSheet[] = [];
  BsHtmlList: TypeBsHtmlList[] = [];
  CompInfo!: TypeCompanies;
  GrpType: number = 1;
  DetType: number = 0;
  ShowTransactions: number = 0;
  
  ngOnInit(){   
    this.CompInfo = JSON.parse (sessionStorage.getItem("sessionSelectedCompany")!);      
    this.FromDate = this.CompInfo.Fin_From;
    this.ToDate   = this.globals.DateToInt(new Date());
    this.LoadProfitandLoss(this.CompInfo.Fin_From, this.globals.DateToInt(new Date()));    
  }

  LoadProfitandLoss(FromDate: number, ToDate: number){
    let ln = new ClsAccReports(this.dataService);    
    ln.getProfitandLoss(FromDate, ToDate, this.GrpType).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                        
        this.ProfitandLosslist = JSON.parse(data.apiData);   
        console.log(this.ProfitandLosslist);
        
        this.BsHtmlList = [];      
        let expenses = 0;
        let incomes = 0;
        let profit = false;

        this.ProfitandLosslist.forEach(dt=>{
          if (dt.Amount > 0 || dt.Amount < 0){
            if (dt.Affect_Gp == 1){            
                if (dt.Grp_Nature == 3)
                {
                  this.BsHtmlList.push({"LeftDetails": dt.Name ,"LeftAmount": dt.Amount, "RightDetails" : '', "RightAmount":0, "IsGrp": false });            
                  expenses += +dt.Amount;
                }
                else if (dt.Grp_Nature === 4){
                  this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": 0, "RightDetails" : dt.Name, "RightAmount":dt.Amount, "IsGrp": false });
                  incomes += +dt.Amount;
                }                
            }
          }
        });

        incomes = Math.abs(incomes);
        expenses = Math.abs(expenses);
        
        if (incomes >= expenses){          
          this.BsHtmlList.push({"LeftDetails": 'Gross Profit C/o', "LeftAmount": incomes-expenses, "RightDetails" : '', "RightAmount":0, "IsGrp": false });
          this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": '', "RightDetails" : '', "RightAmount": '', "IsGrp": false });
          this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": incomes , "RightDetails" : '', "RightAmount": incomes, "IsGrp": true });
          this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": '', "RightDetails" : '', "RightAmount": '', "IsGrp": false });
        }
        else
        {          
          this.BsHtmlList.push({"LeftDetails": '', "LeftAmount":0 , "RightDetails" : 'Gross Loss B/f', "RightAmount":expenses-incomes , "IsGrp": false });
          this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": '', "RightDetails" : '', "RightAmount": '', "IsGrp": false });
          this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": expenses, "RightDetails" : '', "RightAmount": expenses, "IsGrp": true });
          this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": '', "RightDetails" : '', "RightAmount": '', "IsGrp": false });
        }
        
        let netexpenses = 0;
        let netincomes = 0;

        this.ProfitandLosslist.forEach(dt=>{
          // if (dt.Amount > 0 || dt.Amount < 0){
            if (dt.Affect_Gp !== 1){            
                if (dt.Grp_Nature == 3)
                {
                  this.BsHtmlList.push({"LeftDetails": dt.Name ,"LeftAmount": dt.Amount, "RightDetails" : '', "RightAmount":0, "IsGrp": false });            
                  netexpenses += +dt.Amount;
                }
                else if (dt.Grp_Nature === 4){
                  this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": 0, "RightDetails" : dt.Name, "RightAmount":dt.Amount, "IsGrp": false });
                  netincomes += +dt.Amount;
                }                
            }
          // }
        });

        
        // finalValue = 

        // if (netincomes >= netexpenses){
        //   this.BsHtmlList.push({"LeftDetails": 'Gross Profit C/o', "LeftAmount": incomes-expenses, "RightDetails" : '', "RightAmount":0, "IsGrp": false });
        //   this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": '', "RightDetails" : '', "RightAmount": '', "IsGrp": false });
        //   this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": incomes , "RightDetails" : '', "RightAmount": incomes, "IsGrp": true });
        //   this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": '', "RightDetails" : '', "RightAmount": '', "IsGrp": false });
        // }
        // else{
        //   this.BsHtmlList.push({"LeftDetails": '', "LeftAmount":0 , "RightDetails" : 'Gross Loss B/f', "RightAmount":expenses-incomes , "IsGrp": false });
        //   this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": '', "RightDetails" : '', "RightAmount": '', "IsGrp": false });
        //   this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": expenses, "RightDetails" : '', "RightAmount": expenses, "IsGrp": true });
        //   this.BsHtmlList.push({"LeftDetails": '', "LeftAmount": '', "RightDetails" : '', "RightAmount": '', "IsGrp": false });
        // }

        
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  FilterProfitandLoss(){
    this.LoadProfitandLoss(this.FromDate,this.ToDate);
  }
  
  DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
}

exportexcel(){
  let element = document.getElementById('profitandloss'); 
  const sheet: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
  
  // let element = document.getElementById('Loans'); For Direct Table
  // const sheet4: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
  
  const wb: XLSX.WorkBook = XLSX.utils.book_new();    
  XLSX.utils.book_append_sheet(wb, sheet, 'Profit and Loss');  
  
  /* save to file */  
  XLSX.writeFile(wb, "Profit and Loss.xlsx");
}

}
