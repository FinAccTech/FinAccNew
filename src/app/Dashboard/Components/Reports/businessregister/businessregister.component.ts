import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsReports, TypeBusinessRegister } from 'src/app/Dashboard/Classes/ClsReports';
import { DailyRegisterComponent } from 'src/app/Dashboard/widgets/daily-register/daily-register.component';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-businessregister',  
  templateUrl: './businessregister.component.html', 
  styleUrl: './businessregister.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

@AutoUnsubscribe
export class BusinessregisterComponent {
constructor(private globals: GlobalsService, private dataService: DataService, private auth: AuthService, private dialog: MatDialog){}
  @ViewChild('TABLE')  table!: ElementRef;
    
  dataSource!: MatTableDataSource<TypeBusinessRegister>;  
  columnsToDisplay: string[] = [ '#', 'MonthStart', 'LoansCount','LoansValue', 'RedCount', 'RedValue','Interest','DocCharges'];  
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeLoan | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  FromDate: number = 0;
  ToDate: number = 0;
  
  RegisterList:       TypeBusinessRegister[] = [];
        
  ngOnInit(){
    this.FromDate = this.auth.SelectedCompany.Fin_From;
    this.ToDate = this.auth.SelectedCompany.Fin_To;
    this.LoadBusinessRegister();
  }

  LoadBusinessRegister(){
    let ln = new ClsReports(this.dataService);    
    ln.getBusinessRegisterMonthly(this.FromDate, this.ToDate).subscribe(data=> {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                
        let tmpRegisterList =  JSON.parse (data.apiData);                
        
        tmpRegisterList.forEach((row:any)=>{
          if ( row.LoansCount > 0 || row.RedCount > 0 || row.Interest > 0 ) {            
            this.RegisterList.push(row);            
          }
        })
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  LoadDailyRegister(data: TypeBusinessRegister){            
    let ln = new ClsReports(this.dataService);    
    ln.getBusinessRegisterDaily(data.MonthStart, data.MonthEnd).subscribe(data=> { 
      
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                        
        let DailyDetails = JSON.parse (data.apiData);                
        const dialogRef = this.dialog.open(DailyRegisterComponent, 
          {
            data: DailyDetails,
          });      
          dialogRef.disableClose = true;         
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });    
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeBusinessRegister> (this.RegisterList);     
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
    this.RegisterList.forEach(ln=>{      
        LoanExcelList.push({ "#": i, "MonthStart": ln.MonthStart, "MonthEnd": ln.MonthEnd, "LoansCount": ln.LoansCount, "LoansValue": ln.LoansValue, "RedCount": ln.RedCount, "RedValue": ln.RedValue, "Interest" : ln.Interest, });      
      i++;
    });

    const sheet1: XLSX.WorkSheet =XLSX.utils.json_to_sheet(LoanExcelList);
        
    const wb: XLSX.WorkBook = XLSX.utils.book_new();    
    XLSX.utils.book_append_sheet(wb, sheet1, 'Loans');
    
    /* save to file */  
    XLSX.writeFile(wb, "Interest Statement from " + this.globals.IntToDateString  (this.FromDate) + " to " + this.globals.IntToDateString  (this.ToDate)  +".xlsx");
 
  }
}
