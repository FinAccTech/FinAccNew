import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { ClsLoans, TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { LoanService } from './loan.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ClsVoucherSeries } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { VoucherprintService } from 'src/app/Services/voucherprint.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { concatMap, from, Observable } from 'rxjs';
import { ClsTransactions } from 'src/app/Dashboard/Classes/ClsTransactions';

@Component({
  selector: 'app-loans',
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
}) 

@AutoUnsubscribe
export class LoansComponent{
  IsOpen: number = 0;
  
  constructor(private route: ActivatedRoute, private dataService: DataService, private loanService: LoanService, 
              private globals: GlobalsService, private router: Router, private auth: AuthService,
              private vouprint: VoucherprintService
             ){
    this.route.params.subscribe(             
      (params: Params) => 
      {                      
        this.IsOpen =  +(params['isopen']);     
        sessionStorage.setItem("loanIsOpen",this.IsOpen.toString())!;
        this.loanService.LoadedFromDate = 0;
        this.loanService.LoadedToDate = 0;
        this.InitLoansList();
      });  
  }
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  FromDate: number = 0;
  ToDate: number = 0;

  FromDateValid: boolean = true; 
  ToDateValid: boolean = true;

  LoansList!: TypeLoan[];
  dataSource!: MatTableDataSource<TypeLoan>;  
  columnsToDisplay: string[] = [ '#', 'Loan_No', 'Loan_Date','Party_Name', 'Principal', 'Grp_Name','Scheme_Name', 'TotNettWt', 'Mature_Date','Approval_Status', 'Cancel_Status', 'crud'];
  columnsToDisplayWithExpand = [ ...this.columnsToDisplay];
  expandedElement!: TypeLoan | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    
  } 
 
InitLoansList(){
  if (this.loanService.LoadedFromDate == 0 || this.loanService.LoadedToDate == 0){
    this.LoadLoansList(999,999);
    this.FromDate = this.globals.DateToInt(new Date());
    this.ToDate = this.globals.DateToInt(new Date());      
  }      
  else{
    this.FromDate = this.loanService.LoadedFromDate;
    this.ToDate = this.loanService.LoadedToDate;
    this.LoadLoansList(this.loanService.LoadedFromDate,this.loanService.LoadedToDate);
  }
}


// checkapi(){
//   let items = [24, 25, 26, 27, 28]; 
  
//   from(items) // Convert array into observable sequence
//   .pipe(
//     concatMap(item => this.makeapicall(item) ) // Ensures sequential execution
//   )
//   .subscribe(
//     response => console.log('API Response:', response),
//     error => console.error('Error:', error),
//     () => console.log('All API calls completed!')
//   );
// }

// makeapicall(item: number){
//   console.log(item);
//   let trans = new ClsTransactions(this.dataService);

//   return trans.getLoans(item,0,0,0,0,0,0)
  
// }

  LoadLoansList(FromDate: number, ToDate: number){ 
    let ln = new ClsLoans(this.dataService);    
    
    ln.getLoanBySno(0,FromDate, ToDate,this.globals.LoanStatusAll, this.globals.ApprovalStatusAll, this.globals.CancelStatusAll, this.IsOpen).subscribe( data => {         
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.loanService.LoadedFromDate = FromDate;
        this.loanService.LoadedToDate = ToDate;                
        this.LoansList = JSON.parse(data.apiData);          
                             
        this.LoansList.map(ln=>{
          ln.Customer = JSON.parse(ln.Party_Json)[0];
          if (ln.Images_Json) {ln.fileSource =  JSON.parse(ln.Images_Json);}
          ln.IGroup = JSON.parse(ln.Group_Json)[0];
          ln.Location  = JSON.parse(ln.Location_Json)[0];          
          ln.Scheme = JSON.parse(ln.Scheme_Json)[0];  
        });
        
        //let arrayKeys = this.LoansList.keys();

        // for (let key of arrayKeys) {
        //   console.log(`Index: ${key}, Name: ${this.LoansList[key]}.name` );
        // }

        this.LoadDataIntoMatTable();
        if (FromDate === 999 || ToDate === 999){ this.FromDate = data.ExtraData; this.ToDate = data.ExtraData;}
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }
  

  FilterByDate(){
    this.LoadLoansList(this.FromDate, this.ToDate) 
  }

  AddNewLoan(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLoans, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }

    var ln = new ClsLoans(this.dataService);        
    var lnobj = ln.Initialize();
    lnobj.IsOpen = this.IsOpen;
    this.loanService.setLoan(lnobj);
    this.router.navigate(['dashboard/loan']);
  }

  OpenLoan(Ln: TypeLoan){    
  // if (this.auth.LoggedUser.User_Type == 0) { this.globals.SnackBar("error", "You dont have sufficient privileges to edit this"); return}
  if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLoans, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.loanService.setLoan(Ln);
    this.router.navigate(['dashboard/loan']);
  } 

  DeleteLoan(Loan: TypeLoan){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLoans, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    
    this.globals.QuestionAlert("Are you sure you wanto to delete this Loan?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsLoans(this.dataService);
        ar.Loan = Loan;
        ar.deleteLoan().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Loan deleted successfully");
            const index =  this.LoansList.indexOf(Loan);
            this.LoansList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  PrintTransaction(trans: TypeLoan){    
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLoans, this.globals.UserRightPrint)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    if (trans.Approval_Status == this.globals.ApprovalStatusUnApproved){
      this.globals.SnackBar("error","UnApproved Loans cannot be printed... ")
      return;
    }
    let ser = new ClsVoucherSeries(this.dataService);
    trans.Series = JSON.parse(trans.Series_Json)[0];
    trans.Customer = JSON.parse(trans.Party_Json)[0];
    trans.Scheme = JSON.parse(trans.Scheme_Json)[0];
    trans.IGroup = JSON.parse(trans.IGroup_Json)[0];
    trans.Location = JSON.parse(trans.Location_Json)[0];
    
    if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series "); return; }
      else { this.vouprint.PrintVoucher(trans, 12 ,trans.Series.Print_Style!);}

    // if (trans.Series.Print_Style !== "") {
    //   this.vouprint.Style_Loan_Pgf(trans, trans.Series.Print_Style!);
    // }
  }
  
  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeLoan> (this.LoansList);     
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
