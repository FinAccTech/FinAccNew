import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsSchemes, TypeScheme } from 'src/app/Dashboard/Classes/ClsSchemes';
import { ClsVoucherSeries, TypeVoucherSeries, TypeVoucherTypes } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';


@Component({
  selector: 'app-voucherseries',
  templateUrl: './voucherseries.component.html',
  styleUrls: ['./voucherseries.component.scss']
})

@AutoUnsubscribe
export class VoucherseriesComponent implements OnInit {
  
  Series!:          TypeVoucherSeries;
  VtypeList!:    TypeVoucherTypes[]; 
  SelectedVouType!: TypeVoucherTypes;
  DataChanged:    boolean = false;

  SchemesList!:         TypeScheme[];
  SelectedScheme!:      TypeScheme;
  
  // For Validations  
  SeriesNameValid: boolean = true;
  GrpNameValid: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<VoucherseriesComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeVoucherSeries,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService
  ) 
  {
    this.Series = data;      
    this.SelectedVouType = this.data.VouType!;    
  }

  ngOnInit(): void {    
    let ser = new ClsVoucherSeries(this.dataService);
    ser.getVoucherTypes(0).subscribe(data => {      
      this.VtypeList = JSON.parse (data.apiData);   
    });    
    let sch = new ClsSchemes(this.dataService);
  sch.getSchemes(0,).subscribe(data=> {
    if (data.queryStatus == 0){
      this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
      return;
    }
    else{
      this.SchemesList = JSON.parse (data.apiData);
      if (this.Series.SeriesSno !== 0)
      {
        this.getScheme(this.Series.MapScheme!);
      } 
    }
  },
  error => {
    this.globals.ShowAlert(this.globals.DialogTypeError,error);
    return;             
  });
    
  }

  SaveSeries(){        
            
    if (this.ValidateInputs() == false) {return};    
    let ser = new ClsVoucherSeries(this.dataService);
    ser.Series = this.Series; 
        
    ser.Series.BranchSno = this.auth.SelectedBranchSno;
    if (!this.SelectedScheme || this.SelectedScheme == undefined){
      this.SelectedScheme = {"SchemeSno":0, "Scheme_Code":"", "Scheme_Name":""}
    }    
    
    ser.Series.MapScheme = this.SelectedScheme;
    ser.saveVoucherSeries().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.globals.SnackBar("info", this.Series.SeriesSno == 0 ? "Series Created successfully" : "Series updated successfully");
          this.DataChanged = true;
          this.CloseDialog();
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteSeries(){
    if (this.Series.SeriesSno == 0){
      this.globals.SnackBar("error", "No Series selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Series?").subscribe(Response => {      
      if (Response == 1){
        let itm = new ClsVoucherSeries(this.dataService);
        itm.Series = this.Series;
        itm.deleteVoucherSeries().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Series deleted successfully");
            this.DataChanged = true;
            this.CloseDialog();
          }
        })        
      }
    })
  }

  CloseDialog()  {
    this.dialogRef.close(this.DataChanged);
  }

  ValidateInputs(): boolean{            
    if (!this.Series.Series_Name.length )  { this.SeriesNameValid = false;  return false; }  else  {this.SeriesNameValid = true; }   
    
    // if (!this.Series.IGroup || this.Series.IGroup.GrpSno == 0 )  { this.GrpNameValid = false;  return false; }  else  {this.GrpNameValid = true; }    
     return true;
  }
  // SetActiveStatus($event: any){    
  //   console.log (this.SeriesGroup.Active_Status);
  //   console.log ($event.target.checked);
  // }
  getVoucherType($event: TypeVoucherTypes){
    this.SelectedVouType = $event;
    this.Series.VouType = this.SelectedVouType;    
  }

  getScheme($event: TypeScheme){    
    this.SelectedScheme = $event;
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
}
