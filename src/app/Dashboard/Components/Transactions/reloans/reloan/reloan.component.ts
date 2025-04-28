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
import { ClsReports, TypeInterestDetails, } from 'src/app/Dashboard/Classes/ClsReports';
import { MatDialog } from '@angular/material/dialog';
import { LoanSelectionComponent } from 'src/app/Dashboard/widgets/loan-selection/loan-selection.component';
import { ReLoanService } from '../reloans.service';
import { ClsReLoans, TypeReLoan } from 'src/app/Dashboard/Classes/ClsReloans';
import { ClsRedemptions } from 'src/app/Dashboard/Classes/ClsRedemptions';
import { ClsSchemes, TypeScheme } from 'src/app/Dashboard/Classes/ClsSchemes';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ApiDataService } from 'src/app/Services/api-data.service';

@Component({
  selector: 'app-reloan',
  templateUrl: './reloan.component.html',
  styleUrls: ['./reloan.component.scss']
})

@AutoUnsubscribe
export class ReloanComponent implements OnInit {

  LoansList!:       TypeLoan[];
  SelectedLoan!:    TypeLoan;

  CustomersList!:       TypeParties[];
  SelectedCustomer!:    TypeParties;

  VouSeriesList!: TypeVoucherSeries[];

  ReLoanSeriesList!:   TypeVoucherSeries[];
  SelectedReLoanSeries!:      TypeVoucherSeries;
  DefaultReLoanSeries!:       TypeVoucherSeries[];

  RedemptionSeriesList!:   TypeVoucherSeries[];
  SelectedRedemptionSeries!:      TypeVoucherSeries;
  DefaultRedemptionSeries!:       TypeVoucherSeries[];

  NewLoanSeriesList!:   TypeVoucherSeries[];
  SelectedNewLoanSeries!:      TypeVoucherSeries;
  DefaultNewLoanSeries!:       TypeVoucherSeries[];

  NewLoanSchemesList!: TypeScheme[];
  SelectedNewLoanScheme!: TypeScheme;
  
  TransImages:          FileHandle[] = [];

  ReLoan!:                TypeReLoan;  
  
  TillDate!: number;
  
  InterestDetails!: TypeInterestDetails;

  AutoReLoanSeries: boolean = false;
  AutoRedemptionSeries: boolean = false;
  AutoNewLoanSeries: boolean = false;
  
  // For Validations  
  SeriesValid:        boolean = true;
  ReLoanNumberValid:    boolean = true;
  ReLoanDateValid:     boolean = true;
  TillDateValid:     boolean = true;
  LoanValid:      boolean = true;
  NettPayableValid: boolean = true; 

  constructor (  
                private globals: GlobalsService, 
                private auth: AuthService,
                private reloanService: ReLoanService, 
                private dataService: DataService, 
                private router : Router,
                private location: Location,
                private dialog: MatDialog,
                private apidataService: ApiDataService
              )
              {           
                this.ReLoan = reloanService.getReLoan();     
                if (!this.ReLoan){
                  this.router.navigate(['dashboard/reloans']);
                  return;
                }   
              }

