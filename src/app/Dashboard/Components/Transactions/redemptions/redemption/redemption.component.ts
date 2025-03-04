import { Component, OnInit } from '@angular/core';
import { Location           } from '@angular/common';
import { Router } from '@angular/router';
import { ClsParties, TypeParties } from 'src/app/Dashboard/Classes/ClsParties';
import { ClsVoucherSeries, TypeVoucherSeries } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { FileHandle } from 'src/app/Dashboard/Types/file-handle';
import { GlobalsService } from 'src/app/Services/globals.service';
import { DataService } from 'src/app/Services/data.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ClsLoans, TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsRedemptions, TypeRedemption } from 'src/app/Dashboard/Classes/ClsRedemptions';

import { ClsReports, TypeInterestDetails, TypeInterestStructure } from 'src/app/Dashboard/Classes/ClsReports';
import { MatDialog } from '@angular/material/dialog';
import { LoanSelectionComponent } from 'src/app/Dashboard/widgets/loan-selection/loan-selection.component';
import { RedemptionserviceService } from '../redemptionservice.service';
import { ClsLedgers, TypeLedger } from 'src/app/Dashboard/Classes/ClsLedgers';
import { PaymodesComponent } from 'src/app/Dashboard/widgets/paymodes/paymodes.component';
import { AlertsService } from 'src/app/Services/alerts.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { VoucherprintService } from 'src/app/Services/voucherprint.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiDataService } from 'src/app/Services/api-data.service';

@Component({
  selector: 'app-redemption',
  templateUrl: './redemption.component.html',
  styleUrls: ['./redemption.component.scss']
})

@AutoUnsubscribe
export class RedemptionComponent implements OnInit {

  private searchSubject = new Subject<number>();

  LoansList!:       TypeLoan[];
  SelectedLoan!:    TypeLoan;

  CustomersList!:       TypeParties[];
  SelectedCustomer!:    TypeParties;

  VoucherSeriesList!:   TypeVoucherSeries[];
  SelectedSeries!:      TypeVoucherSeries;
  DefaultSeries!:       TypeVoucherSeries[];

  TransImages:          FileHandle[] = [];

  Redemption!:                TypeRedemption;  
  
  TillDate!: number;
  
  InterestDetails!: TypeInterestDetails;
  InterestStructure: TypeInterestStructure[] = [];
  AutoSeriesNo: boolean = false;
  // For Validations  
  SeriesValid:        boolean = true;
  RedemptionNumberValid:    boolean = true;
  RedemptionDateValid:     boolean = true;
  TillDateValid:     boolean = true;
  LoanValid:      boolean = true;
  NettPayableValid: boolean = true; 

  PaymnentModeLedgers:  TypeLedger[] = [];
  
  StdLedgerList: TypeLedger[] = [];
  
  LockPreviousDate: boolean = false;

  constructor (      
                private globals:      GlobalsService, 
                private auth:         AuthService,
                private redService:   RedemptionserviceService, 
                private dataService:  DataService, 
                private router :      Router,
                private location:     Location,
                private dialog:       MatDialog,
                private alertService: AlertsService,
                private vouPrint:     VoucherprintService,
                private apidataService: ApiDataService,
              )
              {           
                this.Redemption = redService.getRedemption();     
                if (!this.Redemption){
                  this.router.navigate(['dashboard/redemptions']);
                  return;
                }   

                this.searchSubject
                .pipe(
                  debounceTime(300), // Wait 300ms after user stops typing
                  distinctUntilChanged() // Only emit if the value is different from the last
                )
                .subscribe((searchText) => {                  
                  if (searchText < 1) {return;}
                  let ln = new ClsLoans(this.dataService);  
                  ln.getLoanBySno(searchText,0,0,0,0,0,0,).subscribe(data=>{
                    if (data.apiData){
                      let fLn = JSON.parse(data.apiData)[0];
                      fLn.Customer = JSON.parse(fLn.Party_Json)[0];
                      if (fLn.Images_Json) {fLn.fileSource =  JSON.parse(fLn.Images_Json);}
                      fLn.IGroup = JSON.parse(fLn.Group_Json)[0];
                      fLn.Location  = JSON.parse(fLn.Location_Json)[0];          
                      fLn.Scheme = JSON.parse(fLn.Scheme_Json)[0];                    
                      this.getLoan(fLn);
                    }
                    else{
                      this.SelectedLoan = ln.Initialize();
                      //this.CustomerDetails = null!; 
                    }
                  })
                  // Add your search logic here
                });

              }

