import { Component } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsReports } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

interface TypeCustomDayBook{
  BillType:   number;
  BillCount:  number;
  Amount:     number;
  Interest:   number;
  DefaultAmt: number;
  AddLess:    number;
}

@Component({
  selector: 'app-custom-day-book-fs2024122133',  
  templateUrl: './custom-day-book-fs2024122133.component.html',
  styleUrl: './custom-day-book-fs2024122133.component.scss'
})

@AutoUnsubscribe
export class CustomDayBookFS2024122133Component {
constructor(private globals: GlobalsService, private dataService: DataService){}
  
  FromDate: number = 0;
  ToDate: number = 0;
  ReportList: TypeCustomDayBook[] = []

  ngOnInit(){
    this.FromDate = this.globals.DateToInt( new Date());
    this.ToDate = this.globals.DateToInt( new Date());
    this.LoadDayHistory();
  }

  LoadDayHistory(){
    let ln = new ClsReports(this.dataService);    
    ln.getDayBookCustomFS2024122133(this.FromDate, this.ToDate).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                
        this.ReportList = JSON.parse (data.apiData);        
        console.log(this.ReportList);
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

 
}