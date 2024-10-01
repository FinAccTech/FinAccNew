import { Injectable } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';


@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class LoanService {
  CurrentLoan!: TypeLoan;
  LoadedFromDate: number = 0;
  LoadedToDate: number = 0;

  constructor() { }

  setLoan(Loan: TypeLoan){
    this.CurrentLoan = Loan;
  }

  getLoan(){
    return this.CurrentLoan;
  }
  
}
