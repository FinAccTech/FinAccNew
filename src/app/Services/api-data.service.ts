import { Injectable} from '@angular/core';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';
import { MatDialog } from '@angular/material/dialog';
import { ClsTransactions } from '../Dashboard/Classes/ClsTransactions';
import { DataService } from './data.service';
import { GlobalsService } from './globals.service';
import { ClsLoans, TypeLoan } from '../Dashboard/Classes/ClsLoan';
import { ClsParties, TypeParties } from '../Dashboard/Classes/ClsParties';

@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class ApiDataService
{
  constructor(private dialog: MatDialog, private dataService: DataService, private globals: GlobalsService){          
  }
  LoansList: TypeLoan[] = [];
  PartiesList: TypeParties[] = [];
    
  InitLoans(): void {    
    let ln = new ClsLoans(this.dataService);
    ln.getLoanBySno(0,0,0,this.globals.LoanStatusAll, this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).subscribe(data => {
      this.LoansList = JSON.parse(data.apiData);
      console.log(this.LoansList);
      console.log(JSON.stringify(this.LoansList).length / 1024);
      
      sessionStorage.setItem("ApiLoansList",JSON.stringify(this.LoansList));
    })
  }

  InitParties(): void{
    let pty = new ClsParties(this.dataService);
    pty.getParties(0,0,0,0,0).subscribe(data=>{
      this.PartiesList = JSON.parse(data.apiData);
      sessionStorage.setItem("ApiPartiesList",JSON.stringify(this.PartiesList));
    });          
  }

  getLoansList(): TypeLoan[]{
    return JSON.parse (sessionStorage.getItem("ApiLoansList")!);
    //return this.LoansList;
  }

  getPartiessList(): TypeParties[]{
    return JSON.parse (sessionStorage.getItem("ApiPartiesList")!);
    //return this.PartiesList;
  }

}
