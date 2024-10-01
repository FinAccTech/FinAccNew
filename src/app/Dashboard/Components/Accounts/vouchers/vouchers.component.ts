import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ClsVoucherSeries } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { VoucherprintService } from 'src/app/Services/voucherprint.service';
import { VoucherService} from './voucher.service';
import { ClsVouchers, TypeVoucher } from 'src/app/Dashboard/Classes/ClsVouchers';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-vouchers',
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.scss']
}) 

@AutoUnsubscribe
export class VouchersComponent{
    
  constructor(private route: ActivatedRoute, private dataService: DataService, private vouService: VoucherService, 
              private globals: GlobalsService, private router: Router, private auth: AuthService,              
              private vouprint: VoucherprintService
             ){
    this.route.params.subscribe(             
      (params: Params) => 
      {                              
        this.vouService.LoadedFromDate = 0;
        this.vouService.LoadedToDate = 0;
        this.ngOnInit();
      });  
  }
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  FromDate: number = 0;
  ToDate: number = 0;

  FromDateValid: boolean = true; 
  ToDateValid: boolean = true;

  VouchersList!: TypeVoucher[];
  dataSource!: MatTableDataSource<TypeVoucher>;  
  columnsToDisplay: string[] = [ '#', 'Vou_No', 'Vou_Date','VouType_Name', 'Series_Name', 'Voucher_Amount', 'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
      if (this.vouService.LoadedFromDate == 0 || this.vouService.LoadedToDate == 0){
        this.LoadVouchersList(999,999);
        this.FromDate = this.globals.DateToInt(new Date());
        this.ToDate = this.globals.DateToInt(new Date());      
      }      
      else{
        this.FromDate = this.vouService.LoadedFromDate;
        this.ToDate = this.vouService.LoadedToDate;
        this.LoadVouchersList(this.vouService.LoadedFromDate,this.vouService.LoadedToDate);
      }
  } 
 
  LoadVouchersList(FromDate: number, ToDate: number){
    let ln = new ClsVouchers(this.dataService);    
    
    ln.getVouchers(0,FromDate, ToDate, 0, 0, this.globals.CancelStatusAll).subscribe( data => {         
      
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.vouService.LoadedFromDate = FromDate;
        this.vouService.LoadedToDate = ToDate;
                
        this.VouchersList = JSON.parse(data.apiData);            
        this.LoadDataIntoMatTable();
        if (FromDate === 999 || ToDate === 999){ this.FromDate = data.ExtraData; this.ToDate = data.ExtraData;}
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }
  

  FilterByDate(){
    this.LoadVouchersList(this.FromDate, this.ToDate); 
  }

  AddNewVoucher(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdVouchers, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var vou = new ClsVouchers(this.dataService);        
    var vouobj = vou.Initialize();    
    this.vouService.setVoucher(vouobj);    
    this.router.navigate(['dashboard/vouchers/voucher']);
  }

  OpenVoucher(Ln: TypeVoucher){    
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdVouchers, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
  if (this.auth.LoggedUser.User_Type == 0) { this.globals.SnackBar("error", "You dont have sufficient privileges to edit this"); return}
    this.vouService.setVoucher(Ln);
    this.router.navigate(['dashboard/vouchers/voucher']);
  }  

  DeleteVoucher(Voucher: TypeVoucher){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdVouchers, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Voucher?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsVouchers(this.dataService);
        ar.Voucher = Voucher;
        ar.deleteVoucher().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Voucher deleted successfully");
            const index =  this.VouchersList.indexOf(Voucher);
            this.VouchersList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

 
  
  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeVoucher> (this.VouchersList);     
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
