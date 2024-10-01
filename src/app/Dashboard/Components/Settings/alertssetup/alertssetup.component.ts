import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LogarithmicScale } from 'chart.js';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAlertSetup, TypeAlertsSetup, TypeTemplate } from 'src/app/Dashboard/Classes/ClsAlertsSetup';
import { AlerttemplateComponent } from 'src/app/Dashboard/widgets/alerttemplate/alerttemplate.component';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-alertssetup',
  templateUrl: './alertssetup.component.html',
  styleUrls: ['./alertssetup.component.scss']
})
 
@AutoUnsubscribe
export class AlertssetupComponent {
  constructor(private dataService: DataService, private globals: GlobalsService, private dialog: MatDialog){}

  AlertSetup!: TypeAlertsSetup;
  
  ngOnInit(){
    let astp = new ClsAlertSetup(this.dataService);
    astp.getAlertSetup(0).subscribe(data=>{
      console.log(JSON.parse(data.apiData));
      
      this.AlertSetup = JSON.parse(data.apiData)[0];
      
      if (!this.AlertSetup.Alerts_Json){
        this.AlertSetup.Alerts = this.globals.GetStandardAlerts();
      }
      else{
        this.AlertSetup.Alerts = JSON.parse(this.AlertSetup.Alerts_Json)
        console.log(this.AlertSetup.Alerts);
        
      }

      if (this.AlertSetup.Templates_Json){
        this.AlertSetup.Templates = JSON.parse(this.AlertSetup.Templates_Json);
      } else{
        this.AlertSetup.Templates = [];
      }
      
      
      // if (JSON.parse(data.apiData).length < 1 ){
      //   this.AlertSetup = astp.Initialize();
      //   this.AlertSetup.Alerts = this.globals.GetStandardAlerts();
      // }      
    })
  }

  getSelectedSmsTemplate($event: TypeTemplate, alertType: number){    
    this.AlertSetup.Alerts[alertType-1].Sms_Alert_Template = $event;
  }

  getSelectedWaTemplate($event: TypeTemplate, alertType: number){    
    this.AlertSetup.Alerts[alertType-1].WhatsApp_Alert_Template = $event;
  }

  getSelectedEmailTemplate($event: TypeTemplate, alertType: number){    
    this.AlertSetup.Alerts[alertType-1].Email_Alert_Template = $event;
  }

  getSelectedVoiceTemplate($event: TypeTemplate, alertType: number){    
    this.AlertSetup.Alerts[alertType-1].Voice_Alert_Template = $event;
  }

  SaveSetup(){
    let astp = new ClsAlertSetup(this.dataService);    
    this.AlertSetup.AlertXml = this.globals.GetAlertXml(this.AlertSetup.Alerts);

    // console.log(this.AlertSetup.AlertXml);
    // return;
    
    astp.AlertSetup = this.AlertSetup;
    astp.saveAlertSetup().subscribe(data=>{
      if (data.queryStatus ==1){
        this.globals.SnackBar("info","Settings updated successfully");
      }
      else{
        this.globals.ShowAlert(3, data.apiData);
      }
      
    })
  }

  AddNewTemplate(){
    this.OpenTemplate({"TempSno":0,"Create_Date":0,"SetupSno":this.AlertSetup.SetupSno,"Template_Id":'dfdfd2323', "Template_Name":'',"Template_Text":'', "Name":'', "Details":''})
  }

  OpenTemplate(temp:TypeTemplate){    
    const dialogRef = this.dialog.open(AlerttemplateComponent, 
      { 
        height:"100%",
        position:{"right":"0","top":"0" },
        data: temp ,
      });
      
      dialogRef.disableClose = true;
  
      dialogRef.afterClosed().subscribe((result: TypeTemplate) => {        
        if (result){  
          let astp = new ClsAlertSetup(this.dataService);
          astp.saveTemplate(result).subscribe(data=>{            
            if (data.queryStatus == 1){
              result.TempSno = data.RetSno;
              this.globals.SnackBar("info","Template Added successfully");                          
              this.AlertSetup.Templates.push(result);
            }
            else{
              this.globals.SnackBar("error","Error adding Template");            
            }            
          })
            
          
        }      
      }); 
  }

  RemoveTemplate(temp:TypeTemplate, index: number){
    this.AlertSetup.Templates.splice(index,1)
  }

  // Test(){
  //   let searchphrase = 'அன்பார்ந்த பிரியா பைனான்ஸ் வாடிக்கையாளரே, உங்கள் தங்க நகை கடனுக்கான வட்டி ரூ {#var#} தேதி {#var#} வரை உள்ளது தயவு செய்து வட்டியை செலுத்தவும். உங்கள் நகை கடன் எண் {#var#} மேலும் விவரங்களுக்கு எங்கள் கிளையை அணுகவும். Contact 9786225322 PRIYFN';
  //   let startval =  '{';
  //   let endval = '}';
  //   let startindex = searchphrase.indexOf(startval)+1;
  //   let endindex = searchphrase.indexOf(endval, startindex,);
  //   let result = searchphrase.substring(startindex, endindex)
  //   console.log(result);    
  // }
}
