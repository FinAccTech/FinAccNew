import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsRedemptions, TypeRedemption } from 'src/app/Dashboard/Classes/ClsRedemptions';
import { RedemptionserviceService } from './redemptionservice.service';
import { AuthService } from 'src/app/Services/auth.service';
import { VoucherprintService } from 'src/app/Services/voucherprint.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ExcelExportService } from 'src/app/Services/excel-export.service';


@Component({
  selector: 'app-redemptions',
  templateUrl: './redemptions.component.html',
  styleUrls: ['./redemptions.component.scss']
})

@AutoUnsubscribe
export class RedemptionsComponent {
  
  constructor(private dataService: DataService, private auth: AuthService,  private RedemptionService: RedemptionserviceService, private excelService: ExcelExportService,
    private globals: GlobalsService, private router: Router,
  private vouPrint: VoucherprintService ){
     
  }
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  FromDate: number = 0;
  ToDate: number = 0;

  FromDateValid: boolean = true;
  ToDateValid: boolean = true; 

  RedemptionsList!: TypeRedemption[];
  dataSource!: MatTableDataSource<TypeRedemption>;  
  columnsToDisplay: string[] = [ '#', 'Redemption_No', 'Redemption_Date', 'Loan_No', 'Loan', 'Rec_Principal','Rec_Interest', 'Nett_Payable', 'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.FromDate = this.globals.DateToInt(new Date());
    this.ToDate = this.globals.DateToInt(new Date());    
    this.LoadRedemptionsList(999,999);        
  } 
 
  LoadRedemptionsList(FromDate: number, ToDate: number){
    let ln = new ClsRedemptions(this.dataService);    
    ln.getRedemptions(0, FromDate, ToDate).subscribe( data => {               
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.RedemptionsList = JSON.parse(data.apiData);                  
        this.LoadDataIntoMatTable();        
        if (FromDate === 999 || ToDate === 999){ this.FromDate = data.ExtraData; this.ToDate = data.ExtraData;}
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewRedemption(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRedemptions, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var rec = new ClsRedemptions(this.dataService);        
    var recobj = rec.Initialize();    
    this.RedemptionService.setRedemption(recobj);
    this.router.navigate(['dashboard/redemptions/redemption']);
  }
 
  OpenRedemption(rec: TypeRedemption){        
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRedemptions, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.RedemptionService.setRedemption(rec);
    this.router.navigate(['dashboard/redemptions/redemption']); 
  } 

  DeleteRedemption(Redemption: TypeRedemption){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRedemptions, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Redemption?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsRedemptions(this.dataService);
        ar.Redemption = Redemption;
        ar.deleteRedemption().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Redemption deleted successfully");
            const index =  this.RedemptionsList.indexOf(Redemption);
            this.RedemptionsList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  PrintTransaction(trans: TypeRedemption){            
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRedemptions, this.globals.UserRightPrint)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series "); return; }
      else { this.vouPrint.PrintVoucher(trans, 14 ,trans.Series.Print_Style!);}
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeRedemption> (this.RedemptionsList);     
    if (this.dataSource.filteredData)
    {    
      setTimeout(() => this.dataSource.paginator = this.paginator);
      setTimeout(() => this.dataSource.sort = this.sort);      
    }
  }

  FilterByDate(){ 
    this.LoadRedemptionsList(this.FromDate, this.ToDate)
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
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

      const ExportList = this.RedemptionsList.map((item: any) => SelectedColumns.map(col => item[col]));

      this.excelService.exportAsExcelFile(ExportList,"Redemptions", SelectedColumns);
      this.globals.SnackBar("info","Redemptions List downloaded successfully")
    }
    


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
}
