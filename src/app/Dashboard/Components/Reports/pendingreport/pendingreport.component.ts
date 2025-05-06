import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAlertSetup, TypeAlertsPostData } from 'src/app/Dashboard/Classes/ClsAlertsSetup';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsReports,TypePendingReport } from 'src/app/Dashboard/Classes/ClsReports';
import { AlertconfirmationComponent } from 'src/app/Dashboard/widgets/alertconfirmation/alertconfirmation.component';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-pendingreport',
  templateUrl: './pendingreport.component.html',
  styleUrls: ['./pendingreport.component.scss'],
  animations: [
    trigger('detailExpand', [ 
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

@AutoUnsubscribe
export class PendingreportComponent {

  constructor(private globals: GlobalsService, private dataService: DataService, private dialog: MatDialog){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  dataSource!: MatTableDataSource<TypeLoan>;  
  columnsToDisplay: string[] = [ '#', 'Series_Name', 'Loan_No', 'Loan_Date','Party_Name', 'Principal', 'Grp_Name','Scheme_Name', 'TotNettWt', 'Last_Receipt_Date','Due_Date', 'Mature_Date','Pending_Interest','Pending_Days', 'Pending_Dues'];
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeLoan | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  
  
  AsOnDate: number = 0;
  LoansList:       TypePendingReport[] = [];    
  FilteredList:    TypePendingReport[] = [];    

  PendingDues: number = 0;
  DueDays: number = 28;

  ShowFilterOptions: boolean = false;
  
  FilteMonthsParams: number = 0;
  FilteDaysParams: number = 0;
  FilterMonths:number = 0;
  FilterDays: number = 0;
  Recursive: boolean = true;

  ngOnInit(){
    this.AsOnDate = this.globals.DateToInt( new Date());
    this.LoadPendingReport();
  }

  LoadPendingReport(){
    
    if (this.PendingDues == 0){
      let ln = new ClsReports(this.dataService);    
      ln.getPendingReport(this.AsOnDate,this.DueDays).subscribe(data=> { 
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
          
          this.FilteredList = this.LoansList;  
          this.LoadDataIntoMatTable();        
        }
      },
      error => {
        this.globals.ShowAlert(this.globals.DialogTypeError,error);
        return;             
      });
    }
    else{
      this.FilterPending();
    }
  }

  ClearFilter(){
    this.FilteredList = this.LoansList;
    this.LoadDataIntoMatTable();
  }
  FilterPending(){    
    this.FilteredList =  (this.FilteredList.filter(ln =>{ return ln.Pending_Dues === +this.PendingDues }));
    this.LoadDataIntoMatTable();
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeLoan> (this.FilteredList);     
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

  FilterByParams(Type: number){
    
    if (this.Recursive){
      switch ( (Type==0 ? this.FilteMonthsParams : this.FilteDaysParams) ) {
        case 0:
          this.FilteredList =  (this.FilteredList.filter(ln =>{ return (Type==0 ? ln.Pending_Dues : ln.Pending_Days)  ===   +(Type==0 ? this.FilterMonths : this.FilterDays)  }));
          break;
        case 1:
          this.FilteredList =  (this.FilteredList.filter(ln =>{ return (Type==0 ? ln.Pending_Dues : ln.Pending_Days) >  +(Type==0 ? this.FilterMonths : this.FilterDays) }));
          break;
        case 2:
            this.FilteredList =  (this.FilteredList.filter(ln =>{ return (Type==0 ? ln.Pending_Dues : ln.Pending_Days) <  +(Type==0 ? this.FilterMonths : this.FilterDays) }));
            break;
      }
    }
    else{
      switch ( (Type==0 ? this.FilteMonthsParams : this.FilteDaysParams) ) {
        case 0:
          this.LoansList =  (this.FilteredList.filter(ln =>{ return (Type==0 ? ln.Pending_Dues : ln.Pending_Days)  ===   +(Type==0 ? this.FilterMonths : this.FilterDays)  }));
          break;
        case 1:
          this.LoansList =  (this.FilteredList.filter(ln =>{ return (Type==0 ? ln.Pending_Dues : ln.Pending_Days) >  +(Type==0 ? this.FilterMonths : this.FilterDays) }));
          break;
        case 2:
            this.LoansList =  (this.FilteredList.filter(ln =>{ return (Type==0 ? ln.Pending_Dues : ln.Pending_Days) <  +(Type==0 ? this.FilterMonths : this.FilterDays) }));
            break;
      }
    }
    
    
    this.LoadDataIntoMatTable();
    this.ShowFilterOptions = false;
  }

  SendAlerts(){    
    
      const dialogRef = this.dialog.open(AlertconfirmationComponent, 
        {         
          // width:'40vw',
          data: "",
        });
        
        dialogRef.disableClose = true;
    
        dialogRef.afterClosed().subscribe(result => {        
          if (result){        
            let AlertPostData: Number[] = [];
  
            this.FilteredList.forEach(ln=>{
              AlertPostData.push(ln.LoanSno);
            });
  
            let aStp = new ClsAlertSetup(this.dataService);
            aStp.insertAlerts( {RecvrList: this.FilteredList, TempSno: result.TempSno, Alert_Type: this.globals.AlertTypeIntReminder,  Alert_Mode: result.Alert_Mode, Auction_Date: result.Auction_Date, BulkInsert:0, CompSno:0 }).subscribe(data =>{            
              
            });
            this.globals.SnackBar("info", "Alerts submitted sucessfully!!!");
          } 
          else{
            this.globals.SnackBar("error", "No Alerts Sent");
          }     
        }); 

      }
}