 ngOnInit(): void {    
    
  this.LockPreviousDate = this.globals.AppSetup().Lock_PreviousDate == 1 ? true : false;
  
  this.TillDate   = this.globals.DateToInt (new Date());
  let ser = new ClsVoucherSeries(this.dataService);
  ser.getVoucherSeries(0,this.globals.VTypLoanRedemption).subscribe(data=> {        
    if (data.queryStatus == 0){
      this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
      return;
    }
    else{
      this.VoucherSeriesList = JSON.parse (data.apiData);
      
      if (this.Redemption.RedemptionSno === 0)
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
        this.SelectedSeries = this.Redemption.Series;
      }     
    }
  },
  error => {
    this.globals.ShowAlert(this.globals.DialogTypeError,error);
    return;             
  });
  
  this.apidataService.getData("1").subscribe((data) => {
    this.LoansList = JSON.parse (data.apiData);
        this.LoansList = this.LoansList.filter(ln =>{
        return ln.Loan_Status == this.globals.LoanStatusOpen || ln.Loan_Status == this.globals.LoanStatusMatured
      }) 
        this.LoansList.map(loan => {        
          return  loan.Customer = JSON.parse (loan.Party_Json)[0], 
                  loan.IGroup = JSON.parse (loan.IGroup_Json)[0], 
                  loan.Location = JSON.parse (loan.Location_Json)[0], 
                  loan.Scheme = JSON.parse (loan.Scheme_Json)[0], 
                  loan.fileSource = loan.Images_Json ? JSON.parse (loan.Images_Json) : '';
        });
  });

  // let ln = new ClsLoans(this.dataService);
  // ln.getLoans(0,0,0,this.globals.LoanStatusAll,this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).subscribe(data=> {
  //   if (data.queryStatus == 0){
  //     this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
  //     return;
  //   }
  //   else{
  //     this.LoansList = JSON.parse (data.apiData);
  //     this.LoansList = this.LoansList.filter(ln =>{
  //       return ln.Loan_Status == this.globals.LoanStatusOpen || ln.Loan_Status == this.globals.LoanStatusMatured
  //     })
  //     this.LoansList.map(loan => {        
  //       return  loan.Customer = JSON.parse (loan.Party_Json)[0], 
  //               loan.IGroup = JSON.parse (loan.IGroup_Json)[0], 
  //               loan.Location = JSON.parse (loan.Location_Json)[0], 
  //               loan.Scheme = JSON.parse (loan.Scheme_Json)[0], 
  //               loan.fileSource = loan.Images_Json ? JSON.parse (loan.Images_Json) : '';
  //     })     
  //   }
  // },
  // error => {
  //   this.globals.ShowAlert(this.globals.DialogTypeError,error);
  //   return;             
  // });

  let cust = new ClsParties(this.dataService);
  cust.getParties(0,this.globals.PartyTypCustomers,0,0,0).subscribe(data=> {
    if (data.queryStatus == 0){
      this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
      return;
    }
    else{
      this.CustomersList = JSON.parse (data.apiData);      
    }
  },
  error => {
    this.globals.ShowAlert(this.globals.DialogTypeError,error);
    return;             
  });
 
  if (this.Redemption.RedemptionSno === 0){
    let Trans  = new ClsRedemptions(this.dataService);
    this.Redemption = Trans.Initialize();          
  }
  else{
    this.Redemption.PaymentMode = JSON.parse( JSON.stringify (this.Redemption.PaymentModes_Json));
    let sln = new ClsLoans(this.dataService);
    sln.getLoanBySno(this.Redemption.Loan.LoanSno, 0,0,0, this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled,this.globals.OpenStatusAllLoans).subscribe(data =>{    
      this.SelectedLoan           = JSON.parse(data.apiData)[0];  
      this.SelectedLoan.IGroup    =   JSON.parse (this.SelectedLoan.IGroup_Json)[0],  
      this.SelectedLoan.Location   =   JSON.parse (this.SelectedLoan.Location_Json)[0],
      this.SelectedLoan.Scheme     =   JSON.parse (this.SelectedLoan.Scheme_Json)[0],
      this.SelectedLoan.Customer   =   JSON.parse (this.SelectedLoan.Party_Json)[0],           
      this.SelectedLoan.fileSource =  JSON.parse(this.SelectedLoan.Images_Json); 
    })
  }
  
