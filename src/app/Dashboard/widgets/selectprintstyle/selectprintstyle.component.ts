import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-selectprintstyle',
  standalone: true,
  imports: [MatDialogClose],
  templateUrl: './selectprintstyle.component.html',
  styleUrl: './selectprintstyle.component.scss'
})
export class SelectprintstyleComponent {
  constructor(
    public dialogRef: MatDialogRef<SelectprintstyleComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: any,            
  )  {}

  StyleList: string[] = [];

  ngOnInit(){
    this.StyleList = this.data.result;    
  }

  SelectStyle(style: string){
    style = style.trim();
    this.dialogRef.close(style);
  }
  closeDialog(){
    this.dialogRef.close();
  }
}
