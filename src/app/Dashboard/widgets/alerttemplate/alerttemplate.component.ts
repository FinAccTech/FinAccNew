import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GlobalsService } from 'src/app/Services/globals.service';
import { TypeTemplate } from '../../Classes/ClsAlertsSetup';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-alerttemplate',
  templateUrl: './alerttemplate.component.html',
  styleUrls: ['./alerttemplate.component.scss']
})
@AutoUnsubscribe 
export class AlerttemplateComponent {
  
  constructor(
    public dialogRef: MatDialogRef<AlerttemplateComponent>,
    private globals: GlobalsService,
    @Inject(MAT_DIALOG_DATA) public data: TypeTemplate,          
  )  {}

  Create_Date: string = "";
  ngOnInit(){        
    this.Create_Date = this.globals.IntToDateString(this.data.Create_Date);
  }

  Submit(){       
    this.data.Name = this.data.Template_Name;
    this.data.Details = this.data.Template_Id;    
    this.CloseDialog();
  }

  CloseDialog(){
    this.dialogRef.close(this.data);
  }

}
