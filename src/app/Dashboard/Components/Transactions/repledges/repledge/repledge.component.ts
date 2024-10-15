import { Component, OnInit } from '@angular/core';
import { Location,} from '@angular/common';
import { Router } from '@angular/router';
import { TypeParties } from 'src/app/Dashboard/Classes/ClsParties';
import { ClsSchemes, TypeScheme } from 'src/app/Dashboard/Classes/ClsSchemes';
import { FileHandle } from 'src/app/Dashboard/Types/file-handle';
import { GlobalsService } from 'src/app/Services/globals.service';
import { DataService } from 'src/app/Services/data.service';
import { AuthService } from 'src/app/Services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { StatusupdateComponent } from 'src/app/Dashboard/widgets/statusupdate/statusupdate.component';
import { PaymodesComponent } from 'src/app/Dashboard/widgets/paymodes/paymodes.component';
import { TypeLedger } from 'src/app/Dashboard/Classes/ClsLedgers';
import { VoucherprintService } from 'src/app/Services/voucherprint.service';
import { AlertsService } from 'src/app/Services/alerts.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsRepledges, TypeRepledge } from 'src/app/Dashboard/Classes/ClsRepledges';
import { RepledgeService } from '../repledge.service';
import { TypeVoucherSeries } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { LoanSelectionComponent } from 'src/app/Dashboard/widgets/loan-selection/loan-selection.component';
import { ClsTransactions } from 'src/app/Dashboard/Classes/ClsTransactions';

interface TypeLoansList{
  LoanSno: number;
  Loan_No: number;
  Loan_Date: number;
  Party_Name: string;
  Principal: number;
  TotNettWt: number;
}

@Component({
  selector: 'app-repledge',
  templateUrl: './repledge.component.html',
  styleUrls: ['./repledge.component.scss']
})

@AutoUnsubscribe
export class RepledgeComponent implements OnInit {

  SuppliersList!:       TypeParties[];
  SelectedSupplier!:    TypeParties;

  BorrowersList!:       TypeParties[];
  SelectedBorrower!:    TypeParties;  
  RepledgeData!:            any[];

  VoucherSeriesList!:   TypeVoucherSeries[];
  SelectedSeries!:      TypeVoucherSeries;
  DefaultSeries!:       TypeVoucherSeries[];

  SchemesList!:         TypeScheme[];
  DataSchemesList!:         TypeScheme[];
  SelectedScheme!:      TypeScheme;

  LoansList: TypeLoansList[] = [];
    
  PaymnentModeLedgers:  TypeLedger[] = [];

  StdLedgerList:       TypeLedger[] = [];

  TransImages:          FileHandle[] = [];

  Repledge!:                TypeRepledge;

  TotalPrincipal: number = 0;
  TotalNettWt: number = 0;
  
  MappedScheme: boolean  = false;
  AutoSeriesNo: boolean = false;
  FirstTimeLoaded: boolean = true;

  // For Validations  
  SeriesValid:        boolean = true;
  RepledgeNumberValid:    boolean = true;
  RefNumberValid:    boolean = true;
  RepledgeDateValid:     boolean = true;
  SupplierValid:      boolean = true;
  BorrowerValid:      boolean = true;
  SchemeValid:        boolean = true;
  
  TotQtyValid:        boolean = true;
  TotGrossWtValid:    boolean = true;
  TotNettWtValid:     boolean = true;
  MarketValueValid:   boolean = true;
  PrincipalValid:     boolean = true;
  IntRateValid:       boolean = true;
  MatureDateValid:    boolean = true;
  LocationValid:      boolean = true;

  // For Calculating Market Value
  SchemeMaxper: number = 0;
  RepledgePerGram: number = 0;
  
  IsOpen: number = 0;

  constructor (  
                private globals: GlobalsService, 
                private auth: AuthService,
                private rpservice: RepledgeService, 
                private dataService: DataService, 
                private router : Router,
                private location: Location,
                private dialog: MatDialog,
                private vouprint: VoucherprintService,
                private alertService: AlertsService
              )
              {           
                this.Repledge = rpservice.getRepledge();                  
                if (!this.Repledge){
                  this.router.navigate(['dashboard/repledges/' + sessionStorage.getItem("RepledgeIsOpen")]);
                  return;
                }   
                else{
                  this.IsOpen = this.Repledge.IsOpen;
                }
              }