 ngOnInit(): void {     
    
  this.TillDate   = this.globals.DateToInt (new Date());
  let ser = new ClsVoucherSeries(this.dataService);
  ser.getVoucherSeries(0,0).subscribe(data=> {
    if (data.queryStatus == 0){
      this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
      return;
    }
    else{
      this.VouSeriesList = JSON.parse (data.apiData);      
      this.ReLoanSeriesList = this.VouSeriesList.filter(rl =>{
        return rl.VouType.VouTypeSno == this.globals.VTypReLoan;
      })

      this.RedemptionSeriesList = this.VouSeriesList.filter(rl =>{
        return rl.VouType.VouTypeSno == this.globals.VTypLoanRedemption;
      })

      this.NewLoanSeriesList = this.VouSeriesList.filter(rl =>{
        return rl.VouType.VouTypeSno == this.globals.VTypLoanPayment;
      })

      if (this.ReLoan.ReLoanSno === 0)
      {
        this.DefaultReLoanSeries = this.ReLoanSeriesList;        
        this.DefaultReLoanSeries = this.DefaultReLoanSeries.filter((obj) =>{
          return obj.IsDefault == true;
        })
        this.getReLoanSeries(this.DefaultReLoanSeries[0]);
        
        this.DefaultRedemptionSeries = this.RedemptionSeriesList;        
        this.DefaultRedemptionSeries = this.RedemptionSeriesList.filter((obj) =>{
          return obj.IsDefault == true;
        })
        this.getRedemptionSeries(this.DefaultRedemptionSeries[0]);
        
        this.DefaultNewLoanSeries = this.NewLoanSeriesList;        
        this.DefaultNewLoanSeries = this.DefaultNewLoanSeries.filter((obj) =>{
          return obj.IsDefault == true;
        })
        this.getNewLoanSeries(this.DefaultNewLoanSeries[0]);        
      }
      else
      {
        this.SelectedReLoanSeries = this.ReLoan.Series;
      }     
    }
  },
  error => {
    this.globals.ShowAlert(this.globals.DialogTypeError,error);
    return;             
  });
  
  let sch = new ClsSchemes(this.dataService);
  sch.getSchemes(0).subscribe(data =>{
    this. NewLoanSchemesList = JSON.parse(data.apiData);
    this.getNewLoanScheme(this.NewLoanSchemesList[0]);    
  })
  
    this.LoansList = this.apidataService.getLoansList();
    this.LoansList.filter(ln=>{
      return ln.Loan_Status == this.globals.LoanStatusOpen || ln.Loan_Status == this.globals.LoanStatusMatured;
    })
        this.LoansList.map(loan => {        
          return  loan.Customer = JSON.parse (loan.Party_Json)[0], 
                        loan.IGroup = JSON.parse (loan.IGroup_Json)[0], 
                        loan.Location = JSON.parse (loan.Location_Json)[0], 
                        loan.Scheme = JSON.parse (loan.Scheme_Json)[0], 
                        loan.fileSource = loan.Images_Json ? JSON.parse (loan.Images_Json) : '';
        });
  

  // let ln = new ClsLoans(this.dataService);
  // ln.getLoans(0,0,0,this.globals.LoanStatusOpen, this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).subscribe(data=> {
  //   if (data.queryStatus == 0){
  //     this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
  //     return;
  //   }
  //   else{
  //     this.LoansList = JSON.parse (data.apiData)
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
 
  if (this.ReLoan.ReLoanSno === 0){
    let Trans  = new ClsReLoans(this.dataService);
    this.ReLoan = Trans.Initialize();          
  }
  else{    
    let sln = new ClsLoans(this.dataService);
    // sln.getLoans(this.ReLoan.Loan.LoanSno,0,0,0,0,0).subscribe(data =>{    
    //   this.SelectedLoan           = JSON.parse(data.apiData)[0];  
    //   this.SelectedLoan.IGroup    =   JSON.parse (this.SelectedLoan.IGroup_Json)[0],  
    //   this.SelectedLoan.Location   =   JSON.parse (this.SelectedLoan.Location_Json)[0],
    //   this.SelectedLoan.Scheme     =   JSON.parse (this.SelectedLoan.Scheme_Json)[0],
    //   this.SelectedLoan.Customer   =   JSON.parse (this.SelectedLoan.Party_Json)[0],           
    //   this.SelectedLoan.fileSource =  JSON.parse(this.SelectedLoan.Images_Json);
    // })
  }
}

SaveReLoan(){    
    
  if (this.ValidateInputs() == false) {return};    

  let Rec  = new ClsReLoans(this.dataService);
  this.ReLoan.Customer = this.SelectedCustomer;
  Rec.ReLoan = this.ReLoan;    
  Rec.ReLoan.ItemDetailXML  = null!;
  Rec.ReLoan.ImageDetailXML  = null!;    
  Rec.ReLoan.BranchSno = this.auth.SelectedBranchSno();

  Rec.saveReLoan().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{                              
          this.globals.SnackBar("info", this.ReLoan.ReLoanSno == 0 ? "ReLoan Created successfully" : "ReLoan updated successfully");     
          this.router.navigate(['dashboard/ReLoans']);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    })
}

DeleteReLoan(){
  this.globals.QuestionAlert("Are you sure you wanto to delete this ReLoan?").subscribe(Response => {      
    if (Response == 1){
      let ar = new ClsReLoans(this.dataService);
      ar.ReLoan = this.ReLoan;
      ar.deleteReLoan().subscribe(data => {
        if (data.queryStatus == 0)
        {
          this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
          return;
        }
        else{
          this.globals.SnackBar("info","ReLoan deleted successfully");       
          this.router.navigate(['dashboard/ReLoans']);   
        }
      })        
    }
  })
}

ValidateInputs(): boolean{                
  this.ReLoan.Series          = this.SelectedReLoanSeries;
  //this.ReLoan.Loan           = this.SelectedLoan;  
  

  if (!this.ReLoan.Series )  { this.SeriesValid = false; this.globals.SnackBar("error","Invalid Series...");  return false; }  else  {this.SeriesValid = true; }    
  if (!this.ReLoan.ReLoan_No.length )  { this.ReLoanNumberValid = false; this.globals.SnackBar("error","Invalid ReLoan Number...");  return false; }  else  {this.ReLoanNumberValid = true; }    
  // if (!this.ReLoan.Loan || this.ReLoan.Loan.LoanSno == 0 )  { this.LoanValid = false; this.globals.SnackBar("error","Invalid Loan...");  return false; }  else  {this.LoanValid = true; }    
  // if (!this.ReLoan.Nett_Payable || this.ReLoan.Nett_Payable == 0 )  { this.NettPayableValid = false; this.globals.SnackBar("error","Invalid Nett Payable...");  return false; }  else  {this.NettPayableValid = true; }      
  return true;
} 

