import { Component, effect, EventEmitter, Input, input, Output, signal } from '@angular/core';
import { _isNumberValue } from '@angular/cdk/coercion';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatOption, MatSelect } from '@angular/material/select';
import { SearchPipe } from '../../Pipes/search.pipe';
import { IntToDatePipe } from '../../Pipes/int-to-date.pipe';
import { GlobalsService } from 'src/app/Services/globals.service';
import { TypeFieldInfo } from '../../Types/TypeFieldInfo';


interface PagedData{
  PageNumber: number;
  PageData: any[];
}

interface TypeSelectedItems{ 
  Item: any;
  Selected: boolean;
}

interface TypeTotal{
  name: string;
  value: any;
} 
@Component({
    selector: 'app-tableview',
    templateUrl: './tableview.component.html',
    styleUrl: './tableview.component.scss'
})

export class TableviewComponent { 
  DataSource  = input.required<any[]>();
  
  FieldNames  = input.required<TypeFieldInfo[]>();

  ArrayColsSort: any[] = [];
  @Input() EnableDateSelection: boolean = false;
  @Input() FromDate: number = 0;
  @Input() ToDate: number = 0;
  @Input() RowsPerPage: number = 5;
  @Input() EnableCheckbox: boolean = false;
  @Input() ObjSelectedItems: any[] = [];
  @Input() EnablePrint: boolean = false;
  @Input() EnableMail: boolean = false;

  TotalFields = input<string[]>(); 
  Totals: number[] = [];
  TotalsArray: TypeTotal[] = [];

  RemoveSignal = input(0);

  DataList: any[] = [];
  FilteredDataList: any[] = [];
  PagedDataList: PagedData[] = [];
  SelectedItems: TypeSelectedItems[] = [];
// For pagination and Selection
  
  TotalPages: number = 0; 
  CurrentPage: number = 0;

 @Output() actionEvent = new EventEmitter<any>();

 constructor(private globals: GlobalsService){
  effect(() => {            
    this.DataList     = this.DataSource();   
    this.FilteredDataList = this.DataList;   
    this.DoPagination();

    this.FilteredDataList.forEach(item=>{
      this.SelectedItems.push({Item: item, Selected: false});
    })

    this.SelectedItems.map(item=>{
     this.ObjSelectedItems.find(selItem=>{    
        if (selItem.BarCode.BarCodeSno == item.Item.BarCodeSno){
          item.Selected = true;
        }    
      })
    })
    
    if (this.RemoveSignal() !== 0){        
      this.FilteredDataList.splice(this.RemoveSignal(),1);
    }      
  })
 }

  
  searchText: string = "";

  ngOnInit(){
              
  }

 EditRecord(row: any){
  this.actionEvent.emit( {"Action":1, "Data": row});
 }

 DeleteRecord(row: any, i: number){
  this.actionEvent.emit( {"Action":2, "Data": row, "Index": i });
 }

 PrintRecord(row: any, i: number){
  this.actionEvent.emit( {"Action":3, "Data": row, });
 }

 MailRecord(row: any, i: number){
  this.actionEvent.emit( {"Action":"Email", "Data": row, });
 }

 FilterRecords(){
  this.actionEvent.emit({"Action":"Filter","FromDate":this.FromDate,"ToDate":this.ToDate });
 }

 SelectRecord(row: any){ 
  if (this.EnableCheckbox) {return};
  this.actionEvent.emit( {"Action":"Select", "Data": row, });
 }

 MultiSelectRecord(BarCodeSno: number, $event: any){
  const checkbox = $event.target as HTMLInputElement;  
  this.SelectedItems.find(item=>{
    return item.Item.BarCodeSno == BarCodeSno;
  })!.Selected = checkbox.checked;

    
  //this.SelectedItems[i].Selected = checkbox.checked;
 }

 GetFindStatus(BarCodeSno: number): boolean {
  return (this.SelectedItems.find(item=>{
    return item.Item.BarCodeSno == BarCodeSno;
  })?.Selected)!;
 }

 AddMultiItems(){
  let PushSelectedItems: any[] = [];
  this.SelectedItems.forEach(item=>{
    if (item.Selected){
      PushSelectedItems.push(item);
    }
  })
  this.actionEvent.emit( {"Action":"MultiSelect", "Data": PushSelectedItems, });
 }

testfilter(event: any){
  let args = event.target.value;
  this.FilteredDataList = this.DataList.filter(item=>{
    return JSON.stringify(item).toLowerCase().includes(args);
  })
  this.DoPagination();
}

