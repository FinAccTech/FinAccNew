import { Injectable } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeRedemption } from 'src/app/Dashboard/Classes/ClsRedemptions';

@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class RedemptionserviceService {

  CurrentRedemption!: TypeRedemption;
  
  constructor() { }

  setRedemption(Redemption: TypeRedemption){
    this.CurrentRedemption = Redemption;
  }

  getRedemption(){
    return this.CurrentRedemption;
  }
}
