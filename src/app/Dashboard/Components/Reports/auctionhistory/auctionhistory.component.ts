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
  selector: 'app-auctionhistory',
  templateUrl: './auctionhistory.component.html',
  styleUrls: ['./auctionhistory.component.scss']
})

@AutoUnsubscribe
export class AuctionhistoryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  dataSource!: MatTableDataSource<TypeLoan>;  
  columnsToDisplay: string[] = [ '#', 'Series_Name', 'Loan_No', 'Loan_Date','Party_Name', 'Principal', 'Grp_Name','Scheme_Name', 'TotNettWt', 'Mature_Date'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  
  
  AsOnDate: number = 0;
  LoansList:       TypeLoanHistory[] = [];
  SelectedLoan!:    TypeLoanHistory;
  StatusCount!: any[];
  SelectedLoanStatus: number = 0;
  
  ngOnInit(){
    this.AsOnDate = this.globals.DateToInt( new Date());
    this.LoadAuctionHistory();
  }

  LoadAuctionHistory(){
    let ln = new ClsReports(this.dataService);    
    ln.getAuctionHistory(this.AsOnDate).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                
        this.LoansList = JSON.parse (data.apiData);
        console.log(this.LoansList);        
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
