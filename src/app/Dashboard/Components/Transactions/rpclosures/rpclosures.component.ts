import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsRpClosures, TypeRpClosure } from 'src/app/Dashboard/Classes/ClsRpClosures';
import { AuthService } from 'src/app/Services/auth.service';
import { VoucherprintService } from 'src/app/Services/voucherprint.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { RpClosureService } from './rpclosureservice';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rpclosures',
  templateUrl: './rpclosures.component.html',
  styleUrls: ['./rpclosures.component.scss']
})

@AutoUnsubscribe
export class RpclosuresComponent {
  
  constructor(private router: Router, private auth: AuthService, private dataService: DataService, private rpcService: RpClosureService, 
    private globals: GlobalsService, private vouPrint: VoucherprintService ){  }
  
  @ViewChild('TABLE')  table!: ElementRef; 
  FromDate: number = 0;
  ToDate: number = 0;

  FromDateValid: boolean = true;
  ToDateValid: boolean = true;

  RpClosuresList!: TypeRpClosure[];
  dataSource!: MatTableDataSource<TypeRpClosure>;  
  columnsToDisplay: string[] = [ '#', 'RpClosure_No', 'RpClosure_Date', 'Repledge_No', 'Rp_Principal','Rp_Interest', 'Nett_Payable', 'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  InitRpClosuresList(){          
    this.LoadRpClosuresList(999,999);
    this.FromDate = this.globals.DateToInt(new Date());
    this.ToDate = this.globals.DateToInt(new Date());
  } 
 
  LoadRpClosuresList(FromDate: number, ToDate: number){
    let ln = new ClsRpClosures(this.dataService);    
    ln.getRpClosures(0, FromDate, ToDate).subscribe( data => {               
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.RpClosuresList = JSON.parse(data.apiData);                 
        this.LoadDataIntoMatTable();        
        if (FromDate === 999 || ToDate === 999){ this.FromDate = data.ExtraData; this.ToDate = data.ExtraData;}
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewRpClosure(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRpRedemption, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var rec = new ClsRpClosures(this.dataService);        
    var recobj = rec.Initialize();        
    this.rpcService.setRpClosure(recobj);
    this.router.navigate(['dashboard/rpclosures/rpclosure']);
  }

  OpenRpClosure(rec: TypeRpClosure){            
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRpRedemption, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    
    this.rpcService.setRpClosure(rec);
    this.router.navigate(['dashboard/rpclosures/rpclosure']); 
  } 

  DeleteRpClosure(RpClosure: TypeRpClosure){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRpRedemption, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this RpClosure?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsRpClosures(this.dataService);
        ar.RpClosure = RpClosure;
        ar.deleteRpClosure().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","RpClosure deleted successfully");
            const index =  this.RpClosuresList.indexOf(RpClosure);
            this.RpClosuresList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  PrintTransaction(trans: TypeRpClosure){            
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRpRedemption, this.globals.UserRightPrint)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series "); return; }
      else { this.vouPrint.PrintVoucher(trans, 13 ,trans.Series.Print_Style!);}
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeRpClosure> (this.RpClosuresList);     
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
    this.LoadRpClosuresList(this.FromDate, this.ToDate)
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }


}