  let led = new ClsLedgers(this.dataService);
  led.getPaymentModes().subscribe(data=>{
    this.PaymnentModeLedgers = JSON.parse(data.apiData);
  });

  led.getStandardLedgers().subscribe(data=>{
    this.StdLedgerList = JSON.parse(data.apiData);
  })
}

SaveRedemption(){    

  if (this.ValidateInputs() == false) {return};    

  if (this.Redemption.PaymentMode.length == 0){
    this.Redemption.PaymentMode.push ({"Ledger": this.PaymnentModeLedgers[0], "Amount" : this.Redemption.Nett_Payable})
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
        StrImageXml += " Image_Url='" + this.auth.getRedemptionImagesServerPath() + "' ";           
        StrImageXml += " >";
        StrImageXml += "</Image_Details>";
      }      
    }   

    StrImageXml += "</Images>"
    StrImageXml += "</ROOT>";

  let Rec  = new ClsRedemptions(this.dataService);
  Rec.Redemption = this.Redemption;    
  Rec.Redemption.Customer = Rec.Redemption.Loan.Customer;
  
  Rec.Redemption.ItemDetailXML  = StrItemXML;
  Rec.Redemption.ImageDetailXML  = StrImageXml;
  Rec.Redemption.PaymentModesXML = this.globals.GetPaymentModeXml(this.Redemption.PaymentMode, this.globals.VTypLoanRedemption);
  Rec.Redemption.fileSource      = this.Redemption.fileSource;
  Rec.Redemption.BranchSno = this.auth.SelectedBranchSno;
  //Rec.Redemption.VouDetailXML = this.globals.GetRedemptionVoucherXml(Rec.Redemption,this.StdLedgerList)
  
  Rec.saveRedemption().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{                  
          if (this.Redemption.RedemptionSno == 0) {this.alertService.CreateRedemptionAlert(this.globals.AlertTypeNewRedemption, this.Redemption);}                    
          this.globals.SnackBar("info", this.Redemption.RedemptionSno == 0 ? "Redemption Created successfully" : "Redemption updated successfully");     
          this.router.navigate(['dashboard/redemptions']);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    })
}

PrintTransaction(trans: TypeRedemption){            
  if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdRedemptions, this.globals.UserRightPrint)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
  if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series "); return; }
    else { this.vouPrint.PrintVoucher(trans, 14 ,trans.Series.Print_Style!);}
}

DeleteRedemption(){
  this.globals.QuestionAlert("Are you sure you wanto to delete this Redemption?").subscribe(Response => {      
    if (Response == 1){
      let ar = new ClsRedemptions(this.dataService);
      ar.Redemption = this.Redemption;
      ar.deleteRedemption().subscribe(data => {
        if (data.queryStatus == 0)
        {
          this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
          return;
        }
        else{
          this.globals.SnackBar("info","Redemption deleted successfully");       
          this.router.navigate(['dashboard/Redemptions']);   
        }
      })        
    }
  })
}

ValidateInputs(): boolean{                
  this.Redemption.Series          = this.SelectedSeries;
  this.Redemption.Loan           = this.SelectedLoan;  
  this.Redemption.fileSource      = this.TransImages;

  if (!this.Redemption.Series )  { this.SeriesValid = false; this.globals.SnackBar("error","Invalid Series...");  return false; }  else  {this.SeriesValid = true; }    
  if (!this.Redemption.Redemption_No.length )  { this.RedemptionNumberValid = false; this.globals.SnackBar("error","Invalid Redemption Number...");  return false; }  else  {this.RedemptionNumberValid = true; }    
  if (!this.Redemption.Loan || this.Redemption.Loan.LoanSno == 0 )  { this.LoanValid = false; this.globals.SnackBar("error","Invalid Loan...");  return false; }  else  {this.LoanValid = true; }    
  if (!this.Redemption.Nett_Payable || this.Redemption.Nett_Payable == 0 )  { this.NettPayableValid = false; this.globals.SnackBar("error","Invalid Nett Payable...");  return false; }  else  {this.NettPayableValid = true; }      
  return true;
} 

