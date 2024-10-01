import { Injectable } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeReceipt } from 'src/app/Dashboard/Classes/ClsReceipts';


@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class ReceiptService {
  CurrentReceipt!: TypeReceipt;
  
  constructor() { }

  setReceipt(Receipt: TypeReceipt){
    this.CurrentReceipt = Receipt;
  }

  getReceipt(){
    return this.CurrentReceipt;
  }
  
}
