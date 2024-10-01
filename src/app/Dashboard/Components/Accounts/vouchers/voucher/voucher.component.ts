import { Component, OnInit } from '@angular/core';
import { Location           } from '@angular/common';
import { Router } from '@angular/router';
import { ClsVoucherSeries, TypeVoucherSeries, TypeVoucherTypes } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { GlobalsService } from 'src/app/Services/globals.service';
import { DataService } from 'src/app/Services/data.service';
import { ClsVouchers, TypeVoucher, TypeVoucherLedger } from 'src/app/Dashboard/Classes/ClsVouchers';
import {  ClsLedgers, TypeLedger } from 'src/app/Dashboard/Classes/ClsLedgers';
import { VoucherService } from '../voucher.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';



@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.scss']
})

@AutoUnsubscribe 
export class VoucherComponent implements OnInit {

  VTypList!:       TypeVoucherTypes[];
  SelectedVTyp!:    TypeVoucherTypes; 

  
  VoucherSeriesList!:   TypeVoucherSeries[];
  SelectedSeries!:      TypeVoucherSeries;
  DefaultSeries!:       TypeVoucherSeries[];

  
  Voucher!:                TypeVoucher;  
  
  AutoSeriesNo: boolean = false;
  // For Validations  
  SeriesValid:        boolean = true;
  VoucherNumberValid:    boolean = true;
  VoucherDateValid:     boolean = true;   
  LoanValid:      boolean = true;
  NettPayableValid: boolean = true; 

  LedgersList: TypeLedger[] = [];
    
  VoucherLedgerList: TypeVoucherLedger[] = [];

  DebitTotal: number = 0;
  CreditTotal: number = 0;
  templateId: number = 0;

  constructor (      
                private globals:      GlobalsService,                 
                private vouService:   VoucherService, 
                private dataService:  DataService, 
                private router :      Router,
                private location:     Location,                
              )
              {           
                this.Voucher = vouService.getVoucher();     
                if (!this.Voucher){
                  this.router.navigate(['dashboard/vouchers']);
                  return;
                }   
              }

 ngOnInit(): void {    

  let ser = new ClsVoucherSeries(this.dataService);
  ser.getVoucherTypes(0).subscribe(data=> {        
    if (data.queryStatus == 0){
      this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
      return;
    }
    else{
      this.VTypList = JSON.parse (data.apiData);
      
      let led = new ClsLedgers(this.dataService);
      led.getLedgers(0,0,0).subscribe(data=>{
        this.LedgersList = JSON.parse(data.apiData);
      })

      if (this.Voucher.VouSno == 0){
        this.getVoucherType(
          this.SelectedVTyp = this.VTypList.filter(vtyp=>{
            return vtyp.VouTypeSno === this.globals.VTypJournal
          })[0]);

          this.AddLine();
          this.AddLine();   
      } else{
        console.log(this.Voucher.VouTypeSno);
        
        this.getVoucherType(this.VTypList.filter(vtyp=>{
          return vtyp.VouTypeSno === this.Voucher.VouTypeSno;
        })[0]);

        this.SelectedSeries = this.Voucher.Series;
        this.VoucherLedgerList = JSON.parse(this.Voucher.VouDetails_Json);    
        this.SetTotals();
      }
    }
  },
  error => {
    this.globals.ShowAlert(this.globals.DialogTypeError,error);
    return;             
  });

 
}

SaveVoucher(){    

  if (this.ValidateInputs() == false) {return};    

  let vou  = new ClsVouchers(this.dataService);
  vou.Voucher = this.Voucher;      
  vou.Voucher.VouDetailXML = this.globals.GetVoucherXml(this.VoucherLedgerList);
  
  vou.saveVoucher().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{                              
          this.globals.SnackBar("info", this.Voucher.VouSno == 0 ? "Voucher Created successfully" : "Voucher updated successfully");     
          this.router.navigate(['dashboard/vouchers']);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
      
    })
}

