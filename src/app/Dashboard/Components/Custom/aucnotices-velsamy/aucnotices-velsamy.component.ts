import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClsAlertSetup } from 'src/app/Dashboard/Classes/ClsAlertsSetup';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsReports, TypeAgeAnalysis } from 'src/app/Dashboard/Classes/ClsReports';
import { AlertconfirmationComponent } from 'src/app/Dashboard/widgets/alertconfirmation/alertconfirmation.component';
import { ReportpropertiesComponent } from 'src/app/Dashboard/widgets/reportproperties/reportproperties.component';
import { AucprintService, TypeAuctionNoticeInfo } from 'src/app/Services/aucprint.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-aucnotices-velsamy',  
  templateUrl: './aucnotices-velsamy.component.html', 
  styleUrl: './aucnotices-velsamy.component.scss',
  animations: [
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ],
})
export class AucnoticesVelsamyComponent {
  constructor(private globals: GlobalsService, private dataService: DataService, private dialog: MatDialog, private aucPrintService: AucprintService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  dataSource!: MatTableDataSource<TypeAgeAnalysis>;  
  columnsToDisplay: string[] = [ '#', 'Series_Name', 'Loan_No', 'Loan_Date','Party_Name', 'Principal', 'Grp_Name','Scheme_Name', 'Ason_Duration_Months', 'Ason_Duration_Days', 'Last_Receipt_Date' , 'Print'];
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeLoan | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  
  
  ShowFilterOptionsCustom: boolean = false;
  AsOnDate: number = 0;
  LoansList:       TypeAgeAnalysis[] = [];    
  FilteredList:    TypeAgeAnalysis[] = [];    

  PendingDues: number = 0;
  FilteMonthsParams: number = 6;  
  FilterMonths:number = 0;
  WithReceipt: boolean = false;
  ReportFormat: number = 0;  
  PrintStyleNo: number = 0;
  PrintStyleName: string = "Velusamy_Style1.json";

  CurrentFormat: number = 0;
  ReceiptDisabled: boolean = true;
  NoticeDate: number = 0;

  ngOnInit(){
    this.AsOnDate = this.globals.DateToInt( new Date());
    this.LoadAgeAnalysis(true);    
    this.NoticeDate = this.globals.DateToInt(new Date());
  }

  LoadAgeAnalysis(LoadPredefined: boolean){        
      let ln = new ClsReports(this.dataService);    
      ln.getAgeAnalysis().subscribe(data=> { 
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
          if (LoadPredefined){this.PreDefineSettings(0);}
        }
      },
      error => {
        this.globals.ShowAlert(this.globals.DialogTypeError,error);
        return;             
      });    
  }

  
  // FilterPending(){    
  //   this.FilteredList =  (this.FilteredList.filter(ln =>{ return ln.Pending_Dues === +this.PendingDues }));
  //   this.LoadDataIntoMatTable();
  // }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeAgeAnalysis> (this.FilteredList);     
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
    this.FilteredList = this.dataSource.filteredData;
    
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  } 

  FilterByParams(){
    
    
    // const monthVal = this.FilteMonthsParams == 0 ? 6 : this.FilteMonthsParams == 1 ? 11 : this.FilteMonthsParams == 2 ? 17 : 23;
    const monthVal = this.FilteMonthsParams;
    
    this.FilteredList = this.LoansList.filter(ln=>{
      return (ln.Ason_Duration_Months == monthVal) && ( this.WithReceipt == true ? ln.Last_Receipt_Date > 0 : ln.Last_Receipt_Date == 0) ;
    })
      // switch ( (Type==0 ? this.FilteMonthsParams : this.FilteDaysParams) ) {
      //   case 0:
      //     this.FilteredList =  (this.LoansList.filter(ln =>{ return ((Type==0 ? ln.Ason_Duration_Months : ln.Ason_Duration_Days)  ===   +(Type==0 ? this.FilterMonths : this.FilterDays)) && ( this.WithReceipt == true ? ln.Last_Receipt_Date > 0 : ln.Last_Receipt_Date == 0)  }));
      //     break;
      //   case 1:
      //     this.FilteredList =  (this.LoansList.filter(ln =>{ return ((Type==0 ? ln.Ason_Duration_Months : ln.Ason_Duration_Days) >  +(Type==0 ? this.FilterMonths : this.FilterDays)) && ( this.WithReceipt == true ? ln.Last_Receipt_Date > 0 : ln.Last_Receipt_Date == 0) }));
      //     break;
      //   case 2:
      //       this.FilteredList =  (this.LoansList.filter(ln =>{ return ((Type==0 ? ln.Ason_Duration_Months : ln.Ason_Duration_Days) <  +(Type==0 ? this.FilterMonths : this.FilterDays)) && ( this.WithReceipt == true ? ln.Last_Receipt_Date > 0 : ln.Last_Receipt_Date == 0) }));
      //       break;
      // }    
    this.LoadDataIntoMatTable();    
  }

  ClearFilter(){
    this.FilteredList = this.LoansList;
    this.LoadDataIntoMatTable();    
  }
 
  SendSms(){    
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
  
  PrintNotice(ln: TypeLoan){
      // const dialogRef = this.dialog.open(ReportpropertiesComponent, 
      //   { 
      //     data:  { "ReportSno": this.globals.RepAuctionNoticeCustomVelsamy, "Report_Name": "Auction History" } ,
      //   });        
      //   dialogRef.disableClose = true;    
      //   dialogRef.afterClosed().subscribe(result => {         
      //     if (result){                        
            
                 let prnLoans = [];
                 prnLoans.push(ln);
  
                let AucPrintList: TypeAuctionNoticeInfo[] = [];
                //this.LoansList.forEach(ln=>{                
                    AucPrintList.push({"Customer": ln.Customer, "Loan": ln, "LoansList" : prnLoans, Auction_DueDate : ""});
                //})
  
      //           this.aucPrintService.StartPrintingAuctionNotices(AucPrintList, result);          
      //     }          
      //   }); 
      this.aucPrintService.StartPrintingAuctionNotices(AucPrintList, [ {"Name":"noticedate", "Value":  this.globals.IntToDateString(this.NoticeDate)}], this.PrintStyleName);
    } 
  
    SetStyleName(){
      switch (this.PrintStyleNo) {
        case 0:
          this.PrintStyleName = "Velusamy_Style1.json"
          break;
      
        case 1:
          this.PrintStyleName = "Velusamy_Style2.json"
          break;

        case 2:
          this.PrintStyleName = "Velusamy_Style3.json"
          break;

        case 3:
          this.PrintStyleName = "Velusamy_Style4.json"
          break;

        case 4:
          this.PrintStyleName = "Velusamy_Style5.json"
          break;
      }      
    }

    PrintReport(){
      // const dialogRef = this.dialog.open(ReportpropertiesComponent, 
      //   { 
      //     data:  { "ReportSno": this.globals.RepAuctionNoticeCustomVelsamy, "Report_Name": "Auction History" } ,
      //   });        
      //   dialogRef.disableClose = true;    
      //   dialogRef.afterClosed().subscribe(result => {         
      //     if (result){                        
      //       if (result && result.length !==0){
                              
      let AucPrintList: TypeAuctionNoticeInfo[] = [];
      this.FilteredList.forEach(ln=>{                
          AucPrintList.push({"Customer": ln.Customer, "Loan": ln, "LoansList" : JSON.parse (ln.OtherLoans_Json), Auction_DueDate : ""});
      });
  
      this.aucPrintService.StartPrintingAuctionNotices(AucPrintList, [ {"Name":"noticedate", "Value": this.globals.IntToDateString(this.NoticeDate)}], this.PrintStyleName);
                //this.StartPrinting(Trans, VouType, result);
        //     }
        //   }          
        // }); 
    }
    
    PreDefineSettings(val: any){      
      this.CurrentFormat = val;

      switch (this.CurrentFormat) {
        case 0:
            this.FilteMonthsParams = 6;
            this.WithReceipt = false;
            this.PrintStyleNo = 0;  
            this.ReceiptDisabled = true;           
          break;
        case 1:
            this.FilteMonthsParams = 11;
            this.WithReceipt = false;
            this.PrintStyleNo = 1; 
            this.ReceiptDisabled = true;
          break;
        case 2:
            this.FilteMonthsParams = 11;
            this.WithReceipt = true;
            this.PrintStyleNo = 2; 
            this.ReceiptDisabled = true;
          break;
        case 3:
            this.FilteMonthsParams = 17;
            this.WithReceipt = true;
            this.PrintStyleNo = 3; 
            this.ReceiptDisabled = false;
          break;
        case 4:
            this.FilteMonthsParams = 23;
            this.WithReceipt = true;
            this.PrintStyleNo = 4; 
            this.ReceiptDisabled = false;
          break;
      }

      this.SetStyleName();
      this.FilterByParams();
    }
}
 