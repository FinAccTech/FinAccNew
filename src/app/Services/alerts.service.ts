import { Injectable } from '@angular/core';
import { GlobalsService } from './globals.service';
import { DataService } from './data.service';
import { ClsAlertSetup, TypeAlert, TypeAlertHistory, TypeAlertsSetup, TypeTemplate } from '../Dashboard/Classes/ClsAlertsSetup';
import { TypeLoan } from '../Dashboard/Classes/ClsLoan';
import { TypeReceipt } from '../Dashboard/Classes/ClsReceipts';
import { TypeRedemption } from '../Dashboard/Classes/ClsRedemptions';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';

@Injectable({
  providedIn: 'root'
})
@AutoUnsubscribe
export class AlertsService {
  constructor(private globals: GlobalsService, private dataService: DataService) { }
  alertSetup!: TypeAlertsSetup;

  CreateAlert (Alert_Type: number, Trans: any, Trans_Type: number){
    let astp = new ClsAlertSetup(this.dataService);

    astp.getAlertSetup(0).subscribe(data=>{
      this.alertSetup = JSON.parse(data.apiData)[0];
      
      let alerts: TypeAlert[] =  JSON.parse (this.alertSetup.Alerts_Json);
      let FieldSet = this.GetAlertFields(Trans,Trans_Type);

      if (alerts[Alert_Type-1].Sms_Alert_Template.TempSno !==0){        
        let alert         = astp.IntializeAlertHistory();
        let AlertText = this.FormAlert(alerts[Alert_Type-1].Sms_Alert_Template, FieldSet);
        alert.Alert_Destination = FieldSet.Mobile;
        alert.Alert_Mode  = this.globals.AlertModeSms;
        alert.Alert_Text  = AlertText;
        alert.Alert_Type  = Alert_Type;
        alert.Alert_Url   = this.FormUrl( this.globals.AlertModeSms, AlertText,FieldSet);
        alert.TrackSno    = FieldSet.TrackSno;
        
        astp.insertAlert(alert).subscribe(data=>{
          console.log(data);          
        })
      }
    })
    
  }

  FormAlert(temp: TypeTemplate, FieldSet: TypeAlertFields): string{
    
    let AlertText: string = temp.Template_Text!;
    
    AlertText = AlertText.replaceAll('{#TrackSno#}',      FieldSet.TrackSno.toString());
    AlertText = AlertText.replaceAll('{#Trans_No#}',      FieldSet.Trans_No);
    AlertText = AlertText.replaceAll('{#Trans_Date#}',    FieldSet.Trans_Date);
    AlertText = AlertText.replaceAll('{#Party_Code#}',    FieldSet.Party_Code);
    AlertText = AlertText.replaceAll('{#Party_Name#}',    FieldSet.Party_Name);
    AlertText = AlertText.replaceAll('{#Verify_Code#}',   FieldSet.Verify_Code);
    AlertText = AlertText.replaceAll('{#Mature_Date#}',   FieldSet.Mature_Date);
    AlertText = AlertText.replaceAll('{#Due_Date#}',      FieldSet.Due_Date);
    AlertText = AlertText.replaceAll('{#Mobile#}',        FieldSet.Mobile);
    AlertText = AlertText.replaceAll('{#Principal#}',     FieldSet.Principal.toString());
    AlertText = AlertText.replaceAll('{#Interest#}',      FieldSet.Interest.toString());
    AlertText = AlertText.replaceAll('{#TotGrossWt#}',    FieldSet.TotGrossWt.toString());
    AlertText = AlertText.replaceAll('{#TotNettWt#}',     FieldSet.TotNettWt.toString());
    AlertText = AlertText.replaceAll('{#Nett_Payable#}',  FieldSet.Nett_Payable.toString());
    return AlertText;
  }

  FormUrl(Alert_Mode: number, Message: string, FieldSet: TypeAlertFields): string{
    let url: string = '';
    switch (Alert_Mode) {
      case this.globals.AlertModeSms:
        url = this.alertSetup.Sms_Api;
        url = url.replaceAll('{#Mobile#}',FieldSet.Mobile);
        url = url.replaceAll('{#Message#}',Message);
        url = url.replaceAll('{#UserName#}',this.alertSetup.Sms_UserName);
        url = url.replaceAll('{#Password#}',this.alertSetup.Sms_Password);
        url = url.replaceAll('{#Peid#}',this.alertSetup.Sms_Peid);
        url = url.replaceAll('{#SenderId#}',this.alertSetup.Sms_Sender_Id);
        break;
      case this.globals.AlertModeSms:
        url = this.alertSetup.WhatsApp_Instance;
        url = url.replaceAll('{#Instance#}',"Instance");
        break;
    }
    
    return url;
  }

