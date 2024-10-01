import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService }    from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { TypePayMode } from '../../Types/TypePayMode';
import { ClsLedgers, TypeLedger } from '../../Classes/ClsLedgers';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';


@Component({
  selector: 'app-paymodes',
  templateUrl: './paymodes.component.html',
  styleUrls: ['./paymodes.component.scss']
})

@AutoUnsubscribe
export class PaymodesComponent {
  PayModesList: TypePayMode[] = [];
  PaymnentModeLedgers: TypeLedger[] = [];
  errText: string = "";
  ModeValid: boolean[] = [];
  AmtValid: boolean[] = []; 
  totalAmount = 0;

  constructor(
    public dialogRef: MatDialogRef<PaymodesComponent>,
    private globals: GlobalsService,
    @Inject(MAT_DIALOG_DATA) public data: any,        
    private dataService: DataService
  )  {}

  ngOnInit(){        
    
    let led = new ClsLedgers(this.dataService);
    led.getPaymentModes().subscribe(data=>{
      this.PaymnentModeLedgers = JSON.parse(data.apiData);

      if (this.data.PaymentModeList.length == 0){
        this.PayModesList.push ({"Ledger": this.PaymnentModeLedgers[0], "Amount" : this.data.Amount})
        this.ModeValid[this.PayModesList.length-1] = true;        
        this.AmtValid[this.PayModesList.length-1] = true;        
      }
      else{
        this.PayModesList =  this.data.PaymentModeList;
        let i = 0;
        this.PayModesList.forEach(mode=>{
          this.ModeValid[i] = true;
          this.AmtValid[i] = true;
          i++;
        })
      }
    })
  }

  SelectLoan(loan: any){
    this.dialogRef.close(loan.LoanSno);
  }

  getLedger($event: TypeLedger, i: number){    
    this.PayModesList[i].Ledger = $event;    
  }

  AddMode(){
    this.PayModesList.push ({"Ledger": {"LedSno":0, "Led_Code":"", "Led_Name":""}, "Amount" : 0})
    this.ModeValid[this.PayModesList.length-1] = true;
    this.AmtValid[this.PayModesList.length-1] = true;
  }

  RemoveMode(i: number){
    this.PayModesList.splice(i,1);
    this.ModeValid.splice(i,1);
    this.AmtValid.splice(i,1);
  }

  Submit(){
    let i = 0;
    this.errText =  "";
    let ValidPaymode = false;

    this.PayModesList.forEach(mode=>{            
      if (!mode.Ledger || mode.Ledger.LedSno == 0) { this.ModeValid[i] = false; ValidPaymode = false; return; } else {this.ModeValid[i] = true;}
      if (mode.Amount == 0) { this.AmtValid[i] = false; ValidPaymode = false; return; } else {this.AmtValid[i] = true}
      i++;
      ValidPaymode = true;
    })

    if (ValidPaymode == false) { return; }

    this.PayModesList.forEach(mode=>{
      let ledcount = this.PayModesList.filter((md)=>{
        return md.Ledger == mode.Ledger
      }).length;

      if (ledcount > 1 ) {
        this.errText = "** Duplicate Ledgers";
        ValidPaymode = false;
        return;
      }
      ValidPaymode = true; 
    })

    if (ValidPaymode == false) { return; }

    this.totalAmount = 0;
    this.PayModesList.forEach(mode=>{
      this.totalAmount+= mode.Amount;
    }) 

    if (+this.data.Amount !== +this.totalAmount)
    {
      this.errText = "** Amount do not match with the Loan Amount";
      return;
    }

    this.CloseDialog();
  }

  CloseDialog(){
    this.dialogRef.close(this.PayModesList);
  }

}
