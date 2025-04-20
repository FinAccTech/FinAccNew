import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsSchemes, TypeScheme } from 'src/app/Dashboard/Classes/ClsSchemes';
import { ClsVoucherSeries, TypeVoucherSeries } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { SlabsComponent } from 'src/app/Dashboard/widgets/slabs/slabs.component';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-scheme',
  templateUrl: './scheme.component.html',
  styleUrls: ['./scheme.component.scss']
})

@AutoUnsubscribe
export class SchemeComponent implements OnInit {
  
  Scheme!:        TypeScheme;    
  SchemeSlab:     any[] = [];  
  AmtSlab:        any[] = [];
  FeeSlab:        any[] = [];

  SeriesList!: TypeVoucherSeries[];
  SelectedSeries!: TypeVoucherSeries;
  
  // For Validations  
  CodeAutoGen: boolean = false;
  SchemeNameValid: boolean = true;
  SeriesNameValid: boolean = true;
  HideSlab: boolean = false;
  SeriesFixed: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<SchemeComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService
  ) 
  {
    this.Scheme = data.Scheme;                
    if (data.Series){
      this.SeriesFixed = true;
      this.Scheme.Series = this.data.Series;
    }
  }

  ngOnInit(): void {        
      if (this.globals.AppSetup()[0].SchemeCode_AutoGen== 1){
        this.CodeAutoGen = true;
        if (this.Scheme.SchemeSno == 0){      
          let it = new ClsSchemes(this.dataService)
          it.getSchemeCode().subscribe(data => {
            this.Scheme.Scheme_Code = data.apiData;
          })
        }
      } 
    
      
    let ser = new ClsVoucherSeries(this.dataService);
    ser.getVoucherSeries(0, this.globals.VTypLoanPayment).subscribe(data =>{
      this.SeriesList = JSON.parse(data.apiData);
    })

    if (this.Scheme.SchemeSno == 0){
      this.SchemeSlab = [];
      this.AmtSlab    = [];
      this.FeeSlab    = [];
    }
    else{   
      this.SelectedSeries = this.Scheme.Series!;             
      this.SchemeSlab = this.Scheme.Slab_Json;
      if (!this.SchemeSlab){ this.SchemeSlab = [] }
      this.AmtSlab = this.Scheme.AmtSlab_Json;
      if (!this.AmtSlab){ this.AmtSlab = [] }
      this.FeeSlab = this.Scheme.FeeSlab_Json;
      if (!this.FeeSlab){ this.FeeSlab = [] }            
    }    
  }

  SaveScheme(){    
    if (this.ValidateInputs() == false) {return};    
    
    var StrSlabXml: string = "";

    StrSlabXml = "<ROOT>"
    StrSlabXml += "<Scheme>"
    
    for (var i=0; i < this.SchemeSlab.length; i++)
    {    
        StrSlabXml += "<Scheme_Details ";
        StrSlabXml += " FromPeriod='" + this.SchemeSlab[i].FromPeriod + "' ";                 
        StrSlabXml += " ToPeriod='" + this.SchemeSlab[i].ToPeriod + "' ";             
        StrSlabXml += " DRoi='" + this.SchemeSlab[i].Roi + "' ";             
        StrSlabXml += " DOrgRoi='" + this.SchemeSlab[i].Roi + "' ";             
        StrSlabXml += " >";
        StrSlabXml += "</Scheme_Details>";     
    }   

    StrSlabXml += "</Scheme>"
    StrSlabXml += "</ROOT>" 

    var StrAmtSlabXml: string = "";

    StrAmtSlabXml = "<ROOT>"
    StrAmtSlabXml += "<Amount>"
    
    for (var i=0; i < this.AmtSlab.length; i++)
    {    
      StrAmtSlabXml += "<Amount_Details ";
      StrAmtSlabXml += " FromAmount='" + this.AmtSlab[i].FromAmount + "' ";                 
      StrAmtSlabXml += " ToAmount='" + this.AmtSlab[i].ToAmount + "' ";             
      StrAmtSlabXml += " DRoi='" + this.AmtSlab[i].Roi + "' ";                     
      StrAmtSlabXml += " >";
      StrAmtSlabXml += "</Amount_Details>";     
    }   

    StrAmtSlabXml += "</Amount>"
    StrAmtSlabXml += "</ROOT>" 

    var StrFeeSlabXml: string = "";

    StrFeeSlabXml = "<ROOT>"
    StrFeeSlabXml += "<Fee>"
    
    for (var i=0; i < this.FeeSlab.length; i++)
    {    
      StrFeeSlabXml += "<Fee_Details ";
      StrFeeSlabXml += " FromAmount='" + this.FeeSlab[i].FromAmount + "' ";                 
      StrFeeSlabXml += " ToAmount='" + this.FeeSlab[i].ToAmount + "' ";             
      StrFeeSlabXml += " FeePer='" + this.FeeSlab[i].FeePer + "' ";                     
      StrFeeSlabXml += " >";
      StrFeeSlabXml += "</Fee_Details>";     
    }   

    StrFeeSlabXml += "</Fee>"
    StrFeeSlabXml += "</ROOT>" 

    let sch = new ClsSchemes(this.dataService);
    sch.Scheme = this.Scheme;    
    sch.Scheme.BranchSno = this.auth.SelectedBranchSno();
    sch.Scheme.MultiIntXml = StrSlabXml;
    sch.Scheme.AmtIntXml = StrAmtSlabXml;
    sch.Scheme.FeeSlabXml = StrFeeSlabXml;

    if (!this.SelectedSeries || this.SelectedSeries == undefined){
      this.SelectedSeries = {"SeriesSno":0,"VouType":{"VouTypeSno": 12,"VouType_Name":"Loan Payment"}, "Series_Name":""}
    }    

    sch.Scheme.Series = this.SelectedSeries;    

    sch.saveScheme().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          sch.Scheme.SchemeSno = data.RetSno;
          sch.Scheme.Name =  '' + sch.Scheme.Scheme_Name;
          sch.Scheme.Details = 'Code: ' +  sch.Scheme.Scheme_Code;

          this.globals.SnackBar("info", this.Scheme.SchemeSno == 0 ? "Scheme Created successfully" : "Scheme updated successfully");          
          this.CloseDialog(sch.Scheme);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteScheme(){
    if (this.Scheme.SchemeSno == 0){
      this.globals.SnackBar("error", "No Scheme selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Scheme?").subscribe(Response => {      
      if (Response == 1){
        let sch = new ClsSchemes(this.dataService);
        sch.Scheme = this.Scheme;
        sch.deleteScheme().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Scheme deleted successfully");            
            this.CloseDialog(sch.Scheme);
          }
        })        
      }
    })
  }

  CloseDialog(sch: TypeScheme)  {
    this.dialogRef.close(sch);
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{             
    this.Scheme.Series = this.SelectedSeries;
    if (!this.Scheme.Scheme_Name!.length )  { this.SchemeNameValid = false;  return false; }  else  {this.SchemeNameValid = true; }      
    // if (!this.Scheme.Series || this.Scheme.Series.SeriesSno == 0) {this.SeriesNameValid = false; return false;} else {this.SeriesNameValid = true; }
    if (this.Scheme.Enable_AmtSlab && this.AmtSlab.length < 2) { this.globals.SnackBar("error","Invalid Amout Slab Details"); return false }
    if (this.Scheme.Calc_Method == 1 && this.SchemeSlab.length < 2) { this.globals.SnackBar("error","Invalid Multiple Scheme Slab Details"); return false }
    if (this.Scheme.Enable_FeeSlab && this.FeeSlab.length < 2) { this.globals.SnackBar("error","Invalid Fee Slab Details"); return false }
    if (this.Scheme.Doc_Charges! > 0 && this.Scheme.Doc_Charges_Per! > 0) { this.globals.SnackBar("error","Doc Charges should be either Amount or %ge"); return false }
    return true;
  }
  
  customTrackBy(index: number, obj: any): any {
	  return index;
  }

  getSeries($event: TypeVoucherSeries){    
    this.SelectedSeries = $event;  
  }

  OpenSlab(Type: number){
    //var img = this.TransImages; 
  
    const dialogRef = this.dialog.open(SlabsComponent, 
      {         
        width:'50vw',
        data: {"SlabType": Type, "SlabList": Type ==0 ? this.SchemeSlab : Type ==1 ? this.AmtSlab : this.FeeSlab },
      });
      
      dialogRef.disableClose = true;
  
      dialogRef.afterClosed().subscribe(result => {        
        // this.TransImages = result;   
        

        if (result){
          result.SlabType == 0 ? this.SchemeSlab = result.SlabList : result.SlabType == 1 ? this.AmtSlab = result.SlabList : this.FeeSlab = result.SlabList; 
          if (Type  == 0){
            this.Scheme.Roi = this.SchemeSlab[0].Roi;
          }
        }
        
      }); 
  }

}

