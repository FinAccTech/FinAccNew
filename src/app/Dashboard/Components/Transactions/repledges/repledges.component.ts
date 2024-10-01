import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ClsVoucherSeries } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { VoucherprintService } from 'src/app/Services/voucherprint.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { RepledgeService } from './repledge.service';
import { ClsRepledges, TypeRepledge } from 'src/app/Dashboard/Classes/ClsRepledges';

@Component({
  selector: 'app-repledges',
  templateUrl: './repledges.component.html',
  styleUrls: ['./repledges.component.scss']
}) 

@AutoUnsubscribe
export class RepledgesComponent {
  IsOpen: number = 0;
  
  constructor(private route: ActivatedRoute, private dataService: DataService, private rpService: RepledgeService, 
              private globals: GlobalsService, private router: Router, private auth: AuthService,
              private vouprint: VoucherprintService
             ){
    this.route.params.subscribe(             
      (params: Params) => 
      {                      
        this.IsOpen =  +(params['isopen']);     
        sessionStorage.setItem("RepledgeIsOpen",this.IsOpen.toString())!;
        this.rpService.LoadedFromDate = 0;
        this.rpService.LoadedToDate = 0;
        this.InitRepledgesList();
      });  
  }
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  FromDate: number = 0;
  ToDate: number = 0;

  FromDateValid: boolean = true; 
  ToDateValid: boolean = true;

  RepledgesList!: TypeRepledge[];
  dataSource!: MatTableDataSource<TypeRepledge>;  
  columnsToDisplay: string[] = [ '#', 'Repledge_No', 'Repledge_Date','Party_Name', 'Principal', 'Scheme_Name', 'TotNettWt', 'Mature_Date','Cancel_Status', 'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  


  ngOnInit(){
 
  } 
 
  InitRepledgesList(){
    if (this.rpService.LoadedFromDate == 0 || this.rpService.LoadedToDate == 0){
      this.LoadRepledgesList(999,999);
      this.FromDate = this.globals.DateToInt(new Date());
      this.ToDate = this.globals.DateToInt(new Date());      
    }      
    else{
      this.FromDate = this.rpService.LoadedFromDate;
      this.ToDate = this.rpService.LoadedToDate;
      this.LoadRepledgesList(this.rpService.LoadedFromDate,this.rpService.LoadedToDate);
    }
  }

  LoadRepledgesList(FromDate: number, ToDate: number){                
    let ln = new ClsRepledges(this.dataService);        
    ln.getRepledges(0,FromDate, ToDate,this.globals.RepledgeStatusAll, this.globals.CancelStatusAll, this.IsOpen).subscribe( data => {              
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.rpService.LoadedFromDate = FromDate;
        this.rpService.LoadedToDate = ToDate;                
        this.RepledgesList = JSON.parse(data.apiData);               
        this.LoadDataIntoMatTable();
        if (FromDate === 999 || ToDate === 999){ this.FromDate = data.ExtraData; this.ToDate = data.ExtraData;}
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }
  
  FilterByDate(){
    this.LoadRepledgesList(this.FromDate, this.ToDate) 
  }

  AddNewRepledge(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRepledge, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var ln = new ClsRepledges(this.dataService);        
    var lnobj = ln.Initialize();
    lnobj.IsOpen = this.IsOpen;
    this.rpService.setRepledge(lnobj);
    this.router.navigate(['dashboard/repledge']);
  }

  OpenRepledge(Ln: TypeRepledge){      
  if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRepledge, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.rpService.setRepledge(Ln);
    this.router.navigate(['dashboard/repledge']);
  } 

  DeleteRepledge(Repledge: TypeRepledge){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRepledge, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    
    this.globals.QuestionAlert("Are you sure you wanto to delete this Repledge?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsRepledges(this.dataService);
        ar.Repledge = Repledge;
        ar.deleteRepledge().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Repledge deleted successfully");
            const index =  this.RepledgesList.indexOf(Repledge);
            this.RepledgesList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  PrintTransaction(trans: TypeRepledge){    
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRepledge, this.globals.UserRightPrint)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    
    let ser = new ClsVoucherSeries(this.dataService);
    trans.Series = JSON.parse(trans.Series_Json)[0];
    trans.Supplier = JSON.parse(trans.Party_Json)[0];
    trans.Scheme = JSON.parse(trans.Scheme_Json)[0];        
    
    if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series "); return; }
      else { this.vouprint.PrintVoucher(trans, 12 ,trans.Series.Print_Style!);}

    // if (trans.Series.Print_Style !== "") {
    //   this.vouprint.Style_Repledge_Pgf(trans, trans.Series.Print_Style!);
    // }
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
