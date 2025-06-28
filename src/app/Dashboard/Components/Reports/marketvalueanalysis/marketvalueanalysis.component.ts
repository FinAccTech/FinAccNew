import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsReports,  TypeMarketValueAnalysis,} from 'src/app/Dashboard/Classes/ClsReports';
import { ReportpropertiesComponent } from 'src/app/Dashboard/widgets/reportproperties/reportproperties.component';
import { DataService } from 'src/app/Services/data.service';
import { ExcelExportService } from 'src/app/Services/excel-export.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-marketvalueanalysis',
  templateUrl: './marketvalueanalysis.component.html',
  styleUrls: ['./marketvalueanalysis.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
}) 

@AutoUnsubscribe
export class MarketValueAnalysisComponent {

  constructor(private globals: GlobalsService, private dataService: DataService, private dialog: MatDialog, private excelService: ExcelExportService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  dataSource!: MatTableDataSource<TypeLoan>;  
  columnsToDisplay: string[] = [ '#', 'Loan_No', 'Loan_Date','Party_Name', 'Principal', 'Grp_Name', 'Then_Market_Rate', 'Then_Loan_PerGram', 'Then_Market_Value', 
    'Current_Market_Rate', 'Current_Loan_PerGram', 'Current_Market_Value', 'Nett_Payable_AsOn','Diff_Amount'
  ];
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeLoan | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  
  
  AsOnDate: number = 0;
  LoansList:       TypeMarketValueAnalysis[] = [];
  SelectedLoan!:    TypeMarketValueAnalysis;
  StatusCount!: any[];
  SelectedLoanStatus: number = 0;
  
  ngOnInit(){
    this.AsOnDate = this.globals.DateToInt( new Date());
    this.LoadMarketValueAnalysis();
  }

  LoadMarketValueAnalysis(){
    let ln = new ClsReports(this.dataService);    
    ln.getMarketvalueAnalysis().subscribe(data=> { 
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
        });
        this.LoadDataIntoMatTable();        
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeLoan> (this.LoansList);     
    if (this.dataSource.filteredData)
    {    
      setTimeout(() => this.dataSource.paginator = this.paginator);
      setTimeout(() => this.dataSource.sort = this.sort);      
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

  
}
