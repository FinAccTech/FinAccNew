import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsReports, TypeDayHistyory, TypeIntStatementCustom } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-int-statement1percent',    
  templateUrl: './int-statement1percent.component.html',
  styleUrl: './int-statement1percent.component.scss',
    animations: [
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ],
})

@AutoUnsubscribe
export class IntStatement1percentComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}
  @ViewChild('TABLE')  table!: ElementRef;
    
  dataSource!: MatTableDataSource<TypeIntStatementCustom>;  
  columnsToDisplay: string[] = [ '#', 'Loan_No', 'Loan_Date','Party_Name', 'Principal', 'Redemption_Date','Duration', 'IntAmount'];
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeLoan | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  FromDate: number = 0;
  ToDate: number = 0;
  SubmitInt: number = 12;

  LoansList:       TypeIntStatementCustom[] = [];
  
      
  ngOnInit(){
    this.FromDate = this.globals.DateToInt( new Date());
    this.ToDate = this.globals.DateToInt( new Date());
    this.LoadIntStatement();
  }

  LoadIntStatement(){
    let ln = new ClsReports(this.dataService);    
    ln.getIntStatementCustom(this.FromDate, this.ToDate, this.SubmitInt).subscribe(data=> { 
      
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                
        this.LoansList = JSON.parse (data.apiData);        
        this.LoansList.map(ln=>{
          ln.Customer = JSON.parse(ln.Party_Json)[0];
          ln.IGroup = JSON.parse(ln.Group_Json)[0];
          ln.Location = JSON.parse(ln.Location_Json)[0];
          ln.Scheme = JSON.parse(ln.Scheme_Json)[0];          
        })

        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeIntStatementCustom> (this.LoansList);     
    if (this.dataSource.filteredData)
    {    
      setTimeout(() => this.dataSource.paginator = this.paginator);
      setTimeout(() => this.dataSource.sort = this.sort);      
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  exportexcel(): void
  {
    let LoanExcelList: Array<any> = [];
    let i = 1;
    this.LoansList.forEach(ln=>{
      if (ln.Customer.Party_Name == "Total"){
        LoanExcelList.push({ "#": "", "Loan_No": "", "Loan_Date": "", "Customer": "Total", "Principal": ln.Principal, "Interest" : ln.IntAmount});
      }
      else{
        LoanExcelList.push({ "#": i, "Loan_No": ln.Loan_No, "Loan_Date": this.globals.IntToDateString (ln.Loan_Date), "Customer": ln.Customer.Party_Name, "Principal": ln.Principal, "Interest" : ln.IntAmount, });
      }      
      i++;
    });

    const sheet1: XLSX.WorkSheet =XLSX.utils.json_to_sheet(LoanExcelList);
    // let element = document.getElementById('Loans'); For Direct Table
    // const sheet4: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    
    const wb: XLSX.WorkBook = XLSX.utils.book_new();    
    XLSX.utils.book_append_sheet(wb, sheet1, 'Loans');
    
    /* save to file */  
    XLSX.writeFile(wb, "Interest Statement from " + this.globals.IntToDateString  (this.FromDate) + " to " + this.globals.IntToDateString  (this.ToDate)  +".xlsx");
 
  }
}
