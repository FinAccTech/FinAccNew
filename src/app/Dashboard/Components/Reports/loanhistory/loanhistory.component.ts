import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsLoans, TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsReports, TypeInterestDetails, TypeInterestStructure, TypeLoanHistory, TypeLoanStatement } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
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

  constructor(private globals: GlobalsService, private dataService: DataService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  dataSource!: MatTableDataSource<TypeLoan>;  
  columnsToDisplay: string[] = [ '#', 'Series_Name', 'Loan_No', 'Loan_Date','Party_Name', 'Principal', 'Grp_Name','Scheme_Name', 'TotNettWt', 'Mature_Date'];
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeLoan | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  
  
  AsOnDate: number = 0;
  LoansList:       TypeLoanHistory[] = [];
  SelectedLoan!:    TypeLoanHistory;
  StatusList!: any[];
  StatusCount: any[] =  [{"Status":1, "Count":0,"Value":0}, {"Status":2,"Count":0,"Value":0}, {"Status":3,"Count":0,"Value":0}, {"Status":4,"Count":0,"Value":0} ];
  SelectedLoanStatus: number = 0;

  openpass: boolean = false;
  closepass: boolean = false;
  maturepass: boolean = false;
  aucpass: boolean = false;

  ngOnInit(){
    this.AsOnDate = this.globals.DateToInt( new Date());
    this.LoadLoanHistory(0,0);
  }

  LoadLoanHistory(LoanStatus: number, AsOn: number){
    let ln = new ClsReports(this.dataService);    
    ln.getLoanHistory(LoanStatus, AsOn).subscribe(data=> { 
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
           
        this.LoadDataIntoMatTable();

        ln.getLoanStatusCount(0).subscribe(data =>{
          this.StatusList = JSON.parse(data.apiData);
          
          this.StatusList.forEach(stat =>{            
              this.StatusCount[stat.Loan_Status-1].Count = stat.LoansCount;
              this.StatusCount[stat.Loan_Status-1].Value = stat.Principal;            
          })
          
        })
        
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
