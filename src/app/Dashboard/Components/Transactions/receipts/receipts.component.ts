import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsReceipts, TypeReceipt } from 'src/app/Dashboard/Classes/ClsReceipts';
import { ReceiptService } from './receipts.service';
import { AuthService } from 'src/app/Services/auth.service';
import { VoucherprintService } from 'src/app/Services/voucherprint.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ExcelExportService } from 'src/app/Services/excel-export.service';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.scss']
})
 
@AutoUnsubscribe
export class ReceiptsComponent {
  IsOpen: number = 0;

  constructor(private route: ActivatedRoute, private auth: AuthService, private dataService: DataService, private ReceiptService: ReceiptService, private excelService: ExcelExportService,
    private globals: GlobalsService, private router: Router, private vouPrint: VoucherprintService ){
    this.route.params.subscribe(             
      (params: Params) => 
      {                      
        this.IsOpen =  +(params['isopen']);     
        sessionStorage.setItem("receiptIsOpen",this.IsOpen.toString())!;
        this.InitReceiptsList();
      });  
  }
  
  @ViewChild('TABLE')  table!: ElementRef; 
  FromDate: number  = 0;
  ToDate: number    = 0;

  FromDateValid: boolean = true;
  ToDateValid: boolean = true;

  ReceiptsList!: TypeReceipt[];
  dataSource!: MatTableDataSource<TypeReceipt>;  
  columnsToDisplay: string[] = [ '#', 'Receipt_No', 'Receipt_Date', 'Loan_No', 'Loan', 'Rec_Principal','Rec_Interest', 'Nett_Payable', 'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  InitReceiptsList(){        
    this.LoadReceiptsList(999,999);
    this.FromDate = this.globals.DateToInt(new Date());
    this.ToDate = this.globals.DateToInt(new Date());
  } 
 
  LoadReceiptsList(FromDate: number, ToDate: number){
    let ln = new ClsReceipts(this.dataService);    
    ln.getReceipts(0, FromDate, ToDate, this.IsOpen).subscribe( data => {               
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.ReceiptsList = JSON.parse(data.apiData);                 
        this.LoadDataIntoMatTable();        
        if (FromDate === 999 || ToDate === 999){ this.FromDate = data.ExtraData; this.ToDate = data.ExtraData;}
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewReceipt(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdReceipts, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var rec = new ClsReceipts(this.dataService);        
    var recobj = rec.Initialize();    
    recobj.IsOpen = this.IsOpen;
    this.ReceiptService.setReceipt(recobj);
    this.router.navigate(['dashboard/receipt']);
  }

  OpenReceipt(rec: TypeReceipt){            
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdReceipts, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    
    this.ReceiptService.setReceipt(rec);
    this.router.navigate(['dashboard/receipt']); 
  } 

  DeleteReceipt(Receipt: TypeReceipt){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdReceipts, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Receipt?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsReceipts(this.dataService);
        ar.Receipt = Receipt;
        ar.deleteReceipt().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Receipt deleted successfully");
            const index =  this.ReceiptsList.indexOf(Receipt);
            this.ReceiptsList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  PrintTransaction(trans: TypeReceipt){            
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdReceipts, this.globals.UserRightPrint)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series "); return; }
      else { this.vouPrint.PrintVoucher(trans, 13 ,trans.Series.Print_Style!);}
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeReceipt> (this.ReceiptsList);     
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
      
      SelectedColumns.indexOf("#") >= 0 ? SelectedColumns.splice( SelectedColumns.indexOf("#"),1) : null ;
      SelectedColumns.indexOf("crud") >= 0 ? SelectedColumns.splice( SelectedColumns.indexOf("crud"),1) : null ;

      const ExportList = this.ReceiptsList.map((item: any) => SelectedColumns.map(col => item[col]));

      this.excelService.exportAsExcelFile(ExportList,"Receipts", SelectedColumns);
      this.globals.SnackBar("info","Receipts List downloaded successfully")
    }
    

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  FilterByDate(){
    this.LoadReceiptsList(this.FromDate, this.ToDate)
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }


}
