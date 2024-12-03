import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAlertSetup } from 'src/app/Dashboard/Classes/ClsAlertsSetup';
import { ClsReports,TypeAlertHistory } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-alert-history',
  templateUrl: './alert-history.component.html',
  styleUrls: ['./alert-history.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

@AutoUnsubscribe
export class AlertHistoryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  dataSource!: MatTableDataSource<TypeAlertHistory>;  
  columnsToDisplay: string[] = [ '#', 'Alert_Date', 'Alert_Destination', 'Alert_Text','Alert_Type', 'Alert_Mode', 'TrackSno','Response', 'Alert_Status', 'Retry_Count'];
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeAlertHistory | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  
  
  AlertList:       TypeAlertHistory[] = [];    
  FilteredList:    TypeAlertHistory[] = [];    

  
  ShowFilterOptions: boolean = false;
  
  ngOnInit(){  
    this.LoadAlertHistory();
  }

  LoadAlertHistory(){
    let ln = new ClsReports(this.dataService);
    ln.getAlertHistory().subscribe(data=> { 
        if (data.queryStatus == 0){
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{                
          this.AlertList = JSON.parse (data.apiData);      
          this.FilteredList = this.AlertList;  
          this.LoadDataIntoMatTable();        
        }
      },
      error => {
        this.globals.ShowAlert(this.globals.DialogTypeError,error);
        return;             
      });
 
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeAlertHistory> (this.AlertList);     
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

  ClearAll(){
    this.globals.QuestionAlert("Are you sure you want to Clear all Pending Messages ?").subscribe(response=>{
        if (response == 1){
          let stp = new ClsAlertSetup(this.dataService);
          stp.clearAllAlerts().subscribe(data=>{
            if (data.queryStatus == 0){
              this.globals.ShowAlert(3, data.apiData);
            }
            else{
              this.globals.SnackBar("info","Messages cleared successfulle");
              this.AlertList = [];      
              this.FilteredList = this.AlertList;  
              this.LoadDataIntoMatTable();  
            }
          })
        }
    })
  }
  
}
