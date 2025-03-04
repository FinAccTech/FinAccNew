import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeRepledge } from 'src/app/Dashboard/Classes/ClsRepledges';
import { ClsReports, TypeInterestDetails, TypeInterestStructure, TypeRepledgeHistory, } from 'src/app/Dashboard/Classes/ClsReports';
import { ReportpropertiesComponent } from 'src/app/Dashboard/widgets/reportproperties/reportproperties.component';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-repledgeauctionhistory',  
  templateUrl: './repledgeauctionhistory.component.html',
  styleUrl: './repledgeauctionhistory.component.scss',
   animations: [
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ],
  }) 
  
@AutoUnsubscribe
export class RepledgeauctionhistoryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService, private dialog: MatDialog){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  dataSource!: MatTableDataSource<TypeRepledge>;  
  columnsToDisplay: string[] = [ '#', 'Series_Name', 'Repledge_No', 'Repledge_Date','Party_Name', 'Principal', 'Scheme_Name', 'TotNettWt', 'Mature_Date'];
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeRepledge | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;   
  
  AsOnDate: number = 0;
  RepledgesList:       TypeRepledgeHistory[] = [];
  SelectedLoan!:    TypeRepledgeHistory;
  StatusCount!: any[];
  SelectedLoanStatus: number = 0;
  
  ngOnInit(){
    this.AsOnDate = this.globals.DateToInt( new Date());
    this.LoadAuctionHistory();
  }

  LoadAuctionHistory(){
    let ln = new ClsReports(this.dataService);    
    ln.getRepledgeAuctionHistory(this.AsOnDate).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                
        this.RepledgesList = JSON.parse (data.apiData);
        console.log(this.RepledgesList);
        
        this.RepledgesList.map(ln=>{
          ln.Supplier = JSON.parse(ln.Party_Json)[0];
          if (ln.Images_Json) {ln.fileSource =  JSON.parse(ln.Images_Json);}                    
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
    this.dataSource = new MatTableDataSource<TypeRepledge> (this.RepledgesList);     
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

  PrintReport(){
    const dialogRef = this.dialog.open(ReportpropertiesComponent, 
      { 
        data:  this.globals.RepAuctionHistory,
      });        
      dialogRef.disableClose = true;    
      dialogRef.afterClosed().subscribe(result => {        
        if (result){                        
          if (result && result.length !==0){
              console.log(result);
              
              //this.StartPrinting(Trans, VouType, result);
          }
        }          
      }); 
  }
}

