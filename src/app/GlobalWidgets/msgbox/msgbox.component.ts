
import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { GlobalsService } from 'src/app/Services/globals.service';

export interface DialogData {
  DialogType: number; // 0-Progress 1-Information 2-Question 3- Error
  Message: string;    
}

@Component({
  selector: 'app-msgbox',
  templateUrl: './msgbox.component.html',
  styleUrls: ['./msgbox.component.scss']
})

@AutoUnsubscribe
export class MsgboxComponent implements OnInit {

  appName: string = "";
  logoPath: string = "";

  constructor(
    public dialogRef: MatDialogRef<MsgboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private globals: GlobalsService
  ) {}

  ngOnInit(): void {
    this.appName = this.globals.AppName;
    this.logoPath = this.globals.AppLogoPath;
    this.dialogRef.updateSize("30vw"); 
  }
 
  onNoClick(): void {
    this.dialogRef.close();
  }
  
  CloseDialog (action: number)
  {
    this.dialogRef.close(action);
  }

  @HostListener("keydown.esc") 
  public onEsc() {
    this.dialogRef.close();
  }
}