CalculateRedemptionValues(){  
  this.Redemption.Nett_Payable = this.globals.RoundDigitsToNear( +(+this.Redemption.Rec_Principal + +this.Redemption.Rec_Interest + +this.Redemption.Rec_Other_Credits - +this.Redemption.Rec_Other_Debits + +this.Redemption.Rec_Default_Amt + +this.Redemption.Rec_Add_Less).toFixed(2));
}

getAutoRedemptionNumber(){
  let rec = new ClsRedemptions(this.dataService);
  rec.getRedemptionNumber(this.SelectedSeries.SeriesSno).subscribe(data => {     
    this.Redemption.Redemption_No = data.apiData;
  });
}

callGetLoan(){
  this.getLoan(this.SelectedLoan);
}

onSearchByBarCode(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.searchSubject.next(+input.value);
}

getLoan($event: TypeLoan){       
  this.SelectedLoan = $event;  
  this.InterestDetails = null!;
  this.InterestStructure = [];
  if (this.SelectedLoan && this.SelectedLoan.LoanSno){ 
    this.SelectedCustomer = this.SelectedLoan.Customer;
    let rep = new ClsReports(this.dataService);  
    rep.getLoanDetailed(this.SelectedLoan.LoanSno, this.TillDate).subscribe(data => {
      this.InterestDetails = JSON.parse (data.apiData)[0];
      this.Redemption.Rec_Principal = this.InterestDetails.Principal_Balance;
      this.Redemption.Rec_Interest = +this.InterestDetails.Interest_Balance;
      this.CalculateRedemptionValues();
      this.InterestStructure = JSON.parse (this.InterestDetails.Struc_Json);    
    });
  }  
}

getCustomer($event: TypeParties){      
  this.SelectedCustomer = $event;  
  let rep = new ClsReports(this.dataService);
  rep.getCustomerDetailed($event.PartySno).subscribe(data =>{        
    
    let LoanData: any[] = JSON.parse(JSON.parse (data.apiData)[0].Loans_Json!);         
    if (LoanData){
      LoanData = LoanData.filter(ln => {
        return (ln.Approval_Status == this.globals.ApprovalStatusApproved) && (ln.Loan_Status == this.globals.LoanStatusOpen || ln.Loan_Status == this.globals.LoanStatusMatured)
      })
    }    

    const dialogRef = this.dialog.open(LoanSelectionComponent, 
      {         
        // width:'50vw',
        data: {"Party_Name": $event.Party_Name, "LoanData": LoanData}  ,
      });
      
      dialogRef.disableClose = true;  
      dialogRef.afterClosed().subscribe(result => {        
        if (result){                
          this.getLoan(this.LoansList.filter((ln)=> ln.LoanSno === parseInt(result.LoanSno))[0]);
          // this.SelectedLoan = this.LoansList.filter((ln)=> ln.LoanSno === parseInt(result.LoanSno))[0];
        }
        
      }); 
  })
}

getSeries($event: TypeVoucherSeries){    
  this.SelectedSeries = $event;
  this.AutoSeriesNo = this.SelectedSeries.Num_Method == 2 ? true : false;
  // if (this.SelectedSeries !== $event ){
    if ($event.Num_Method !== 0){
      this.getAutoRedemptionNumber();
    }    
  // }  
}


getTransImages($event: FileHandle[]){    
  this.TransImages = $event;  
}

MultiPaymentModes(){
  if (this.Redemption.Nett_Payable == 0) { this.globals.SnackBar("error","Nett Payable is zero!!"); return; }
  const dialogRef = this.dialog.open(PaymodesComponent, 
    { 
      height:"100%",
      position:{"right":"0","top":"0" },
      data: {"Amount": this.Redemption.Nett_Payable, "PaymentModeList": this.Redemption.PaymentMode} ,
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {        
      if (result){  
        if (result){                    
          this.Redemption.PaymentMode = result;
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