 ngOnInit(): void {  
    
  let rp = new ClsRepledges(this.dataService);
  rp.getRepledgeMasters().subscribe(data=>{
    
    this.VoucherSeriesList  = JSON.parse(data.apiData.SeriesList);    
    this.SchemesList        = JSON.parse(data.apiData.SchemesList);        
        
    this.SuppliersList      = JSON.parse(data.apiData.SuppliersList); 
    this.BorrowersList      = JSON.parse(data.apiData.BorrowersList); 

    this.PaymnentModeLedgers = JSON.parse(data.apiData.PaymentModesList);
    this.StdLedgerList      = JSON.parse(data.apiData.StdLedgerList);
    
    if (this.Repledge.RepledgeSno === 0){
      let Trans  = new ClsRepledges(this.dataService);
      this.Repledge = Trans.Initialize();      
      this.Repledge.IsOpen = this.IsOpen;
      
      //Voucher Series
      this.DefaultSeries = this.VoucherSeriesList;
         this.DefaultSeries =  this.DefaultSeries.filter((obj) =>{
          return obj.IsDefault == true;
        })
        this.getSeries(this.DefaultSeries[0]);   

      //Schemes      
        this.getScheme(this.SchemesList[0]);   
      
    }
    else
    {
      this.Repledge.Series = JSON.parse(this.Repledge.Series_Json)[0]; 
      this.SelectedSeries = this.Repledge.Series;

      this.Repledge.Scheme = JSON.parse(this.Repledge.Scheme_Json)[0]; 
      this.SelectedScheme = this.Repledge.Scheme;

      this.Repledge.Supplier = JSON.parse(this.Repledge.Party_Json)[0];       
      this.getSupplier(this.Repledge.Supplier);      

      this.Repledge.Borrower = JSON.parse(this.Repledge.Borrower_Json)[0];       
      this.getBorrower(this.Repledge.Borrower);      
      
      this.LoansList = JSON.parse(this.Repledge.RepledgeLoans_Json);   
      this.SetLoansTotal();
      
      this.Repledge.PaymentMode = JSON.parse (this.Repledge.PaymentModes_Json);      

      if (this.Repledge.Images_Json.trim() !== '' && JSON.parse (this.Repledge.Images_Json).length > 0){
        this.TransImages =       JSON.parse (this.Repledge.Images_Json);    
      }          
    }
  })

   
}

SaveRepledge(){      
  if (this.Repledge.RepledgeSno !== 0){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRepledge, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
  }
  

  if (this.ValidateInputs() == false) {return};    

  if (this.Repledge.PaymentMode.length == 0){
    this.Repledge.PaymentMode.push ({"Ledger": this.PaymnentModeLedgers[0], "Amount" : this.Repledge.Nett_Payable})
  }
  
  var StrImageXml: string = "";
    StrImageXml = "<ROOT>"
    StrImageXml += "<Images>"    
    for (var i=0; i < this.TransImages.length; i++)
    {
      if (this.TransImages[i].DelStatus == 0)
      {
        StrImageXml += "<Image_Details ";
        StrImageXml += " Image_Name='" + this.TransImages[i].Image_Name + "' ";                         
        StrImageXml += " Image_Url='" + this.auth.getRepledgeImagesServerPath() + "' ";           
        StrImageXml += " >";
        StrImageXml += "</Image_Details>";
      }      
    }   
    StrImageXml += "</Images>"
    StrImageXml += "</ROOT>";

  let Rp  = new ClsRepledges(this.dataService);
  Rp.Repledge = this.Repledge;  
  
  Rp.Repledge.ImageDetailXML  = StrImageXml;    
  Rp.Repledge.PaymentModesXML = this.globals.GetPaymentModeXml(this.Repledge.PaymentMode, this.globals.VTypRePledge);
  Rp.Repledge.RepledgeLoansXML = this.GetRepledgeXml();

  
  // Ln.Repledge.PaymentMode = this.PaymentModesList;
  Rp.Repledge.fileSource      = this.Repledge.fileSource;
  Rp.Repledge.BranchSno = this.auth.SelectedBranchSno;
  //Ln.Repledge.VouDetailXML = this.globals.GetRepledgeVoucherXml(Ln.Repledge, this.StdLedgerList);
    
  Rp.saveRepledge().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{                              
          this.globals.SnackBar("info", this.Repledge.RepledgeSno == 0 ? "Repledge Created successfully" : "Repledge updated successfully");     
          this.router.navigate(['dashboard/repledges/' + this.IsOpen]);  
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    })
}