  GetAlertFields(trans: any, trans_type: number){
    let AlertFields = this.InitializeAlertFields();
    switch (trans_type) {
      case 1:
        AlertFields.TrackSno = trans.LoanSno;
        AlertFields.Trans_No = trans.Loan_No;
        AlertFields.Trans_Date = this.globals.IntToDateString(trans.Loan_Date);
        AlertFields.Party_Code = trans.Customer.Party_Code;
        AlertFields.Party_Name = trans.Customer.Party_Name;
        //AlertFields.Verify_Code = trans.LoanSno;
        AlertFields.Mature_Date = this.globals.IntToDateString(trans.Mature_Date);
        //AlertFields.Due_Date = trans.LoanSno;;
        AlertFields.Mobile = trans.Customer.Mobile;
        AlertFields.Principal = trans.Principal;
        AlertFields.Interest = trans.AdvIntAmt;
        AlertFields.TotGrossWt = trans.TotGrossWt;
        AlertFields.TotNettWt = trans.TotNettWt;
        AlertFields.Nett_Payable = trans.Nett_Payable;
        break;    
      case 2:
        AlertFields.TrackSno = trans.ReceiptSno;
        AlertFields.Trans_No = trans.Receipt_No;
        AlertFields.Trans_Date = this.globals.IntToDateString(trans.Receipt_Date);
        AlertFields.Party_Code = trans.Customer.Party_Code;
        AlertFields.Party_Name = trans.Customer.Party_Name;
        //AlertFields.Verify_Code = trans.LoanSno;
        //AlertFields.Mature_Date = trans.Mature_Date;
        //AlertFields.Due_Date = trans.LoanSno;;
        AlertFields.Mobile = trans.Customer.Mobile;
        AlertFields.Principal = trans.Rec_Principal;
        AlertFields.Interest = trans.Rec_Interest;
        //AlertFields.TotGrossWt = trans.TotGrossWt;
        //AlertFields.TotNettWt = trans.TotNettWt;
        AlertFields.Nett_Payable = trans.Nett_Payable;
        break;    
      case 3:
          AlertFields.TrackSno = trans.RedemptionSno;
          AlertFields.Trans_No = trans.Redemption_No;
          AlertFields.Trans_Date = this.globals.IntToDateString(trans.Redemption_Date);
          AlertFields.Party_Code = trans.Customer.Party_Code;
          AlertFields.Party_Name = trans.Customer.Party_Name;
          //AlertFields.Verify_Code = trans.LoanSno;
          //AlertFields.Mature_Date = trans.Mature_Date;
          //AlertFields.Due_Date = trans.LoanSno;;
          AlertFields.Mobile = trans.Customer.Mobile;
          AlertFields.Principal = trans.Rec_Principal;
          AlertFields.Interest = trans.Rec_Interest;
          //AlertFields.TotGrossWt = trans.TotGrossWt;
          //AlertFields.TotNettWt = trans.TotNettWt;
          AlertFields.Nett_Payable = trans.Nett_Payable;
          break;    
    }
    return AlertFields;
  }

  InitializeAlertFields(): TypeAlertFields{
    let AlertFields: TypeAlertFields = {
      TrackSno: 0,
      Trans_No: "",
      Trans_Date: "",
      Party_Code: "",
      Party_Name: "",
      Verify_Code: "",
      Mature_Date: "",
      Due_Date: "",
      Mobile: "",
      Principal: 0,
      Interest: 0,
      TotGrossWt: "",
      TotNettWt: "",
      Nett_Payable: 0,
    }
    return AlertFields
  }
}

interface TypeAlertFields {
  TrackSno: number;
  Trans_No: string;
  Trans_Date: string;
  Party_Code: string;
  Party_Name: string;
  Verify_Code: string;  
  Mature_Date: string;
  Due_Date: string;
  Mobile: string;
  Principal: number;
  Interest: number;
  TotGrossWt: string;
  TotNettWt: string;
  Nett_Payable: number;
}