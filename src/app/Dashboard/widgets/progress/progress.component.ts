
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ProgressbroadcastService } from 'src/app/Services/progressbroadcast.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent { 
  subscriptionName: Subscription;

  constructor(  @Inject(MAT_DIALOG_DATA) public data: any,    
                public dialogRef: MatDialogRef<ProgressComponent>,
                private progressService: ProgressbroadcastService 
             )
             {
                this.subscriptionName = this.progressService.getUpdate().subscribe
                        (message => { //message contains the data sent from service
                            if (message.action === "stop")             
                            {
                              this.dialogRef.close(); 
                            }             
                        });
            }

  ngOnDestroy(){
    this.subscriptionName.unsubscribe();
  }
  
}