DeleteRepledge(){
  this.globals.QuestionAlert("Are you sure you wanto to delete this Repledge?").subscribe(Response => {      
    if (Response == 1){
      let ar = new ClsRepledges(this.dataService);
      ar.Repledge = this.Repledge;
      ar.deleteRepledge().subscribe(data => {
        if (data.queryStatus == 0)
        {
          this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
          return;
        }
        else{
          this.globals.SnackBar("info","Repledge deleted successfully");       
          this.router.navigate(['dashboard/Repledges']);   
        }
      })        
    }
  })
}

ValidateInputs(): boolean{                
  this.Repledge.Series          = this.SelectedSeries;
  this.Repledge.Supplier        = this.SelectedSupplier;
  this.Repledge.Borrower        = this.SelectedBorrower;
  this.Repledge.Scheme          = this.SelectedScheme;  
  this.Repledge.fileSource      = this.TransImages;

  if (!this.Repledge.Series )  { this.SeriesValid = false; this.globals.SnackBar("error","Invalid Series...");  return false; }  else  {this.SeriesValid = true; }    
  if (!this.Repledge.Repledge_No.length )  { this.RepledgeNumberValid = false; this.globals.SnackBar("error","Invalid Repledge Number...");  return false; }  else  {this.RepledgeNumberValid = true; }    
  if (!this.Repledge.Ref_No.length )  { this.RefNumberValid = false; this.globals.SnackBar("error","Invalid Bank Reference Number...");  return false; }  else  {this.RefNumberValid = true; }    

  if (!this.Repledge.Supplier || this.Repledge.Supplier.PartySno == 0 )  { this.SupplierValid = false; this.globals.SnackBar("error","Invalid Supplier...");  return false; }  else  {this.SupplierValid = true; }    
  if (!this.Repledge.Borrower || this.Repledge.Borrower.PartySno == 0 )  { this.BorrowerValid = false; this.globals.SnackBar("error","Invalid Borrower...");  return false; }  else  {this.BorrowerValid = true; }    
  if (!this.Repledge.Scheme || this.Repledge.Scheme.SchemeSno == 0 )  { this.SchemeValid = false; this.globals.SnackBar("error","Invalid Scheme...");  return false; }  else  {this.SchemeValid = true; }    
  
  
  // if (this.Repledge.TotQty == 0 || this.Repledge.TotGrossWt == 0 || this.Repledge.TotNettWt == 0 || this.Repledge.Market_Value == 0)
  if (this.TotalNettWt == 0 || this.TotalPrincipal == 0)
  {
    this.globals.SnackBar("error", "No Loan selected for Repledge");
    return false;
  }

  if (!this.Repledge.Principal || this.Repledge.Principal == 0)  
    { 
      this.PrincipalValid = false;  
      this.globals.SnackBar("error","Invalid Repledge Amount...");  
      return false; 
    }  
    else  {this.PrincipalValid = true; }    

  // if (this.Repledge.Principal > this.Repledge.Market_Value ) {
  //   if (this.SelectedSupplier.Allow_More_Value == 1){
  //     this.PrincipalValid = true;
  //   }
  //   else{
  //     this.PrincipalValid = false; 
  //     this.globals.SnackBar("error","Repledge Amount cannot be greater than the market value...");  
  //     return false; 
  //   }
  // }

  if (!this.Repledge.Roi || this.Repledge.Roi == 0) {this.IntRateValid =false; this.globals.SnackBar("error","Interest Rate cannot be zero"); return false;  } else { this.IntRateValid = true;}
  return true;
} 

CalculateRepledgeValues(){
  if (this.Repledge.Principal == 0) { return; }  
  this.Repledge.DocChargesAmt =  Math.round(this.Repledge.Principal * (this.Repledge.DocChargesPer / 100));
  this.Repledge.Nett_Payable = +(this.Repledge.Principal - this.Repledge.DocChargesAmt).toFixed(2);
}

getAutoRepledgeNumber(){
  let ln = new ClsRepledges(this.dataService);
  ln.getRepledgeNumber(this.SelectedSeries.SeriesSno).subscribe(data => {        
    this.Repledge.Repledge_No = data.apiData;
  });
} 

