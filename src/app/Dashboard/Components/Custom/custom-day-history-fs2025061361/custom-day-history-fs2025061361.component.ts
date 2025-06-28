import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator }                     from '@angular/material/paginator';
import { MatSort }                          from '@angular/material/sort';
import { AutoUnsubscribe }                  from 'src/app/auto-unsubscribe.decorator';
import { ClsReports }                       from 'src/app/Dashboard/Classes/ClsReports';
import { TypeFieldInfo }                    from 'src/app/Dashboard/Types/TypeFieldInfo';
import { DataService }                      from 'src/app/Services/data.service';
import { ExcelExportService } from 'src/app/Services/excel-export.service';
import { GlobalsService }                   from 'src/app/Services/globals.service';

interface TypeDayHistoryList{
  Red_Loan_No: string; Red_Customer_Name: string; Red_Loan_Date: number; Redemption_No: string; Rec_Interest: number; Nett_Payable: number; rn:string;
  Loan_No: string; Party_Name: string; Principal: number;
}

@Component({
  selector: 'app-custom-day-history-fs2025061361',  
  templateUrl: './custom-day-history-fs2025061361.component.html',
  styleUrl: './custom-day-history-fs2025061361.component.scss'
})

@AutoUnsubscribe
export class CustomDayHistoryFS2025061361Component {

constructor(private dataService: DataService, private globals: GlobalsService, private excelService: ExcelExportService){}

  @ViewChild('TABLE')  table!: ElementRef; 
  HistoryList: TypeDayHistoryList[] = [];  

  FieldNames: TypeFieldInfo[] = 
  [
    { Field_Name:"#",                   Data_Type:"string" }, 
    { Field_Name:"Red_Loan_No",         Data_Type:"string" }, 
    { Field_Name:"Red_Customer_Name",   Data_Type:"string" }, 
    { Field_Name:"Red_Loan_Date",       Data_Type:"number" }, 
    { Field_Name:"Redemption_No",       Data_Type:"string" }, 
    { Field_Name:"Rec_Interest",        Data_Type:"number" }, 
    { Field_Name:"Nett_Payable",        Data_Type:"number" }, 
    { Field_Name:"Loan_No",             Data_Type:"string" }, 
    { Field_Name:"Party_Name",          Data_Type:"string" }, 
    { Field_Name:"Principal",           Data_Type:"number" },         
  ];

  TotalFields: string[] = ["Rec_Interest", "Nett_Payable", "Principal"]


  RemoveSignal: number = 0;
  AsOn:         number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.AsOn = this.globals.DateToInt(new Date())
    this.LoadHistory();    
  }

  LoadHistory(){    
    let rep = new ClsReports(this.dataService);         
    rep.getDayHistoryCustomFS2025061361(this.AsOn).subscribe ( data => {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.HistoryList = JSON.parse(data.apiData);                
        
        if (!this.HistoryList){
          this.HistoryList = [];
        }
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  DateToInt($event: any): number{ return this.globals.DateToInt( new Date ($event.target.value)); }  

  exportexcel(){
    this.excelService.exportAsExcelFile(this.HistoryList,"Day History", this.TotalFields);
  }
}
