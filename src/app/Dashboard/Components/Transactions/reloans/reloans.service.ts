import { Injectable } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeReLoan } from 'src/app/Dashboard/Classes/ClsReloans';



@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class ReLoanService {
  CurrentReLoan!: TypeReLoan;
  
  constructor() { }

  setReLoan(ReLoan: TypeReLoan){
    this.CurrentReLoan = ReLoan;
  }

  getReLoan(){
    return this.CurrentReLoan;
  }
  
}
