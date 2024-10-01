import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ReLoanService } from './reloans.service';
import { ClsReLoans, TypeReLoan } from 'src/app/Dashboard/Classes/ClsReloans';
import { AuthService } from 'src/app/Services/auth.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-reloans',
  templateUrl: './reloans.component.html',
  styleUrls: ['./reloans.component.scss']
})

@AutoUnsubscribe
export class ReloansComponent {
  
  constructor(private dataService: DataService, private auth: AuthService, private reloanService: ReLoanService, private globals: GlobalsService, private router: Router ){}
  
  @ViewChild('TABLE')  table!: ElementRef; 
  FromDate: number = 0;
  ToDate: number = 0;

  FromDateValid: boolean = true;
  ToDateValid: boolean = true;

  ReLoansList!: TypeReLoan[];
  dataSource!: MatTableDataSource<TypeReLoan>;  
  columnsToDisplay: string[] = [ '#', 'ReLoan_No', 'ReLoan_Date', 'Loan_No', 'Loan', 'Rec_Principal','Rec_Interest', 'Nett_Payable', 'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){        
    this.LoadReLoansList(999,999);
    this.FromDate = this.globals.DateToInt(new Date());
    this.ToDate = this.globals.DateToInt(new Date());
  } 
 
  LoadReLoansList(FromDate: number, ToDate: number){
    let ln = new ClsReLoans(this.dataService);    
    ln.getReLoans(0, FromDate, ToDate).subscribe( data => {               
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.ReLoansList = JSON.parse(data.apiData);                 
        this.LoadDataIntoMatTable();        
        if (FromDate === 999 || ToDate === 999){ this.FromDate = data.ExtraData; this.ToDate = data.ExtraData;}
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewReLoan(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdReLoan, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var rec = new ClsReLoans(this.dataService);        
    var recobj = rec.Initialize();    
    this.reloanService.setReLoan(recobj);
    this.router.navigate(['dashboard/reloans/reloan']);
  }

  OpenReLoan(rec: TypeReLoan){        
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdReLoan, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.reloanService.setReLoan(rec);
    this.router.navigate(['dashboard/reloans/reloan']); 
  } 

  DeleteReLoan(ReLoan: TypeReLoan){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdReLoan, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this ReLoan?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsReLoans(this.dataService);
        ar.ReLoan = ReLoan;
        ar.deleteReLoan().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","ReLoan deleted successfully");
            const index =  this.ReLoansList.indexOf(ReLoan);
            this.ReLoansList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeReLoan> (this.ReLoansList);     
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
    this.LoadReLoansList(this.FromDate, this.ToDate)
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }


}
