import { Injectable } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeVoucher } from 'src/app/Dashboard/Classes/ClsVouchers';


@Injectable({
  providedIn: 'root'
})
@AutoUnsubscribe
export class VoucherService {
  CurrentVoucher!: TypeVoucher;
  LoadedFromDate: number = 0;
  LoadedToDate: number = 0;

  constructor() { }

  setVoucher(Voucher: TypeVoucher){
    this.CurrentVoucher = Voucher;
  }

  getVoucher(){
    return this.CurrentVoucher;
  }
  
}