// getNewSupplier($event: TypeParties){
//   let pty = new ClsParties(this.dataService);
//   pty.getParties(0,this.globals.PartyTypSuppliers, 0, 0, 0 ).subscribe(data =>{
//     this.SuppliersList = JSON.parse(data.apiData);
//     this.getSupplier($event);
//   })

// }

getSupplier($event: TypeParties){     
  
  this.SelectedSupplier = $event;
  //this.SupplierDetails = null!;  
  this.RepledgeData = [];
  // if(this.SelectedSupplier)
  // {
  // let rep = new ClsReports(this.dataService);
  //     rep.getSupplierDetailed(this.SelectedSupplier.PartySno).subscribe(data =>{        
  //       this.SupplierDetails = JSON.parse (data.apiData)[0];                
  //       this.RepledgeData = JSON.parse(this.SupplierDetails.Repledges_Json!);     

  //       if(this.RepledgeData)
  //       {
  //         this.RepledgeData = this.RepledgeData.filter(ln =>{
  //           return  (ln.Approval_Status == this.globals.ApprovalStatusApproved) 
  //                   && 
  //                   (ln.Cancel_Status == this.globals.CancelStatusNotCancelled) 
  //                   && 
  //                   (ln.Repledge_Status == this.globals.RepledgeStatusOpen || ln.Repledge_Status == this.globals.RepledgeStatusMatured);
  //         })
  //       }
  //     })
  //   }
}

getBorrower($event: TypeParties){       
  this.SelectedBorrower = $event;
  //this.SupplierDetails = null!; 
  this.RepledgeData = [];
}


getNewSeries($event: TypeVoucherSeries){
  if ($event){
    this.VoucherSeriesList.push($event)    
    this.getSeries($event);
  }     
}


getSeries($event: TypeVoucherSeries){    
  this.SelectedSeries = $event;  
  // if (this.SelectedSeries !== $event ){
  this.AutoSeriesNo = this.SelectedSeries.Num_Method == 2 ? true: false;
    if ($event.Num_Method !== 0){
      this.getAutoRepledgeNumber();
    // }    
  }  
}

getNewScheme($event: TypeScheme){
  if ($event){
    this.DataSchemesList.push($event);
    this.SchemesList.push($event)    
    this.getScheme($event);
  }     
}

getScheme($event: TypeScheme){    
  this.SelectedScheme = $event;     
  
  if (this.Repledge.RepledgeSno == 0 ){
    this.Repledge.Roi = this.SelectedScheme.Roi!;       
    this.Repledge.DocChargesPer = parseFloat(this.SelectedScheme.ProcessingFeePer!.toString());      
  }  
  else{
    if (this.FirstTimeLoaded == false){
      this.Repledge.Roi = this.SelectedScheme.Roi!;         
      this.Repledge.DocChargesPer = parseFloat(this.SelectedScheme.ProcessingFeePer!.toString());              
    }
    this.FirstTimeLoaded = false;
  }

  this.SchemeMaxper = this.SelectedScheme.Max_MarketValue!;  
  this.SetMatureDate();
}

SelectLoans(){      
  
  let trans = new ClsTransactions(this.dataService);
  trans.getLoansforRepledge().subscribe(data =>{        //To be altered later. Just for Temporary Purpose
    
    let LoanData: any[] = JSON.parse(data.apiData);         
    
    const dialogRef = this.dialog.open(LoanSelectionComponent, 
      {         
        // width:'50vw',
        data: {"Party_Name": "Non Repledged Loans", "LoanData": LoanData}  ,
      }); 
      
      dialogRef.disableClose = true;  
      dialogRef.afterClosed().subscribe(result => {        
        if (result){                
          // this.SelectedLoan = this.LoansList.filter((ln)=> ln.LoanSno === parseInt(result))[0];
          let lnExists: boolean = false;
          this.LoansList.forEach(ln=>{
            if (ln.LoanSno == result.LoanSno){
              this.globals.SnackBar("error","Loan already selected. Select a different Loan");              
              lnExists = true;
              return;
            }
          })
          if (lnExists == false){ this.LoansList.push (result);}
        }

        this.SetLoansTotal();
      }); 
  })  
}

SetLoansTotal(){
  this.TotalPrincipal = 0;
  this.TotalNettWt = 0;

  this.LoansList.forEach(ln=>{
    this.TotalPrincipal += +ln.Principal;
    this.TotalNettWt += +ln.TotNettWt;
  })
}

