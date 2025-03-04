import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intToMonthYear',  
})
export class IntToMonthYear implements PipeTransform {
  
  transform(value: number): string {
    let argDate = value.toString();
    let year = argDate.substring(0,4);
    let month = argDate.substring(4,6);
    let day = argDate.substring(6,9);
    let newDate = year + "/" + month + "/" + day;    
    
    return year + ' ' + this.GetMonthName(+month, false)
  }

  GetMonthName(Month: number, ReturnAlias: boolean):string{
    let MonthName = "";
    switch (Month) {
      case 1:
        MonthName =  ReturnAlias ? "Jan" : "January";
        break;  
      case 2:
        MonthName =  ReturnAlias ? "Feb" : "February";
        break;  
      case 3:
        MonthName =  ReturnAlias ? "Mar" : "March";
        break;  
      case 4:
        MonthName =  ReturnAlias ? "Apr" : "April";
        break;  
      case 5:
        MonthName =  ReturnAlias ? "May" : "May";
        break;  
      case 6:
        MonthName =  ReturnAlias ? "Jun" : "June";
        break;  
      case 7:
        MonthName =  ReturnAlias ? "Jul" : "July";
        break;  
      case 8:
        MonthName =  ReturnAlias ? "Aug" : "August";
        break;  
      case 9:
        MonthName =  ReturnAlias ? "Sep" : "September";
        break;  
      case 10:
        MonthName =  ReturnAlias ? "Oct" : "October";
        break;  
      case 11:
        MonthName =  ReturnAlias ? "Nov" : "November";
        break;  
      case 12:
        MonthName =  ReturnAlias ? "Dec" : "December";
        break;  
    }
    return MonthName;
  }

  
}