CalculateReLoanValues(){
  //this.ReLoan.Nett_Payable = +(this.ReLoan.Rec_Principal + this.ReLoan.Rec_Interest + this.ReLoan.Rec_Other_Credits + this.ReLoan.Rec_Other_Debits + this.ReLoan.Rec_Default_Amt + this.ReLoan.Rec_Add_Less).toFixed(2);
}

getAutoReLoanNumber(){
  let rec = new ClsReLoans(this.dataService);
  rec.getReLoanNumber(this.SelectedReLoanSeries.SeriesSno).subscribe(data => {        
    console.log(data);
    
    this.ReLoan.ReLoan_No = data.apiData;
  });
}

getAutoRedemptionNumber(){
  let red = new ClsRedemptions(this.dataService);
  red.getRedemptionNumber(this.SelectedRedemptionSeries.SeriesSno).subscribe(data => {        
    this.ReLoan.Redemption.Redemption_No = data.apiData;
  });
}

getAutoLoanNumber(){
  let ln = new ClsLoans(this.dataService);
  ln.getLoanNumber(this.SelectedNewLoanSeries.SeriesSno).subscribe(data => {        
    this.ReLoan.NewLoan.Loan_No = data.apiData;
  });
}


getLoan($event: TypeLoan){      
  this.SelectedLoan = $event;  
  this.InterestDetails = null!;  
  if (this.SelectedLoan && this.SelectedLoan.LoanSno){    
    this.SelectedCustomer = $event.Customer;
    this.getNewLoanScheme(this.SelectedLoan.Scheme);
    this.ReLoan.NewLoan.Principal = this.SelectedLoan.Principal;
    this.CalcNewLoanNettPayable();
    let rep = new ClsReports(this.dataService);  
    rep.getLoanDetailed(this.SelectedLoan.LoanSno, this.TillDate).subscribe(data => {
      this.InterestDetails = JSON.parse (data.apiData)[0];                    
      this.ReLoan.Redemption.Rec_Interest = this.InterestDetails.Interest_Balance;
      this.ReLoan.Redemption.Rec_Principal = this.InterestDetails.Principal_Balance;      
      this.CalcRedNettPayable();
    });
  }  
}

CalcNewLoanNettPayable(){
  this.ReLoan.NewLoan.Nett_Payable = this.ReLoan.NewLoan.Principal - this.ReLoan.NewLoan.DocChargesAmt;
}
CalcRedNettPayable(){
  this.ReLoan.Redemption.Nett_Payable = +Math.round(+this.ReLoan.Redemption.Rec_Interest + +this.ReLoan.Redemption.Rec_Principal + +this.ReLoan.Redemption.Rec_Add_Less);
}

getCustomer($event: TypeParties){      
  this.SelectedCustomer = $event;  
  const dialogRef = this.dialog.open(LoanSelectionComponent, 
    {         
      // width:'50vw',
      data:   this.SelectedCustomer,
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {        
      if (result){                
        this.SelectedLoan = this.LoansList.filter((ln)=> ln.LoanSno === parseInt(result))[0];
      }
      
    }); 
}

getReLoanSeries($event: TypeVoucherSeries){    
  this.SelectedReLoanSeries = $event;
  this.AutoReLoanSeries = this.SelectedReLoanSeries.Num_Method == 2 ? true: false;
  if ($event.Num_Method !== 0){
      this.getAutoReLoanNumber();    
  }  
}

getRedemptionSeries($event: TypeVoucherSeries){    
  this.SelectedRedemptionSeries = $event;
  this.AutoRedemptionSeries = this.SelectedRedemptionSeries.Num_Method == 2 ? true: false;
  if ($event.Num_Method !== 0){
      this.getAutoRedemptionNumber();    
  }  
}

getNewLoanSeries($event: TypeVoucherSeries){    
  this.SelectedNewLoanSeries = $event;
  this.AutoNewLoanSeries = this.SelectedNewLoanSeries.Num_Method == 2 ? true: false;
  if ($event.Num_Method !== 0){
      this.getAutoLoanNumber();    
  }  
}

getNewLoanScheme($event: TypeScheme){    
  this.SelectedNewLoanScheme = $event;  
}

getTransImages($event: FileHandle[]){    
  this.TransImages = $event;  
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

 