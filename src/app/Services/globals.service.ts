import { Injectable} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, of } from 'rxjs';
import { MsgboxComponent } from '../GlobalWidgets/msgbox/msgbox.component';
import { SnackbarComponent } from '../GlobalWidgets/snackbar/snackbar.component';
import { TypeAppSetup } from '../Dashboard/Classes/ClsAppSetup';
import { TypeLedger } from '../Dashboard/Classes/ClsLedgers';
import { TypeLoan } from '../Dashboard/Classes/ClsLoan';
import { TypeReceipt } from '../Dashboard/Classes/ClsReceipts';
import { TypeRedemption } from '../Dashboard/Classes/ClsRedemptions';
import { TypeVoucherLedger } from '../Dashboard/Classes/ClsVouchers';
import { AuthService } from './auth.service';
import { TypeUserRights } from '../Dashboard/Classes/ClsUsers';
import { TypePayMode } from '../Dashboard/Types/TypePayMode';
import { TypeAlert } from '../Dashboard/Classes/ClsAlertsSetup';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';


@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class GlobalsService 
{
  AppName: string = "FinAcc";
  AppLogoPath: string = "assets/images/finacclogo.png";
  
  constructor(private dialog: MatDialog){      
  }
  
  AppSetup(): TypeAppSetup {
    return JSON.parse (sessionStorage.getItem("sessionTransactionSetup")!)[0];
  }

    //Party Types
    PartyTypCustomers:   number = 1;
    PartyTypSuppliers:   number = 2;
    PartyTypBorrowers:   number = 3;

    //Voucher Types    
    VTypOpening:          number = 1;
    VTypReceipt:          number = 2;
    VTypPayment:          number = 3;
    VTypJournal:          number = 4;
    VTypContra:           number = 5;
    VTypMemorandum:       number = 6;
    VTypCreditNote:       number = 7;
    VTypDebitNote:        number = 8;
    VTypChequeRETURN:     number = 9;
    VTypSales:            number = 10;
    VTypPurchase:         number = 11;
    VTypLoanPayment:      number = 12;
    VTypLoanReceipt:      number = 13;
    VTypLoanRedemption:   number = 14;
    VTypAuctionEntry:     number = 15;
    VTypTransfer:         number = 16;
    VTypRePledge:         number = 17;
    VTypRepledgePayment:  number = 18;
    VTypRepledgeClosure:  number = 19;
    VTypReLoan:           number = 20;

    //Dialog Types    
    DialogTypeProgress  = 0; 
    DialogTypeInfo      = 1;
    DialogTypeQuestion  = 2;
    DialogTypeError     = 3;
    
    //General Status Types    
    StatusAll: number = 0;
    StatusFalse: number = 1;    
    StatusTrue: number  = 2;
    
    // Loan Status Types 
    LoanStatusAll = 0;
    LoanStatusOpen = 1;
    LoanStatusClosed = 2;
    LoanStatusMatured = 3;
    LoanStatusAuctioned = 4;
    
    // Repledge Status Types 
    RepledgeStatusAll = 0;
    RepledgeStatusOpen = 1;
    RepledgeStatusClosed = 2;
    RepledgeStatusMatured = 3;
    RepledgeStatusAuctioned = 4;

    ApprovalStatusAll = 0;
    ApprovalStatusUnApproved = 1;
    ApprovalStatusApproved = 2;

    CancelStatusAll = 0;
    CancelStatusNotCancelled = 1;
    CancelStatusCancelled = 2

    OpenStatusAllLoans = 0;
    OpenStatusOpeningLoan = 1 ;
    OpenStatusNewLoan = 2
    
    // Standard and Constant Ledger Snos
    StdLedgerCashAc = 2;
    StdLedgerProfitandLoss = 3;	
    StdLedgerInterestIncome = 4;
    StdLedgerDocumentIncome = 5;
    StdLedgerDefaultIncome = 6;
    StdLedgerAddLess = 7;
    StdLedgerOtherIncome = 8;
    StdLedgerShortageExcess = 9;
    StdLedgerInterestPaid = 10;
    StdLedgerBankCharges = 11;

    //Form/Component Ids
     FormIdLoans = 1;
     FormIdReceipts = 2;
     FormIdRedemptions = 3;
     FormIdAuctions = 4;
     FormIdReLoan = 5;
     FormIdOpeningLoan = 6;
     FormIdOpeningReceipt = 7;

     FormIdItemGroups = 8;
     FormIdItems = 9;
     FormIdCustomers  = 10;
     FormIdSuppliers = 11;
     FormIdPurity = 12;
     FormIdAreas = 13;
     FormIdSchemes = 14;
     FormIdLocations = 15;

     FormIdRepledge = 16;
     FormIdRpPayments = 17;
     FormIdRpRedemption = 18;

     FormIdLoanSummary = 19;          
     FormIdPartyHistory = 20;
     FormIdLoanHistory = 21;
     FormIdAuctionHistory =22;
     FormIdPendingReport = 23;

     FormIdLedgerGroups = 24;
     FormIdLedgers = 25;
     FormIdVouchers = 26;

     FormIdDayBook = 27;
     FormIdGroupSummary = 28;
     FormIdTrialBalance = 29;
     FormIdProfitandLoss = 30;
     FormIdBalanceSheet = 31;

     FormIdDayHistory = 32;
     FormIdSupplierHistory = 33;
     FormIdAgeAnalysis = 34;

     
    //UserRight Types
      UserRightView       = 1;
      UserRightCreate     = 2;
      UserRightEdit       = 3;
      UserRightDelete     = 4;
      UserRightPrint      = 5;;  
      UserRightDateAccess = 6;
      UserRightSearchAccess = 7;
    
    //Alert Types
      AlertTypeNewLoan = 1;
      AlertTypeNewReceipt = 2;
      AlertTypeNewRedemption = 3;
      AlertTypeOtpValidation = 4;
      AlertTypeIntReminder = 5;

      // Alert Modes
      AlertModeSms = 1;
      AlertModeWhatsApp = 2;
      AlertModeEmail = 3;
      AlertModeVoice = 4;

      // Alert Trans Type
      AlertTransTypeLoan = 1;
      AlertTransTypeReceipt = 2;
      AlertTransTypeRedemption = 3;
      AlertTransTypeCustomer = 4;
      
  DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }
  
  IntToDate(inputDate: any)
  {
    let argDate = inputDate.toString();
    let year = argDate.substring(0,4);
    let month = argDate.substring(4,6);
    let day = argDate.substring(6,9);
    let newDate = year + "/" + month + "/" + day;
    return new Date(newDate);
  }

  IntToDateString(inputDate: any)
  {
    let argDate = inputDate.toString();
    let year = argDate.substring(0,4);
    let month = argDate.substring(4,6);
    let day = argDate.substring(6,9);
    let newDate = day + "/" + month + "/" + year;
    return newDate;
  }

  ShowAlert(AlertType: number, Message: string ){
    // DialogType: number; // 0-Progress 1-Information 2-Question 3- Error
    const dialogRef = this.dialog.open(MsgboxComponent,
      {
        data: {"DialogType": AlertType, "Message": Message},   
      } 
      );  
      dialogRef.disableClose = true;
  }

  QuestionAlert(Message: string): Observable<number> {
    var subject = new Subject<number>();
    const dialogRef = this.dialog.open(MsgboxComponent,
      {
        data: {"DialogType": this.DialogTypeQuestion, "Message": Message},   
      } 
      );  
      dialogRef.disableClose = true;      

      dialogRef.afterClosed().subscribe(result => {        
          subject.next(result);
      });        
      return subject.asObservable();
  }

  SnackBar(Type: string, Msg: string): void {
    // Types : "info" ,"error"
    const timeout = 2000;
    const dialogRef = this.dialog.open(SnackbarComponent, {      
      minWidth:'350px',
      height: '60px',
      position: {top: '80px'} ,
      data: {"type":Type, "message": Msg},
      backdropClass: "none",   
      enterAnimationDuration: 500,
      exitAnimationDuration: 500       
    });

    dialogRef.afterOpened().subscribe(_ => {
      setTimeout(() => {
         dialogRef.close();
      }, timeout)
    })
  }

  GetLoanVoucherXml(Loan: TypeLoan, StdLedgerList: TypeLedger[]): string{
  
    	let StrXml = '';
    StrXml = '<ROOT>';
    StrXml += '<Voucher>';
					
    StrXml += '<Voucher_Details ';
      StrXml += 'LedSno="' + Loan.Customer.LedSno + '" ' ;
      StrXml += 'Debit="' + Loan.Principal + '" ' ;
      StrXml += 'Credit="0" ' ;
    StrXml += '>';
    StrXml += '</Voucher_Details> ';

    if (Loan.IsOpen == 2){
      if (Loan.AdvIntAmt > 0){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerInterestIncome })[0].LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + Loan.AdvIntAmt + '" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      if (Loan.DocChargesAmt > 0){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerDocumentIncome })[0].LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + Loan.DocChargesAmt + '" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      Loan.PaymentMode.forEach((mode: any)=>{
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + mode.LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + mode.Amount + '" ' ;	
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      })							
    }		
      StrXml += '</Voucher>';
      StrXml += '</ROOT>';			
		  return StrXml
	}

  GetReceiptVoucherXml(Receipt: TypeReceipt, StdLedgerList: TypeLedger[]): string{
    //console.log(Receipt);
    // console.log(Receipt.Loan);
    
		let StrXml = '';
    StrXml = '<ROOT>';
    StrXml += '<Voucher>';
					
    if (Receipt.Rec_Principal > 0)
    {
      StrXml += '<Voucher_Details ';
        StrXml += 'LedSno="' + Receipt.Loan.Customer.LedSno + '" ' ;
        StrXml += 'Debit="0" ' ;
        StrXml += 'Credit="'+ Receipt.Rec_Principal +'" ' ;
        StrXml += '>';
      StrXml += '</Voucher_Details> ';
    }
    
    if (Receipt.IsOpen == 2){
      if (Receipt.Rec_Interest > 0){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerInterestIncome })[0].LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + Receipt.Rec_Interest + '" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      if (Receipt.Rec_Add_Less > 0 ){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerAddLess })[0].LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + Math.abs (Receipt.Rec_Add_Less) + '" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      if (Receipt.Rec_Add_Less < 0 ){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerAddLess })[0].LedSno + '" ' ;									
          StrXml += 'Debit="' + Math.abs (Receipt.Rec_Add_Less) + '" ' ;
          StrXml += 'Credit="0" ' ;
        StrXml += '>'; 
        StrXml += '</Voucher_Details> ';
      }

      if (Receipt.Rec_Default_Amt > 0 ){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerDefaultIncome })[0].LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + Receipt.Rec_Default_Amt + '" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      if (Receipt.Rec_Other_Debits > 0 ){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerOtherIncome })[0].LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + Receipt.Rec_Other_Debits + '" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      if (Receipt.Rec_Other_Debits > 0 ){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerOtherIncome })[0].LedSno + '" ' ;									
          StrXml += 'Debit="' + Receipt.Rec_Other_Credits + '" ' ;
          StrXml += 'Credit="0" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      Receipt.PaymentMode.forEach((mode: any)=>{
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + mode.LedSno + '" ' ;									
          StrXml += 'Debit="' + mode.Amount + '" ' ;
          StrXml += 'Credit="0" ' ;	
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      })							
    }		
      StrXml += '</Voucher>';
      StrXml += '</ROOT>';			
		  return StrXml
	}

  GetRedemptionVoucherXml(Red: TypeRedemption, StdLedgerList: TypeLedger[]): string{
		let StrXml = '';
    StrXml = '<ROOT>';
    StrXml += '<Voucher>';
					
    if (Red.Rec_Principal > 0)
    {
      StrXml += '<Voucher_Details ';
        StrXml += 'LedSno="' + Red.Loan.Customer.LedSno + '" ' ;
        StrXml += 'Debit="0" ' ;
        StrXml += 'Credit="'+ Red.Rec_Principal +'" ' ;
        StrXml += '>';
      StrXml += '</Voucher_Details> ';
    }
    
    
      if (Red.Rec_Interest > 0){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerInterestIncome })[0].LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + Red.Rec_Interest + '" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      if (Red.Rec_Add_Less > 0 ){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerAddLess })[0].LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + Math.abs (Red.Rec_Add_Less) + '" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      if (Red.Rec_Add_Less < 0 ){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerAddLess })[0].LedSno + '" ' ;									
          StrXml += 'Debit="' + Math.abs (Red.Rec_Add_Less) + '" ' ;
          StrXml += 'Credit="0" ' ;
        StrXml += '>'; 
        StrXml += '</Voucher_Details> ';
      }

      if (Red.Rec_Default_Amt > 0 ){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerDefaultIncome })[0].LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + Red.Rec_Default_Amt + '" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      if (Red.Rec_Other_Debits > 0 ){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerOtherIncome })[0].LedSno + '" ' ;									
          StrXml += 'Debit="0" ' ;
          StrXml += 'Credit="' + Red.Rec_Other_Debits + '" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      if (Red.Rec_Other_Debits > 0 ){
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + StdLedgerList.filter((led)=>{ return led.Std_No == this.StdLedgerOtherIncome })[0].LedSno + '" ' ;									
          StrXml += 'Debit="' + Red.Rec_Other_Credits + '" ' ;
          StrXml += 'Credit="0" ' ;
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      }

      Red.PaymentMode.forEach((mode: any)=>{
        StrXml += '<Voucher_Details ';
          StrXml += 'LedSno="' + mode.LedSno + '" ' ;									
          StrXml += 'Debit="' + mode.Amount + '" ' ;
          StrXml += 'Credit="0" ' ;	
        StrXml += '>';
        StrXml += '</Voucher_Details> ';
      })							
    
      StrXml += '</Voucher>';
      StrXml += '</ROOT>';			
		  return StrXml
	}

  GetVoucherXml(vou: TypeVoucherLedger[]):string{
    let StrXml = '';
    StrXml = '<ROOT>';
    StrXml += '<Voucher>';
					
    vou.forEach(led=>{
      StrXml += '<Voucher_Details ';
        StrXml += 'LedSno="' + led.Ledger.LedSno + '" ' ;
        StrXml += 'Debit="' + led.Debit + '" ' ;
        StrXml += 'Credit="'+  led.Credit +'" ' ;
        StrXml += '>';
      StrXml += '</Voucher_Details> ';
    })    

      StrXml += '</Voucher>';
      StrXml += '</ROOT>';			
		  return StrXml
  }

  GetPaymentModeXml(Pmode: TypePayMode[], VouTypeSno: number):string{    
   let StrXml = "";
    Pmode.forEach((mode: any)=>{
      StrXml += '<Voucher_Details ';
        StrXml += 'LedSno="' + mode.Ledger.LedSno + '" ' ;	
        switch (VouTypeSno) {
          case this.VTypLoanPayment:
              StrXml += 'Debit="0" ' ;
              StrXml += 'Credit="' + mode.Amount + '" ' ;	    
              break;
          case this.VTypLoanReceipt:
              StrXml += 'Debit="' + mode.Amount + '" ' ;
              StrXml += 'Credit="0" ' ;	    
              break;
          case this.VTypLoanRedemption:
              StrXml += 'Debit="' + mode.Amount + '" ' ;
              StrXml += 'Credit="0" ' ;	    
              break;
          case this.VTypAuctionEntry:
              StrXml += 'Debit="0" ' ;	    
              StrXml += 'Credit="' + mode.Amount + '" ' ;              
              break;
          case this.VTypRePledge:
              StrXml += 'Debit="' + mode.Amount + '" ' ;
              StrXml += 'Credit="0" ' ;	    
              break;
          case this.VTypRepledgePayment:
              StrXml += 'Debit="0" ' ;
              StrXml += 'Credit="' + mode.Amount + '" ' ;	    
              break;
          case this.VTypRepledgeClosure:
              StrXml += 'Debit="0" ' ;
              StrXml += 'Credit="' + mode.Amount + '" ' ;	    
              break;
        }								
        
      StrXml += '>';
      StrXml += '</Voucher_Details> ';
    })
    /*	    
    StrXml += "</Voucher>";
    StrXml += "</ROOT>"; */
    return StrXml;		
  }

  GetAlertXml(Alerts: TypeAlert[]):string{    
    console.log(Alerts);
    
    let StrXml = '<ROOT>';
    StrXml += '<Alert>';
     Alerts.forEach((alt: TypeAlert)=>{
        StrXml += '<Alert_Details ';
        StrXml += 'Alert_Type="' + alt.Alert_Type + '" ' ;	
        StrXml += 'Alert_Caption="' + alt.Alert_Caption + '" ' ;	
        StrXml += 'Sms_Alert_TempSno="' + (alt.Sms_Alert_Template ? alt.Sms_Alert_Template.TempSno : 0) + '" ' ;	
        StrXml += 'WhatsApp_Alert_TempSno="' + (alt.WhatsApp_Alert_Template ? alt.WhatsApp_Alert_Template.TempSno :0) + '" ' ;	
        StrXml += 'Email_Alert_TempSno="' + (alt.Email_Alert_Template ? alt.Email_Alert_Template.TempSno : 0) + '" ' ;	
        StrXml += 'Voice_Alert_TempSno="' + (alt.Voice_Alert_Template ? alt.Voice_Alert_Template.TempSno : 0) + '" ' ;	
       StrXml += '>';
       StrXml += '</Alert_Details> ';
     })     
     StrXml += "</Alert>";
     StrXml += "</ROOT>"; 
     return StrXml;		
   }
  /* ------------------------------------------For Opening Dialog with Animation----------------------------------------------------
    OpenDialog(enterAnimationDuration: string, exitAnimationDuration: string, DialogType: number, DialogText: string): void {
    this.globals.OpenDialog('500ms', '500ms',3,""); 
  ----------------------------------------------------------------------------------------------------------------------------------*/