RemoveLoan(i: number){  
  this.LoansList.splice(i,1);
  this.SetLoansTotal();
}

SetMatureDate(){
  let tDate = new Date( this.globals.IntToDate(this.Repledge.Repledge_Date) );
  tDate.setFullYear(tDate.getFullYear() + this.SelectedScheme.LpYear! );
  tDate.setMonth(tDate.getMonth() + this.SelectedScheme.LpMonth!);
  tDate.setDate(tDate.getDate() + this.SelectedScheme.LpDays!);   
  this.Repledge.Mature_Date = this.globals.DateToInt(tDate);  
}

GetRoi($event: any){
  const amt =  $event.target.value;      
  if (this.SelectedScheme.Enable_AmtSlab == false && this.SelectedScheme.Enable_FeeSlab == false ) { return;}

    let sch = new ClsSchemes(this.dataService);    
    sch.getRoiforAmoount(this.SelectedScheme.SchemeSno, amt).subscribe(data => {            
        if (JSON.parse(data.apiData).length < 1) {return}        
        this.Repledge.Roi = (JSON.parse (data.apiData)[0].Roi);
        if (this.SelectedScheme.Enable_FeeSlab){
          this.Repledge.DocChargesPer = (JSON.parse (data.apiData)[0].FeePer);        
        }        
        this.CalculateRepledgeValues();
    })  
    
}



getTransImages($event: FileHandle[]){    
  this.TransImages = $event;  
}

DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
}

// PrintTransaction(trans: TypeRepledge){    
//   if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRepledges, this.globals.UserRightPrint)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
//   if (trans.Approval_Status == this.globals.ApprovalStatusUnApproved){
//     this.globals.SnackBar("error","UnApproved Repledges cannot be printed... ")
//     return;
//   }
//   // let ser = new ClsVoucherSeries(this.dataService);
//   // trans.Series = JSON.parse(trans.Series_Json)[0];
//   // trans.Supplier = JSON.parse(trans.Party_Json)[0];
//   // trans.Scheme = JSON.parse(trans.Scheme_Json)[0];
//   // trans.IGroup = JSON.parse(trans.IGroup_Json)[0];
//   // trans.Location = JSON.parse(trans.Location_Json)[0];
  
//   if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series "); return; }
//     else { this.vouprint.PrintVoucher(trans, 12 ,trans.Series.Print_Style!);}

//   // if (trans.Series.Print_Style !== "") {
//   //   this.vouprint.Style_Repledge_Pgf(trans, trans.Series.Print_Style!);
//   // }
// }

CancelRepledge(){
  const dialogRef = this.dialog.open(StatusupdateComponent, 
    {         
      width:'40vw',
      data: { "RepledgeSno":this.Repledge.RepledgeSno, "Updation_Type": 2, "Document_Type": 1 },
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {        
      if (result){        
        if (result == true){          
          this.Repledge.Cancel_Status = this.globals.CancelStatusCancelled;
        }
        
      }      
    });  
}

MultiPaymentModes(){
  if (this.Repledge.Nett_Payable == 0) { this.globals.SnackBar("error","Nett Payable is zero!!"); return; }
  const dialogRef = this.dialog.open(PaymodesComponent, 
    { 
      height:"100%",
      position:{"right":"0","top":"0" },
      data: {"Amount": this.Repledge.Nett_Payable, "PaymentModeList": this.Repledge.PaymentMode} ,
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {        
      if (result){  
        if (result){                    
          this.Repledge.PaymentMode = result;
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

  GetStatusColor(ln: TypeRepledge){
    return ln.Repledge_Status == this.globals.RepledgeStatusOpen ? 'green' :  ln.Repledge_Status == this.globals.RepledgeStatusClosed ? '#6e6c6c' : ln.Repledge_Status == this.globals.RepledgeStatusMatured ? 'red' : 'black';
  }

  GetRepledgeXml(): string{
    let StrXml = '<ROOT>';
    StrXml += '<Loans>';
    this.LoansList.forEach(ln=>{
      StrXml += '<Loan ';
      StrXml += 'LoanSno="'+ ln.LoanSno +'" ';
      StrXml += ' >';
      StrXml += '</Loan>';
    })
    StrXml += '</Loans>';
    StrXml += '</ROOT>';
    return StrXml
  }

}

