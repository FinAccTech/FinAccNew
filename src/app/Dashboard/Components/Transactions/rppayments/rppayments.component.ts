import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsRpPayments, TypeRpPayment } from 'src/app/Dashboard/Classes/ClsRpPayments';
import { AuthService } from 'src/app/Services/auth.service';
import { VoucherprintService } from 'src/app/Services/voucherprint.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { RpPaymentService } from './rppaymentservice';

@Component({
  selector: 'app-rppayments',
  templateUrl: './rppayments.component.html',
  styleUrls: ['./rppayments.component.scss']
})

@AutoUnsubscribe
export class RppaymentsComponent {
  IsOpen: number = 0;

  constructor(private route: ActivatedRoute, private auth: AuthService, private dataService: DataService, private rppmtService: RpPaymentService, 
    private globals: GlobalsService, private router: Router, private vouPrint: VoucherprintService ){
    this.route.params.subscribe(             
      (params: Params) => 
      {                      
        this.IsOpen =  +(params['isopen']);     
        sessionStorage.setItem("rppaymentIsOpen",this.IsOpen.toString())!;
        this.InitRpPaymentsList();
      });  
  }
  
  @ViewChild('TABLE')  table!: ElementRef; 
  FromDate: number = 0;
  ToDate: number = 0;

  FromDateValid: boolean = true;
  ToDateValid: boolean = true;

  RpPaymentsList!: TypeRpPayment[];
  dataSource!: MatTableDataSource<TypeRpPayment>;  
  columnsToDisplay: string[] = [ '#', 'RpPayment_No', 'RpPayment_Date', 'Repledge_No', 'Rp_Principal','Rp_Interest', 'Nett_Payable', 'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  InitRpPaymentsList(){          
    this.LoadRpPaymentsList(999,999);
    this.FromDate = this.globals.DateToInt(new Date());
    this.ToDate = this.globals.DateToInt(new Date());
  } 
 
  LoadRpPaymentsList(FromDate: number, ToDate: number){
    let ln = new ClsRpPayments(this.dataService);    
    ln.getRpPayments(0, FromDate, ToDate, this.IsOpen).subscribe( data => {               
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.RpPaymentsList = JSON.parse(data.apiData);                 
        this.LoadDataIntoMatTable();        
        if (FromDate === 999 || ToDate === 999){ this.FromDate = data.ExtraData; this.ToDate = data.ExtraData;}
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewRpPayment(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRpPayments, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var rec = new ClsRpPayments(this.dataService);        
    var recobj = rec.Initialize();    
    recobj.IsOpen = this.IsOpen;
    this.rppmtService.setRpPayment(recobj);
    this.router.navigate(['dashboard/rppayment']);
  }

  OpenRpPayment(rec: TypeRpPayment){            
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRpPayments, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    
    this.rppmtService.setRpPayment(rec);
    this.router.navigate(['dashboard/rppayment']); 
  } 

  DeleteRpPayment(RpPayment: TypeRpPayment){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRpPayments, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this RpPayment?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsRpPayments(this.dataService);
        ar.RpPayment = RpPayment;
        ar.deleteRpPayment().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","RpPayment deleted successfully");
            const index =  this.RpPaymentsList.indexOf(RpPayment);
            this.RpPaymentsList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  PrintTransaction(trans: TypeRpPayment){            
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRpPayments, this.globals.UserRightPrint)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series "); return; }
      else { this.vouPrint.PrintVoucher(trans, 13 ,trans.Series.Print_Style!);}
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeRpPayment> (this.RpPaymentsList);     
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
  
  FilterByDate(){
    this.LoadRpPaymentsList(this.FromDate, this.ToDate)
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }


}
