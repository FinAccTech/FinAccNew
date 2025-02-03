import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeRepledge } from 'src/app/Dashboard/Classes/ClsRepledges';
import { ClsReports, TypeRepledgeHistory } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-repledgehistory',  
  templateUrl: './repledgehistory.component.html',
  styleUrl: './repledgehistory.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

@AutoUnsubscribe
export class RepledgehistoryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  dataSource!: MatTableDataSource<TypeRepledge>;  
  columnsToDisplay: string[] = [ '#', 'Series_Name', 'Repledge_No', 'Repledge_Date','Party_Name', 'Principal', 'TotNettWt', 'Mature_Date'];
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeRepledge | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  
  
  FromDate: number = 0;
  ToDate: number = 0;

  RepledgesList:       TypeRepledgeHistory[] = [];
  SelectedRepledge!:    TypeRepledgeHistory;
  StatusList!: any[];
  StatusCount: any[] =  [{"Status":1, "Count":0,"Value":0}, {"Status":2,"Count":0,"Value":0}, {"Status":3,"Count":0,"Value":0}, {"Status":4,"Count":0,"Value":0} ];
  SelectedRepledgeStatus: number = 0;

  openpass: boolean = false;
  closepass: boolean = false;
  maturepass: boolean = false;
  aucpass: boolean = false;

  ngOnInit(){
    let newDate = new Date();          
    this.FromDate =  this.globals.DateToInt (new Date((newDate.getMonth() == 0 ? newDate.getFullYear() -1 :newDate.getFullYear()).toString() +  '/' + (newDate.getMonth() == 0 ? 12 : newDate.getMonth()).toString() + "/" + newDate.getDate().toString()));          
    this.ToDate = this.globals.DateToInt (new Date());

    this.LoadRepledgeHistory(0);
  }

  LoadRepledgeHistory(RepledgeStatus: number){
    let ln = new ClsReports(this.dataService);    
    ln.getRepledgeHistory(RepledgeStatus, this.FromDate, this.ToDate).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                
        this.RepledgesList = JSON.parse (data.apiData);     
        this.RepledgesList.map(ln=>{
          ln.Supplier = JSON.parse(ln.Party_Json)[0];
          if (ln.Images_Json) {ln.fileSource =  JSON.parse(ln.Images_Json);}          
          ln.Scheme = JSON.parse(ln.Scheme_Json)[0];
        })
           
        this.LoadDataIntoMatTable();

        ln.getRepledgeStatusCount(0).subscribe(data =>{
          this.StatusList = JSON.parse(data.apiData);
          
          this.StatusList.forEach(stat =>{            
              this.StatusCount[stat.Repledge_Status-1].Count = stat.RepledgesCount;
              this.StatusCount[stat.Repledge_Status-1].Value = stat.Principal;            
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
 
}
