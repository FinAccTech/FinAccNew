import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsAlertSetup, TypeAlertsSetup, TypeTemplate } from '../../Classes/ClsAlertsSetup';
import { DataService } from 'src/app/Services/data.service';

@Component({
  selector: 'app-alertconfirmation',
  templateUrl: './alertconfirmation.component.html',
  styleUrls: ['./alertconfirmation.component.scss']
})

export class AlertconfirmationComponent {
  constructor(private dataService: DataService, public dialogRef: MatDialogRef<AlertconfirmationComponent>,
    private globals: GlobalsService,
    @Inject(MAT_DIALOG_DATA) public data: any){}
  
    TemplatesList: TypeTemplate[] = [];
    SelectedTemplate: TypeTemplate = { TempSno:0 };
    SelectedAlertMode: number = 1;
    Auction_Date: string = "";

    ngOnInit(){
      let astp = new ClsAlertSetup(this.dataService);
      astp.getAlertSetup(0).subscribe(data=>{
        this.TemplatesList =  JSON.parse (JSON.parse (data.apiData)[0].Templates_Json);        
      })
    } 
    
    getTemplate($event: TypeTemplate){
      this.SelectedTemplate = $event;
    }

    Submit(){
      let aStp = new ClsAlertSetup(this.dataService);
      aStp.getAlertSetup(0).subscribe(data =>{
      let StpData: TypeAlertsSetup[] = JSON.parse(data.apiData);        

      if (!StpData) { this.globals.SnackBar("error", "Alert Setup is not complete or invalid in Alert Setup");  return}
        if (this.SelectedAlertMode == this.globals.AlertModeSms){
          if (  (StpData[0].Sms_Api == '' || StpData[0].Sms_Sender_Id == '' || StpData[0].Sms_Username == '' || StpData[0].Sms_Password == ''))
                {
            this.globals.SnackBar("error", "Sms Api Setup is not complete or invalid in Alert Setup");
            return;
          }
        }
        if (this.SelectedAlertMode == this.globals.AlertModeWhatsApp){
                    
          if (!StpData[0].WhatsApp_Instance || StpData[0].WhatsApp_Instance == ''){
            this.globals.SnackBar("error", "WhatsApp Api Setup is not complete or invalid in Alert Setup");
            return;
          }
        }
        this.dialogRef.close({ "TempSno": this.SelectedTemplate.TempSno, "Alert_Mode" : this.SelectedAlertMode, "Auction_Date": this.Auction_Date });
      });

      
    }
}
