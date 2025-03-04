import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeBusinessRegisterDaily } from '../../Classes/ClsReports';

@AutoUnsubscribe
@Component({
  selector: 'app-daily-register',  
  templateUrl: './daily-register.component.html',
  styleUrl: './daily-register.component.scss'
})


export class DailyRegisterComponent {
constructor(
    public dialogRef: MatDialogRef<DailyRegisterComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: TypeBusinessRegisterDaily[],            
  )  {}

  ngOnInit(){
    console.log(this.data);
    
  }
}
