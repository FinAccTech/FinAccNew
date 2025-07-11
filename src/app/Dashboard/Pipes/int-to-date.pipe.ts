import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intToDate',    
})
export class IntToDatePipe implements PipeTransform {
  
  transform(value: number): string {
    
    let argDate = value.toString();
    let year = argDate.substring(0,4);
    let month = argDate.substring(4,6);
    let day = argDate.substring(6,9);
    let newDate = year + "/" + month + "/" + day;    
    // if (value  == 20241231){
    //   console.log( "Value:" + value);      
    //   console.log( "ArgDate:" + argDate);      
    //   console.log( "Year:" +  year);      
    //   console.log( "Month:" + month);      
    //   console.log( "Day:" +  day);      
    //   console.log( "NewDate:" +  newDate);      
    //   console.log(new Date(newDate).toDateString());      
    //   console.log("");      
    // }

    return new Date(newDate).toDateString();
  }

}
