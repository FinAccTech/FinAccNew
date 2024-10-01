import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-slabs',
  templateUrl: './slabs.component.html',
  styleUrls: ['./slabs.component.scss']
})

@AutoUnsubscribe
export class SlabsComponent {
  SlabList: any[] = [];
  SlbType: number = 0;
  SlbTypeCaption: string = "";
  SlabErrors: string = "";

  constructor(    
    public dialogRef: MatDialogRef<SlabsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,        
    public dialog: MatDialog
  ) {}

  ngOnInit(){
    this.SlbType = this.data.SlabType;
    console.log(this.data.SlabList);
    
    this.SlbTypeCaption = this.SlbType == 0 ? "Days" : "Amount";
    this.SlabList = this.data.SlabList;

    if (this.SlabList.length == 0){      
      this.AddSlabLine();
    }
  }

  AddSlabLine(){
    this.SlabErrors = "";
    switch (this.SlbType) {
      case 0:
        if (this.SlabList.length == 0){
          this.SlabList.push ({"FromPeriod" :0, "ToPeriod":0, "Roi":0, "OrgRoi":0})
        }
        else{
          
          if (this.SlabList[this.SlabList.length-1].ToPeriod != 0){
            this.SlabList.push ({"FromPeriod" : (this.SlabList[this.SlabList.length-1].ToPeriod)+1 , "ToPeriod":0, "Roi":0, "OrgRoi":0})
          }
          else{
            this.SlabErrors = "** Days to is zero"
          }
          
        }
        break;

      case 1:
        if (this.SlabList.length == 0){
          this.SlabList.push ({"FromAmount" :0, "ToAmount":0, "Roi":0, "OrgRoi":0})
        }
        else{
          
          if (this.SlabList[this.SlabList.length-1].ToAmount != 0){
            this.SlabList.push ({"FromAmount" : (this.SlabList[this.SlabList.length-1].ToAmount)+1 , "ToAmount":0, "Roi":0, "OrgRoi":0})
          }
          else{
            this.SlabErrors = "** To amount to is zero"
          }          
        }
        break;

      case 2:
        if (this.SlabList.length == 0){
          this.SlabList.push ({"FromAmount" :0, "ToAmount":0, "FeePer":0})
        }
        else{
          
          if (this.SlabList[this.SlabList.length-1].ToAmount != 0){
            this.SlabList.push ({"FromAmount" : (this.SlabList[this.SlabList.length-1].ToAmount)+1 , "ToAmount":0, "FeePer":0})
          }
          else{
            this.SlabErrors = "** To amount to is zero"
          }          
        }
        break;
    }

    
  } 

  RemoveSlabLine(i: number){
    this.SlabList.splice(i,1);
  }

  SubmitSlab(){
    this.SlabErrors = "";
    switch (this.SlbType) {
      case 0:
        if (this.SlabList[this.SlabList.length-1].ToPeriod !==0 ){
          this.SlabErrors = "Last Row (and above period) slab is missing";
          return;  }
        break;
    
      case 1:
        if (this.SlabList[this.SlabList.length-1].ToAmount !==0 ){
          this.SlabErrors = "Last Row (and above amount) slab is missing";
          return;}
        break;

      case 2:
      if (this.SlabList[this.SlabList.length-1].ToAmount !==0 ){
        this.SlabErrors = "Last Row (and above amount) slab is missing";
        return;}
      break;
    }
    
    this.data.SlabList = this.SlabList;
    this.CloseDialog();
  }
  CloseDialog(){
    this.dialogRef.close(this.data);
  }
}
