import { Component, OnInit } from '@angular/core';
import { Location           } from '@angular/common';
import { Router } from '@angular/router';
import { ClsParties, TypeParties } from 'src/app/Dashboard/Classes/ClsParties';
import { ClsVoucherSeries, TypeVoucherSeries } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { FileHandle } from 'src/app/Dashboard/Types/file-handle';
import { GlobalsService } from 'src/app/Services/globals.service';
import { DataService } from 'src/app/Services/data.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ClsRpClosures, TypeRpClosure } from 'src/app/Dashboard/Classes/ClsRpClosures';
import { ClsReports, TypeInterestDetails, TypeInterestStructure } from 'src/app/Dashboard/Classes/ClsReports';
import { MatDialog } from '@angular/material/dialog';
import { ClsLedgers, TypeLedger } from 'src/app/Dashboard/Classes/ClsLedgers';
import { PaymodesComponent } from 'src/app/Dashboard/widgets/paymodes/paymodes.component';
import { AlertsService } from 'src/app/Services/alerts.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsRepledges, TypeRepledge } from 'src/app/Dashboard/Classes/ClsRepledges';
import { RpClosureService } from '../rpclosureservice';

@Component({
  selector: 'app-rpclosure',
  templateUrl: './rpclosure.component.html',
  styleUrls: ['./rpclosure.component.scss']
})

@AutoUnsubscribe
export class RpclosureComponent implements OnInit {

  RepledgesList!:       TypeRepledge[];
  SelectedRepledge!:    TypeRepledge;

  SuppliersList!:       TypeParties[];
  SelectedSupplier!:    TypeParties;

  VoucherSeriesList!:   TypeVoucherSeries[];
  SelectedSeries!:      TypeVoucherSeries;
  DefaultSeries!:       TypeVoucherSeries[];

  TransImages:          FileHandle[] = [];

  RpClosure!:                TypeRpClosure;  
  
  TillDate!: number;
  
  InterestDetails!: TypeInterestDetails;
  InterestStructure: TypeInterestStructure[] = [];
  AutoSeriesNo: boolean = false;

  // For Validations  
  SeriesValid:        boolean = true;
  RpClosureNumberValid:    boolean = true;
  RpClosureDateValid:     boolean = true;
  TillDateValid:     boolean = true;
  RepldegeValid:      boolean = true;
  NettPayableValid: boolean = true; 

  PaymnentModeLedgers:  TypeLedger[] = [];
  
  StdLedgerList:       TypeLedger[] = [];

  IsOpen: number = 0;
  constructor (  
                private globals: GlobalsService, 
                private auth: AuthService,
                private rpcService: RpClosureService, 
                private dataService: DataService, 
                private router : Router,
                private location: Location,
                private dialog: MatDialog,
                private alertService: AlertsService
              )
              {           
                this.RpClosure = rpcService.getRpClosure();    
                if (!this.RpClosure){
                  this.router.navigate(['dashboard/RpClosures/' + sessionStorage.getItem("RpClosureIsOpen")]);
                  return;
                }               
              }