GetUserRight(UserRights: TypeUserRights[], FormSno: number, RightType: number): boolean{
  
  if (UserRights.length < 1 ) { return true}
  let FormRight = false;
  switch (RightType) {
    case this.UserRightView:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].View_Right;
      break;
    case this.UserRightCreate:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Create_Right;
      break;
    case this.UserRightEdit:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Edit_Right;
      break;
    case this.UserRightDelete:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Delete_Right;
      break;
    case this.UserRightPrint:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Print_Right;
      break;
    case this.UserRightDateAccess:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Date_Access;
      break;
    case this.UserRightSearchAccess:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Search_Access;
      break;
  }
   return FormRight;
}  

GetMonthName(Month: number, ReturnAlias: boolean):string{
  let MonthName = "";
  switch (Month) {
    case 1:
      MonthName =  ReturnAlias ? "Jan" : "January";
      break;  
    case 2:
      MonthName =  ReturnAlias ? "Feb" : "February";
      break;  
    case 3:
      MonthName =  ReturnAlias ? "Mar" : "March";
      break;  
    case 4:
      MonthName =  ReturnAlias ? "Apr" : "April";
      break;  
    case 5:
      MonthName =  ReturnAlias ? "May" : "May";
      break;  
    case 6:
      MonthName =  ReturnAlias ? "Jun" : "June";
      break;  
    case 7:
      MonthName =  ReturnAlias ? "Jul" : "July";
      break;  
    case 8:
      MonthName =  ReturnAlias ? "Aug" : "August";
      break;  
    case 9:
      MonthName =  ReturnAlias ? "Sep" : "September";
      break;  
    case 10:
      MonthName =  ReturnAlias ? "Oct" : "October";
      break;  
    case 11:
      MonthName =  ReturnAlias ? "Nov" : "November";
      break;  
    case 12:
      MonthName =  ReturnAlias ? "Dec" : "December";
      break;  
  }
  return MonthName;
}