 DoPagination(){  
  this.TotalPages = Math.ceil (this.FilteredDataList.length / this.RowsPerPage);           
  this.PagedDataList = [];
  let newPage: any[] = [];
  let i = 0;
  let pageNumber = 1;
  
  this.FilteredDataList.forEach(row=>{      
    if (i == this.RowsPerPage){        
      this.PagedDataList.push({PageNumber: pageNumber, PageData: newPage});
      pageNumber++;
      newPage = [];
      i=0;
    }
    newPage.push(row);            
    i++;
  })

  if (newPage.length > 0){
    this.PagedDataList.push({PageNumber: pageNumber, PageData: newPage});
  }
  this.SetTotals();
 }

 SetTotals(){  
    
  if (!this.PagedDataList || this.PagedDataList.length < 1  || !this.TotalFields() || this.TotalFields()!.length < 1 ){
    return;
  }

    let a = 0;
    this.TotalFields()!.forEach(fld =>{
      this.Totals[a] = 0;
      for (let i= 0; i < this.PagedDataList[this.CurrentPage].PageData.length; i++ ){      
        let row = this.PagedDataList[this.CurrentPage].PageData[i];
        let colVal: any = Object.entries(row).find(([key, val]) => key === fld)?.[1];     
        this.Totals[a] += +colVal;    }
      a++;
    })
    
  //Iterating through Fieldnames and checking Total field is included in that and forming a new totals array with the totals
    a = 0;
    this.TotalsArray = [];
    this.FieldNames().forEach(element=>{      
      if (this.TotalFields()!.includes(element.Field_Name) ){
        this.TotalsArray.push({name:element.Field_Name, value:  this.Totals[a].toFixed(2)  })
        a++;
      }      
      else{
        this.TotalsArray.push({name:element.Field_Name, value:"{#Total#}"})
      }       
    });
    
  //Forming a Row with the totals array as string and converting that into Json object and pushing it to DataList array
    let strarr = "{";
    this.TotalsArray.forEach(tot=>{
      strarr += '"'+tot.name+'":"'+tot.value + '", ';
    })
    strarr = strarr.substring(0, strarr.length-2);
    strarr += "}";    
    
    this.PagedDataList[this.CurrentPage].PageData.push( JSON.parse (strarr));
 }

 SetCurrentPage(type: number){
  switch (type) {
    case 1:
      if (this.CurrentPage == 0) return;
      this.CurrentPage = 0;  
      this.DoPagination();
      break;
    case 2:
      if (this.CurrentPage !==0){
        this.CurrentPage--;        
        this.DoPagination();
      }
      break;      
    case 3:
      if (this.CurrentPage !== this.TotalPages-1){
        this.CurrentPage++; 
        this.DoPagination(); 
      }      
      break;
    case 4:
      if (this.CurrentPage = this.TotalPages - 1) return;
      this.CurrentPage = this.TotalPages-1;
      this.DoPagination();
      break;    
  }
 }

 DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
}

 isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
 }

 DoSorting(column: keyof any, index: number) {  
  if (!this.ArrayColsSort || !this.ArrayColsSort[index]) {
    this.ArrayColsSort[index] = true;
  }
  else{
    if (this.ArrayColsSort[index] == true){
      this.ArrayColsSort[index] = false;
    }
    else{
      this.ArrayColsSort[index] = true;
    }
  }
  
  let ascending: boolean = this.ArrayColsSort[index];

  let sortableData = this.PagedDataList[0].PageData;
  let totalRow = sortableData[sortableData.length-1];
  sortableData.splice(sortableData.length-1,1);
  
  const sortedData = [...sortableData].sort((a, b) => {
    if (typeof a[column] === 'string') {
      return ascending
        ? a[column].localeCompare(b[column] as string)
        : b[column].localeCompare(a[column] as string);
    }
    return ascending ?  a[column] - b[column] : b[column] - a[column];
  });
  // renderTable(sortedData);
  sortedData.push(totalRow);
  this.PagedDataList[0].PageData = sortedData;
}

SortTable(ColName: string, index: number){
  this.DoSorting(ColName, index);
}

// document.querySelectorAll("th[data-column]").forEach(header => {
//   header.addEventListener("click", () => {
//     const column = header.getAttribute("data-column") as keyof any;
//     const isAscending = header.classList.contains("ascending");
    
//     // Toggle sorting direction
//     header.classList.toggle("ascending", !isAscending);
//     header.classList.toggle("descending", isAscending);
    
//     // Sort the table based on the clicked column
//     this.DoSorting(column, !isAscending);
//   });
// });
 
}