 ngOnInit(): void {     
    
  this.TillDate   = this.globals.DateToInt (new Date());
  let ser = new ClsVoucherSeries(this.dataService);
  ser.getVoucherSeries(0,this.globals.VTypRepledgeClosure).subscribe(data=> {
    if (data.queryStatus == 0){
      this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
      return;
    }
    else{
      this.VoucherSeriesList = JSON.parse (data.apiData);      
      if (this.RpClosure.RpClosureSno === 0)
      {
        this.DefaultSeries = JSON.parse (data.apiData);
        //this.DefaultSeries.find(obj => obj.IsDefault == 1);
        this.DefaultSeries = this.DefaultSeries.filter((obj) =>{
          return obj.IsDefault == true;
        })
        this.getSeries(this.DefaultSeries[0]);
      }
      else
      { 
        this.getSeries(JSON.parse(this.RpClosure.Series_Json)[0]);
      }     
    }
  },
  error => {
    this.globals.ShowAlert(this.globals.DialogTypeError,error);
    return;             
  });
  
  let rp = new ClsRepledges(this.dataService);
  rp.getRepledges(0,0,0,this.globals.LoanStatusAll, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).subscribe(data=> {
    if (data.queryStatus == 0){
      this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
      return;
    }
    else{
      this.RepledgesList = JSON.parse (data.apiData);
      this.RepledgesList = this.RepledgesList.filter(ln =>{
        return ln.Repledge_Status == this.globals.LoanStatusOpen || ln.Repledge_Status == this.globals.LoanStatusMatured
      }) 
      this.RepledgesList.map(rp => {        
        return  rp.Supplier = JSON.parse (rp.Party_Json)[0],                 
                rp.Borrower = JSON.parse (rp.Borrower_Json)[0],                 
                rp.Scheme = JSON.parse (rp.Scheme_Json)[0], 
                rp.fileSource = rp.Images_Json ? JSON.parse (rp.Images_Json) : '';
      })     
    }
  },
  error => {
    this.globals.ShowAlert(this.globals.DialogTypeError,error);
    return;             
  });

  let supp = new ClsParties(this.dataService);
  supp.getParties(0,this.globals.PartyTypSuppliers,0,0,0).subscribe(data=> {
    if (data.queryStatus == 0){
      this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
      return;
    }
    else{
      this.SuppliersList = JSON.parse (data.apiData);      
    }
  },
  error => {
    this.globals.ShowAlert(this.globals.DialogTypeError,error);
    return;             
  });
 
  if (this.RpClosure.RpClosureSno === 0){
    let Trans  = new ClsRpClosures(this.dataService);
    this.RpClosure = Trans.Initialize();        
  }
  else{    
    this.RpClosure.PaymentMode = JSON.parse ( this.RpClosure.PaymentModes_Json);        
    this.getRepledge(JSON.parse(this.RpClosure.Repledge_Json)[0]);
    this.getSupplier(JSON.parse(this.RpClosure.Supplier_Json)[0]);    
  }

  let led = new ClsLedgers(this.dataService);
  led.getPaymentModes().subscribe(data=>{
    this.PaymnentModeLedgers = JSON.parse(data.apiData);
  });

  led.getStandardLedgers().subscribe(data=>{
    this.StdLedgerList = JSON.parse(data.apiData);
  })
}

SaveRpClosure(){     
    
  if (this.ValidateInputs() == false) {return};    

  if (this.RpClosure.PaymentMode.length == 0){
    this.RpClosure.PaymentMode.push ({"Ledger": this.PaymnentModeLedgers[0], "Amount" : this.RpClosure.Nett_Payable})
  }

  var StrItemXML: string = "";
  
  StrItemXML = "<ROOT>"
  StrItemXML += "<Transaction>"  
  
  StrItemXML += "</Transaction>"
  StrItemXML += "</ROOT>";
  
  var StrImageXml: string = "";

    StrImageXml = "<ROOT>"
    StrImageXml += "<Images>"
    
    for (var i=0; i < this.TransImages.length; i++)
    {
      if (this.TransImages[i].DelStatus == 0)
      {
        StrImageXml += "<Image_Details ";
        StrImageXml += " Image_Name='" + this.TransImages[i].Image_Name + "' ";                         
        StrImageXml += " Image_Url='" + this.auth.getRpClosureImagesServerPath() + "' ";           
        StrImageXml += " >";
        StrImageXml += "</Image_Details>";
      }      
    }   

    StrImageXml += "</Images>"
    StrImageXml += "</ROOT>";

  let Rpp  = new ClsRpClosures(this.dataService);
  Rpp.RpClosure = this.RpClosure;    
  
  
  
  Rpp.RpClosure.ItemDetailXML   = StrItemXML;
  Rpp.RpClosure.ImageDetailXML  = StrImageXml;
  Rpp.RpClosure.PaymentModesXML = this.globals.GetPaymentModeXml(this.RpClosure.PaymentMode, this.globals.VTypRepledgeClosure);
  Rpp.RpClosure.fileSource      = this.RpClosure.fileSource;
  Rpp.RpClosure.BranchSno       = this.auth.SelectedBranchSno;
  
  Rpp.saveRpClosure().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{                    
          this.globals.SnackBar("info", this.RpClosure.RpClosureSno == 0 ? "RpClosure Created successfully" : "RpClosure updated successfully");     
          this.router.navigate(['dashboard/RpClosures/' + this.IsOpen]);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    })
}

DeleteRpClosure(){
  this.globals.QuestionAlert("Are you sure you wanto to delete this RpClosure?").subscribe(Response => {      
    if (Response == 1){
      let ar = new ClsRpClosures(this.dataService);
      ar.RpClosure = this.RpClosure;
      ar.deleteRpClosure().subscribe(data => {
        if (data.queryStatus == 0)
        {
          this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
          return;
        }
        else{
          this.globals.SnackBar("info","RpClosure deleted successfully");       
          this.router.navigate(['dashboard/rpclosures']);   
        }
      })        
    }
  })
}

