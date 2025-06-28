import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ClsAuctionEntries, TypeAuctionEntry } from 'src/app/Dashboard/Classes/ClsAuctionEntries';
import { AuctionService } from './auction.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ExcelExportService } from 'src/app/Services/excel-export.service';

@Component({
  selector: 'app-auctionentries',
  templateUrl: './auctionentries.component.html',
  styleUrls: ['./auctionentries.component.scss']
}) 

@AutoUnsubscribe
export class AuctionentriesComponent {

  constructor(private dataService: DataService, private auctionService: AuctionService, private globals: GlobalsService, private router: Router, 
    private excelService: ExcelExportService, private auth: AuthService ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  FromDate: number = 0; 
  ToDate: number = 0;

  FromDateValid: boolean = true; 
  ToDateValid: boolean = true;

  AuctionEntriesList!: TypeAuctionEntry[];
  dataSource!: MatTableDataSource<TypeAuctionEntry>;  
  columnsToDisplay: string[] = [ '#', 'Auction_No', 'Auction_Date','Loan_No', 'Auction_Amount', 'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){        
    this.LoadAuctionEntriesList(999,999);
    this.FromDate = this.globals.DateToInt(new Date());
    this.ToDate = this.globals.DateToInt(new Date());    
  } 
 
  LoadAuctionEntriesList(FromDate: number, ToDate: number){
    let auc = new ClsAuctionEntries(this.dataService);    
    
    auc.getAuctions(0,FromDate, ToDate).subscribe( data => {         
      
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.AuctionEntriesList = JSON.parse(data.apiData);    
        this.LoadDataIntoMatTable();
        if (FromDate === 999 || ToDate === 999){ this.FromDate = data.ExtraData; this.ToDate = data.ExtraData;}
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }


  FilterByDate(){
    this.LoadAuctionEntriesList(this.FromDate, this.ToDate)
  }

  AddNewAuction(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdAuctions, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var auc = new ClsAuctionEntries(this.dataService);        
    var aucobj = auc.Initialize();
    this.auctionService.setAuction(aucobj);
    this.router.navigate(['dashboard/auctions/auction']);
  }

  OpenAuction(auc: TypeAuctionEntry){    
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdAuctions, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.auctionService.setAuction(auc);
    this.router.navigate(['dashboard/auctions/auction']);
  } 

  DeleteAuction(Auction: TypeAuctionEntry){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdAuctions, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Auction?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsAuctionEntries(this.dataService);
        ar.Auction = Auction;
        ar.deleteAuction().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Auction deleted successfully");
            const index =  this.AuctionEntriesList.indexOf(Auction);
            this.AuctionEntriesList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeAuctionEntry> (this.AuctionEntriesList);     
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

      const ExportList = this.AuctionEntriesList.map((item: any) => SelectedColumns.map(col => item[col]));

      this.excelService.exportAsExcelFile(ExportList,"Auctions", SelectedColumns);
      this.globals.SnackBar("info","Auction List downloaded successfully")
    }
    

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

}
