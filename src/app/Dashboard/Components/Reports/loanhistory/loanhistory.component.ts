import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsReports, TypeLoanHistory } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { ExcelExportService } from 'src/app/Services/excel-export.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-loanhistory',
  templateUrl: './loanhistory.component.html',
  styleUrls: ['./loanhistory.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

@AutoUnsubscribe
export class LoanhistoryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService, private excelService: ExcelExportService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  dataSource!: MatTableDataSource<TypeLoan>;  
  columnsToDisplay: string[] = [ '#', 'Series_Name', 'Loan_No', 'Loan_Date','Party_Name', 'Principal', 'Grp_Name','Scheme_Name', 'TotNettWt', 'Mature_Date'];
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeLoan | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  
  
  FromDate: number = 0;
  ToDate: number = 0;
 
  LoansList:       TypeLoanHistory[] = [];
  filterList:      TypeLoanHistory[] = [];

  SelectedLoan!:    TypeLoanHistory;
  // StatusCount: any[] =  [{"Status":1, "Count":0,"Value":0}, {"Status":2,"Count":0,"Value":0}, {"Status":3,"Count":0,"Value":0}, {"Status":4,"Count":0,"Value":0} ];
  StatusCount: any[] = [];

  SelectedLoanStatus: number = 0;

  openpass: boolean = false;
  closepass: boolean = false;
  maturepass: boolean = false;
  aucpass: boolean = false;

  ngOnInit(){
    let newDate = new Date();          
    this.FromDate =  this.globals.DateToInt (new Date((newDate.getMonth() == 0 ? newDate.getFullYear() -1 :newDate.getFullYear()).toString() +  '/' + (newDate.getMonth() == 0 ? 12 : newDate.getMonth()).toString() + "/" + newDate.getDate().toString()));          
    this.ToDate = this.globals.DateToInt (new Date());

    this.LoadLoanHistory(0);
  }

  LoadLoanHistory(LoanStatus: number){
    let ln = new ClsReports(this.dataService);    
    ln.getLoanHistory(LoanStatus, this.FromDate, this.ToDate).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                
        this.LoansList = JSON.parse (data.apiData);     
        
        this.LoansList.map(ln=>{
          ln.Customer = JSON.parse(ln.Party_Json)[0];
          if (ln.Images_Json) {ln.fileSource =  JSON.parse(ln.Images_Json);}
          ln.IGroup = JSON.parse(ln.Group_Json)[0];
          ln.Location  = JSON.parse(ln.Location_Json)[0];          
          ln.Scheme = JSON.parse(ln.Scheme_Json)[0];
        })
           
        this.filterList = this.LoansList;
        this.LoadDataIntoMatTable();
       
        this.GetStatusCount();
        
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  GetStatusCount(){            
    this.StatusCount = [];    
    this.StatusCount.push({"Status":1, "Count": this.filterList.filter(ln=>{
      return ln.Loan_Status == this.globals.LoanStatusOpen
    }).length, "Value":this.filterList.filter(ln=>{
      return ln.Loan_Status == this.globals.LoanStatusOpen
    }).reduce((n, {Principal}) => n + +Principal, 0)});
    this.filterList = this.LoansList;
    
    

    this.StatusCount.push({"Status":2, "Count": this.filterList.filter(ln=>{
      return ln.Loan_Status == this.globals.LoanStatusClosed
    }).length,"Value":this.filterList.filter(ln=>{
      return ln.Loan_Status == this.globals.LoanStatusClosed
    }).reduce((n, {Principal}) => n + +Principal, 0)});
    this.filterList = this.LoansList;

    this.StatusCount.push({"Status":3, "Count": this.filterList.filter(ln=>{
      return ln.Loan_Status == this.globals.LoanStatusMatured
    }).length,"Value":this.filterList.filter(ln=>{
      return ln.Loan_Status == this.globals.LoanStatusMatured
    }).reduce((n, {Principal}) => n + +Principal, 0)});
    this.filterList = this.LoansList;
    
    this.StatusCount.push({"Status":4, "Count": this.filterList.filter(ln=>{
      return ln.Loan_Status == this.globals.LoanStatusAuctioned
    }).length,"Value":this.filterList.filter(ln=>{
      return ln.Loan_Status == this.globals.LoanStatusAuctioned
    }).reduce((n, {Principal}) => n + +Principal, 0)});
    this.filterList = this.LoansList;
  }

  FilterByStatus(filterStatus: number){    
    this.filterList = this.LoansList.filter(ln=>{
      return ln.Loan_Status == filterStatus;
    })
    this.LoadDataIntoMatTable()    
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeLoan> (this.filterList);     
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


    DownloadasExcel(){
      // let ExcelData: any = [];
      // this.LoansList.forEach((ln: TypeLoan)=>{
      //   ExcelData.push({"IFSC Code": ln.Customer.Bank_Ifsc, "Account Number": ln.Customer.Bank_AccountNo, "Beneficiary Name": ln.Customer.Bank_AccName, 
      //     "Sender Information": "Loan Disbursed","Amount": ln.Nett_Payable
      //    })
      // });
      let SelectedColumns = this.columnsToDisplay;
      SelectedColumns.splice(this.columnsToDisplay.indexOf("#"),1);
      SelectedColumns.splice(this.columnsToDisplay.indexOf("crud"),1);

      const ExportList = this.LoansList.map((item: any) => SelectedColumns.map(col => item[col]));

      this.excelService.exportAsExcelFile(ExportList,"Loans", SelectedColumns);
      this.globals.SnackBar("info","Loans List downloaded successfully")
    }
    
    
  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
 
}