ValidateInputs(): boolean{                
  this.RpClosure.Series             = this.SelectedSeries;
  this.RpClosure.Repledge           = this.SelectedRepledge;  
  this.RpClosure.Supplier           = this.SelectedSupplier;  
  this.RpClosure.fileSource         = this.TransImages;

  if (!this.RpClosure.Series )  { this.SeriesValid = false; this.globals.SnackBar("error","Invalid Series...");  return false; }  else  {this.SeriesValid = true; }    
  if (!this.RpClosure.RpClosure_No.length )  { this.RpClosureNumberValid = false; this.globals.SnackBar("error","Invalid RpClosure Number...");  return false; }  else  {this.RpClosureNumberValid = true; }    
  if (!this.RpClosure.Repledge || this.RpClosure.Repledge.RepledgeSno == 0 )  { this.RepldegeValid = false; this.globals.SnackBar("error","Invalid Loan...");  return false; }  else  {this.RepldegeValid = true; }    
  if (!this.RpClosure.Nett_Payable || this.RpClosure.Nett_Payable == 0 )  { this.NettPayableValid = false; this.globals.SnackBar("error","Invalid Nett Payable...");  return false; }  else  {this.NettPayableValid = true; }      
  return true;
}  

CalculateRpClosureValues(){
  this.RpClosure.Nett_Payable = +(+this.RpClosure.Rp_Principal + +this.RpClosure.Rp_Interest + +this.RpClosure.Rp_Default_Amt + +this.RpClosure.Rp_Add_Less).toFixed(2);
}

getAutoRpClosureNumber(){
  let rec = new ClsRpClosures(this.dataService);
  rec.getRpClosureNumber(this.SelectedSeries.SeriesSno).subscribe(data => {        
    this.RpClosure.RpClosure_No = data.apiData;
  });
}

callGetRepledge(){
  this.getRepledge(this.SelectedRepledge);
}

getRepledge($event: TypeRepledge){         
  this.SelectedRepledge = $event;  
  this.InterestDetails = null!;
  this.InterestStructure = [];
  if (this.SelectedRepledge && this.SelectedRepledge.RepledgeSno){
    this.SelectedSupplier = this.SelectedRepledge.Supplier;
    let rep = new ClsReports(this.dataService);  
    rep.getRepledgeDetailed(this.SelectedRepledge.RepledgeSno, this.TillDate).subscribe(data => {
      this.InterestDetails = JSON.parse (data.apiData)[0];        
      this.InterestStructure = JSON.parse (this.InterestDetails.Struc_Json);    
    });
  }  
}

getSupplier($event: TypeParties){      
  this.SelectedSupplier = $event;  
  let rep = new ClsReports(this.dataService);
  // rep.getSupplierDetailed($event.PartySno).subscribe(data =>{        
    
  //   let LoanData: any[] = JSON.parse(JSON.parse (data.apiData)[0].Loans_Json!);         
  //   if (LoanData){
  //     LoanData = LoanData.filter(ln => {
  //       return (ln.Approval_Status == this.globals.ApprovalStatusApproved) && (ln.Loan_Status == this.globals.LoanStatusOpen || ln.Loan_Status == this.globals.LoanStatusMatured)
  //     })
  //   }    

  //   const dialogRef = this.dialog.open(LoanSelectionComponent, 
  //     {         
  //       // width:'50vw',
  //       data: {"Party_Name": $event.Party_Name, "LoanData": LoanData}  ,
  //     });
      
  //     dialogRef.disableClose = true;  
  //     dialogRef.afterClosed().subscribe(result => {        
  //       if (result){                
  //         this.SelectedLoan = this.LoansList.filter((ln)=> ln.LoanSno === parseInt(result.LoanSno))[0];
  //       }
        
  //     }); 
  // })
}

getSeries($event: TypeVoucherSeries){    
  this.SelectedSeries = $event;
  this.AutoSeriesNo = this.SelectedSeries.Num_Method == 2 ? true : false;
  // if (this.SelectedSeries !== $event ){
    if ($event.Num_Method !== 0){
      this.getAutoRpClosureNumber();
    }    
  // }  
}


getTransImages($event: FileHandle[]){    
  this.TransImages = $event;  
}

MultiPaymentModes(){
  if (this.RpClosure.Nett_Payable == 0) { this.globals.SnackBar("error","Nett Payable is zero!!"); return; }
  
  
  const dialogRef = this.dialog.open(PaymodesComponent, 
    { 
      height:"100%",
      position:{"right":"0","top":"0" },
      data: {"Amount": this.RpClosure.Nett_Payable, "PaymentModeList":  this.RpClosure.PaymentMode} ,
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {        
      if (result){  
        if (result){                    
          this.RpClosure.PaymentMode = result;
        }        
      }      
    }); 
}

CanExit()
  {
    return confirm ("You have unsaved changes. Do you want to exit anyway?")
  }

  GoBack(){
    this.location.back();
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
}

