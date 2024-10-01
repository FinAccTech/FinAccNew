import { Component, ElementRef, ViewChild } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAccReports, TypeLedgerBook } from 'src/app/Dashboard/Classes/ClsAccReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.scss']
})

@AutoUnsubscribe
export class DaybookComponent {
  constructor(private globals: GlobalsService, private dataService: DataService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  FromDate: number = 0;
  ToDate: number  = 0;
  Opening_Balance: number = 0;
  Closing_Balance: number = 0;
  Daybooklist:       TypeLedgerBook[] = [];
      
  ngOnInit(){    
    this.LoadDayBook(999,999);
  }

  LoadDayBook(FromDate: number, ToDate: number){
    let ln = new ClsAccReports(this.dataService);    
    ln.getDayBook(FromDate, ToDate).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                        
        this.Daybooklist = JSON.parse(data.apiData.daybooklist);    
        let prevdate = 0;
        this.Daybooklist.forEach(vou=>{
          if (vou.Vou_Date == prevdate){            
            vou.Vou_Date = 0;            
          }
          else{
            prevdate = vou.Vou_Date;
          }
          
        })

        this.FromDate = data.apiData.FromDate;
        this.ToDate = data.apiData.ToDate;
        this.Opening_Balance = Number(data.apiData.OpenBal);
        this.Closing_Balance = Number(data.apiData.CloseBal);
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  FilterDayBook(){
    this.LoadDayBook(this.FromDate,this.ToDate);
  }
  
  DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
}

exportexcel(){
  let element = document.getElementById('daybook'); 
  const sheet: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
  
  // let element = document.getElementById('Loans'); For Direct Table
  // const sheet4: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
  
  const wb: XLSX.WorkBook = XLSX.utils.book_new();    
  XLSX.utils.book_append_sheet(wb, sheet, 'Day Book');  
  
  /* save to file */  
  XLSX.writeFile(wb, "Day Book.xlsx");
}
}
