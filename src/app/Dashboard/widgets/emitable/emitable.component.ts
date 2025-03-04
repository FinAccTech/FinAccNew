import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-emitable',
  standalone: true,
  imports: [MatDialogClose],
  templateUrl: './emitable.component.html',
  styleUrl: './emitable.component.scss'
})

@AutoUnsubscribe
export class EmitableComponent {

  constructor(
      public dialogRef: MatDialogRef<EmitableComponent>,
      private globals: GlobalsService,
      @Inject(MAT_DIALOG_DATA) public data: any,              
    )  {}


}