DeleteVoucher(){
  this.globals.QuestionAlert("Are you sure you wanto to delete this Voucher?").subscribe(Response => {      
    if (Response == 1){
      let ar = new ClsVouchers(this.dataService);
      ar.Voucher = this.Voucher;
      ar.deleteVoucher().subscribe(data => {
        if (data.queryStatus == 0)
        {
          this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
          return;
        }
        else{
          this.globals.SnackBar("info","Voucher deleted successfully");       
          this.router.navigate(['dashboard/Vouchers']);   
        }
      })        
    }
  })
}

ValidateInputs(): boolean{                  
  this.Voucher.VouTypeSno      = this.SelectedVTyp.VouTypeSno;  
  this.Voucher.Series          = this.SelectedSeries;  

  console.log(this.VoucherLedgerList);
  

  if (!this.Voucher.Series )  { this.SeriesValid = false; this.globals.SnackBar("error","Invalid Series...");  return false; }  else  {this.SeriesValid = true; }    
  if (!this.Voucher.Vou_No.length )  { this.VoucherNumberValid = false; this.globals.SnackBar("error","Invalid Voucher Number...");  return false; }  else  {this.VoucherNumberValid = true; }    
  if (this.DebitTotal == 0 && this.CreditTotal ==0){
    this.globals.SnackBar("error","No amount is credited or debited for Voucher Posting");
    return false;
  }

  if (this.DebitTotal !== this.CreditTotal){
    this.globals.SnackBar("error","Debit and Credit Amounts do not match");
    return false;
  }
  //if (!this.Voucher.Loan || this.Voucher.Loan.LoanSno == 0 )  { this.LoanValid = false; this.globals.SnackBar("error","Invalid Loan...");  return false; }  else  {this.LoanValid = true; }    
  //if (!this.Voucher.Nett_Payable || this.Voucher.Nett_Payable == 0 )  { this.NettPayableValid = false; this.globals.SnackBar("error","Invalid Nett Payable...");  return false; }  else  {this.NettPayableValid = true; }      
  return true;
} 

getAutoVoucherNumber(){
  let rec = new ClsVouchers(this.dataService);
  rec.getVoucherNumber(this.SelectedSeries.SeriesSno).subscribe(data => {     
    this.Voucher.Vou_No = data.apiData;
  });
}

getVoucherType($event: TypeVoucherTypes){
  this.SelectedVTyp = $event;  
  let ser = new ClsVoucherSeries(this.dataService);
  ser.getVoucherSeries(0,$event.VouTypeSno).subscribe(data=>{
    this.VoucherSeriesList = JSON.parse(data.apiData);
    this.getSeries(this.VoucherSeriesList.filter(ser=>{
      return ser.IsDefault == true;
    })[0]);
  })
}

getSeries($event: TypeVoucherSeries){   
  this.SelectedSeries = $event;
  this.AutoSeriesNo = this.SelectedSeries.Num_Method == 2 ? true : false;
  
  if (this.Voucher.VouSno == 0){
    if ($event.Num_Method !== 0){
      this.getAutoVoucherNumber();
    }    
  }
  
}

getLedger($event: TypeLedger,led: TypeVoucherLedger){
  //this.SelectedLedger[index] = $event;
  led.Ledger = $event;
}

AddLine(){
  this.VoucherLedgerList.push({Type:0, Ledger:{"LedSno":2, "Led_Code":"Cash A/c", "Led_Name":"Cash A/c"}, Debit:0, Credit:0})
}

SetTotals()
{
  this.DebitTotal = 0;
  this.CreditTotal = 0;
  this.VoucherLedgerList.forEach(led=>{
    this.DebitTotal += led.Debit;
    this.CreditTotal += led.Credit;
  })
}

ValidateCrDr(led:TypeVoucherLedger, $event: any){
  this
  if ($event.value == 0)   {
    if (led.Debit == 0 && led.Credit !== 0){
      led.Debit = led.Credit;
      led.Credit = 0;
    }
    else{
      led.Credit= 0;
    }
  }
  else if ($event.value == 1)   {
    if (led.Credit == 0 && led.Debit !== 0){
      led.Credit = led.Debit;
      led.Debit = 0;
    }
    else{
      led.Debit= 0;
    }
  }
}

InsertTemplate(){
  console.log(this.templateId);  
}

CanExit()
  {
    return confirm ("You have unsaved changes. Do you want to exit anyway?")
  }

  GoBack(){
    this.location.back();
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
}

