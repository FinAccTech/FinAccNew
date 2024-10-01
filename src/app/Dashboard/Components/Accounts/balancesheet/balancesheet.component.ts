import { Component, ElementRef, ViewChild } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAccReports, TypeBalanceSheet } from 'src/app/Dashboard/Classes/ClsAccReports';
import { TypeCompanies } from 'src/app/Dashboard/Classes/ClsCompanies';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import * as XLSX from 'xlsx';

interface TypeBsHtmlList {
  LeftDetails: string;
  LeftAmount: number;
  RightDetails: string;
  RightAmount: number;
}

@Component({
  selector: 'app-balancesheet',
  templateUrl: './balancesheet.component.html',
  styleUrls: ['./balancesheet.component.scss']
})
@AutoUnsubscribe
export class BalancesheetComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  FromDate: number = 0;
  ToDate: number  = 0;
  Opening_Balance: number = 0;
  Closing_Balance: number = 0;
  BalanceSheetlist:       TypeBalanceSheet[] = [];
  BsHtmlList: TypeBsHtmlList[] = [];
  CompInfo!: TypeCompanies;
  GrpType: number = 1;
  DetType: number = 0;
  ShowTransactions: number = 0;
  
  ngOnInit(){   
    this.CompInfo = JSON.parse (sessionStorage.getItem("sessionSelectedCompany")!);      
    this.FromDate = this.CompInfo.Fin_From;
    this.ToDate   = this.globals.DateToInt(new Date());
    this.LoadBalanceSheet(this.CompInfo.Fin_From, this.globals.DateToInt(new Date()));    
  }

  LoadBalanceSheet(FromDate: number, ToDate: number){
    let ln = new ClsAccReports(this.dataService);    
    ln.getBalanceSheet(FromDate, ToDate, this.GrpType,0).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                        
        this.BalanceSheetlist = JSON.parse(data.apiData);   
        this.BsHtmlList = [];      
        this.BalanceSheetlist.forEach(dt=>{
          if (dt.Amount > 0 || dt.Amount < 0){
            if (dt.Grp_Nature == 0 || dt.Grp_Nature == 1){            
                this.BsHtmlList.push({"LeftDetails": dt.Name ,"LeftAmount": dt.Amount, "RightDetails" : '', "RightAmount":0 })            
            }
          }
        });

        let i = 0;
        let bsLen = this.BsHtmlList.length;
        this.BalanceSheetlist.forEach(dt=>{
          if (dt.Grp_Nature == 2){            
              if (dt.Amount > 0 || dt.Amount < 0)
              {
                if (i >= bsLen)
                {
                  this.BsHtmlList.push({"LeftDetails": '' ,"LeftAmount": 0, "RightDetails" : dt.Name, "RightAmount": dt.Amount })
                }
                else{
                  this.BsHtmlList[i].RightDetails = dt.Name;
                  this.BsHtmlList[i].RightAmount = dt.Amount;
                }
                i++;
              }                        
              
          }
          
        });
        console.log(this.BsHtmlList);
        
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  FilterBalanceSheet(){
    this.LoadBalanceSheet(this.FromDate,this.ToDate);
  }
  
  DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
}

exportexcel(){
  let element = document.getElementById('balancesheet'); 
  const sheet: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
  
  // let element = document.getElementById('Loans'); For Direct Table
  // const sheet4: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
  
  const wb: XLSX.WorkBook = XLSX.utils.book_new();    
  XLSX.utils.book_append_sheet(wb, sheet, 'Balance Sheet');  
  
  /* save to file */  
  XLSX.writeFile(wb, "Balance Sheet.xlsx");
}

}
