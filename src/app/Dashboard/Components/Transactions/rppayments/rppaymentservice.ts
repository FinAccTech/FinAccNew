import { Injectable } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeRpPayment } from 'src/app/Dashboard/Classes/ClsRpPayments';


@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class RpPaymentService {
  CurrentRpPayment!: TypeRpPayment;
  
  constructor() { }

  setRpPayment(RpPayment: TypeRpPayment){
    this.CurrentRpPayment = RpPayment;
  }

  getRpPayment(){
    return this.CurrentRpPayment;
  }
  
}
