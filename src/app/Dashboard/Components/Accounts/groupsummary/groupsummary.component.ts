import { Component, ElementRef, ViewChild } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAccReports, TypeTrialBalance} from 'src/app/Dashboard/Classes/ClsAccReports';
import { TypeCompanies } from 'src/app/Dashboard/Classes/ClsCompanies';
import { ClsLedgerGroups, TypeLedgerGroup } from 'src/app/Dashboard/Classes/ClsLedgerGroup';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-groupsummary',
  templateUrl: './groupsummary.component.html',
  styleUrls: ['./groupsummary.component.scss']
})
@AutoUnsubscribe
export class GroupsummaryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  FromDate: number = 0;
  ToDate: number  = 0;
  Opening_Balance: number = 0;
  Closing_Balance: number = 0;
  GroupSummarylist:       TypeTrialBalance[] = [];
  CompInfo!: TypeCompanies;
  GrpType: number = 0;
  DetType: number = 0;
  ShowTransactions: number = 0;

  GrpList: TypeLedgerGroup[] = [];
  SelectedGroup!:  TypeLedgerGroup;
  
  ngOnInit(){   
    this.CompInfo = JSON.parse (sessionStorage.getItem("sessionSelectedCompany")!);      
    this.FromDate = this.CompInfo.Fin_From;
    this.ToDate   = this.globals.DateToInt(new Date());
    let grp = new ClsLedgerGroups(this.dataService);
    grp.getLedgerGroups(0).subscribe(data=>{
      this.GrpList = JSON.parse(data.apiData);
    })
    // this.LoadGroupSummary(this.CompInfo.Fin_From, this.globals.DateToInt(new Date()));    
  }

  LoadGroupSummary(FromDate: number, ToDate: number){
    let ln = new ClsAccReports(this.dataService);    
    ln.getTrialBalance(this.SelectedGroup.GrpSno,FromDate, ToDate, this.GrpType, this.DetType).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                        
        this.GroupSummarylist = JSON.parse(data.apiData);            
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  FilterGroupSummary(){
    this.LoadGroupSummary(this.FromDate,this.ToDate);
  }
  
  DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
}

getGroup($event: TypeLedgerGroup){  
    this.SelectedGroup = $event;    
  }

  exportexcel(){
    let element = document.getElementById('groupsummary'); 
    const sheet: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    
    // let element = document.getElementById('Loans'); For Direct Table
    // const sheet4: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    
    const wb: XLSX.WorkBook = XLSX.utils.book_new();    
    XLSX.utils.book_append_sheet(wb, sheet, 'Group Summary');  
    
    /* save to file */  
    XLSX.writeFile(wb, "Group Summary.xlsx");
  }
}