GetStandardAlerts(): TypeAlert[] {
  let alerts: TypeAlert[] = [
    { "AlertSno" :0, "SetupSno" :0, "Alert_Type": this.AlertTypeNewLoan, "Alert_Caption" :"Send Alert on New Loan", "Sms_Alert_Template":{"TempSno":0}, "WhatsApp_Alert_Template":{"TempSno":0}, "Email_Alert_Template":{"TempSno":0}, "Voice_Alert_Template":{"TempSno":0} },
    { "AlertSno" :0, "SetupSno" :0, "Alert_Type": this.AlertTypeNewReceipt, "Alert_Caption" :"Send Alert on New Receipt", "Sms_Alert_Template":{"TempSno":0}, "WhatsApp_Alert_Template":{"TempSno":0}, "Email_Alert_Template":{"TempSno":0}, "Voice_Alert_Template":{"TempSno":0} },
    { "AlertSno" :0, "SetupSno" :0, "Alert_Type": this.AlertTypeNewRedemption, "Alert_Caption" :"Send Alert on New Redemption", "Sms_Alert_Template":{"TempSno":0}, "WhatsApp_Alert_Template":{"TempSno":0}, "Email_Alert_Template":{"TempSno":0}, "Voice_Alert_Template":{"TempSno":0} },
    { "AlertSno" :0, "SetupSno" :0, "Alert_Type": this.AlertTypeOtpValidation, "Alert_Caption" :"Enable OTP Validation of Customer Creation", "Sms_Alert_Template":{"TempSno":0}, "WhatsApp_Alert_Template":{"TempSno":0}, "Email_Alert_Template":{"TempSno":0}, "Voice_Alert_Template":{"TempSno":0} },    
  ]
  return alerts
}
}
