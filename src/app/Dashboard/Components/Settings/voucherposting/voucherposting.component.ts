import { Component } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsLedgers, TypeLedger } from 'src/app/Dashboard/Classes/ClsLedgers';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { TypeReceipt } from 'src/app/Dashboard/Classes/ClsReceipts';
import { TypeRedemption } from 'src/app/Dashboard/Classes/ClsRedemptions';
import { ClsTransactions } from 'src/app/Dashboard/Classes/ClsTransactions';
import { ClsVouchers, TypeVoucher } from 'src/app/Dashboard/Classes/ClsVouchers';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

interface TypeStatusArray{
  operation: string;
}

@Component({
  selector: 'app-voucherposting',
  templateUrl: './voucherposting.component.html',
  styleUrls: ['./voucherposting.component.scss']
})

@AutoUnsubscribe
export class VoucherpostingComponent {
  constructor(private dataService: DataService, private globals: GlobalsService){}

  PostLoans: boolean = true;
  PostReceipts: boolean = true;
  PostRedemptions: boolean = true;
  PostAuctions: boolean = true;
  PostRepledges: boolean = true;
  PostRpPayments: boolean = true;
  PostRpClosures: boolean = true;
  CurrentOperation: string = "";

  LoansList: TypeLoan[] = []; 
  ReceiptsList: TypeReceipt[] = [];
  RedemptionsList: TypeRedemption[] = [];
  StdLedgerList: TypeLedger[] = [];

  StatusArray: TypeStatusArray[] = [];

  ngOnInit(){
   
  }

  PostVouchers(){            
    let trans = new ClsTransactions(this.dataService);
    trans.repostVouchers().subscribe(data=>{
      if (data.queryStatus == 1){
        this.globals.ShowAlert(1,"Vouchers RePosted Successfully");
      }
      else{
        this.globals.ShowAlert(3,"Error Reposting Vouchers");
      }
    })
    
  }

  ChangeOption($event: any, type: number){

    switch (type) {
      case 1:
        this.PostLoans = $event.target.checked;
        break;
      case 2:
        this.PostReceipts = $event.target.checked;
        break;
      case 3:
        this.PostRedemptions = $event.target.checked;
        break;
      case 4:
        this.PostAuctions = $event.target.checked;
        break;
      case 5:
        this.PostRepledges = $event.target.checked;
        break;
      case 6:
        this.PostRpPayments = $event.target.checked;
        break;
      case 7:
        this.PostRpClosures = $event.target.checked;
        break;      
    }
    
  }
}
