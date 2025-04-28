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
import { ClsReceipts, TypeReceipt } from 'src/app/Dashboard/Classes/ClsReceipts';
import { ReceiptService } from '../receipts.service';
import { ClsReports, TypeInterestDetails, TypeInterestStructure } from 'src/app/Dashboard/Classes/ClsReports';
import { MatDialog } from '@angular/material/dialog';
import { LoanSelectionComponent } from 'src/app/Dashboard/widgets/loan-selection/loan-selection.component';
import { ClsLedgers, TypeLedger } from 'src/app/Dashboard/Classes/ClsLedgers';
import { PaymodesComponent } from 'src/app/Dashboard/widgets/paymodes/paymodes.component';
import { AlertsService } from 'src/app/Services/alerts.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiDataService } from 'src/app/Services/api-data.service';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})

@AutoUnsubscribe
export class ReceiptComponent implements OnInit {

  private searchSubject = new Subject<number>();
  private searchSubjectLoanNo = new Subject<string>();
  private searchSubjectPartyName = new Subject<string>();
  
  LoansList!:       TypeLoan[];
  SelectedLoan!:    TypeLoan;

  CustomersList!:       TypeParties[];
  SelectedCustomer!:    TypeParties;

  VoucherSeriesList!:   TypeVoucherSeries[];
  SelectedSeries!:      TypeVoucherSeries;
  DefaultSeries!:       TypeVoucherSeries[];

  TransImages:          FileHandle[] = [];

  Receipt!:                TypeReceipt;  
  
  TillDate!: number;
  // PayingDues: number = 1;
  // TotalDueAmount: number = 0;


  InterestDetails!: TypeInterestDetails;
  InterestStructure: TypeInterestStructure[] = [];
  AutoSeriesNo: boolean = false;

  // For Validations  
  SeriesValid:        boolean = true;
  ReceiptNumberValid:    boolean = true;
  ReceiptDateValid:     boolean = true;
  TillDateValid:     boolean = true;
  LoanValid:      boolean = true;
  NettPayableValid: boolean = true; 

  PaymnentModeLedgers:  TypeLedger[] = [];  
  StdLedgerList:       TypeLedger[] = [];
  IsOpen: number = 0;
  LockPreviousDate: boolean = false;

  IsEmiScheme: boolean = false;
   
  constructor (  
                private globals: GlobalsService, 
                private auth: AuthService,
                private ReceiptService: ReceiptService, 
                private dataService: DataService, 
                private router : Router,
                private location: Location,
                private dialog: MatDialog,
                private alertService: AlertsService,
                private apidataService: ApiDataService
              )
              {           
                this.Receipt = ReceiptService.getReceipt();    
                if (!this.Receipt){
                  this.router.navigate(['dashboard/receipts/' + sessionStorage.getItem("receiptIsOpen")]);
                  return;
                }   
                else{
                  this.IsOpen = this.Receipt.IsOpen;
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

                this.searchSubjectLoanNo
                .pipe(
                  debounceTime(300), // Wait 300ms after user stops typing
                  distinctUntilChanged() // Only emit if the value is different from the last
                )
                .subscribe((searchText) => {                  
                  if (!searchText || searchText.length < 3) { return;}
                  let ln = new ClsLoans(this.dataService);  
                  ln.getLoanbySearch(searchText, this.globals.LoanStatusAll,this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).subscribe(data=>{
                    if (data.apiData){
                      this.LoansList = JSON.parse(data.apiData);
                                    
                      this.LoansList.map(loan => {        
                      return  loan.IGroup       =   JSON.parse (loan.IGroup_Json)[0],  
                                loan.Location   =   JSON.parse (loan.Location_Json)[0],
                                loan.Scheme     =   JSON.parse (loan.Scheme_Json)[0],
                                loan.Customer   =   JSON.parse (loan.Party_Json)[0], 
                                loan.fileSource =   loan.Images_Json ? JSON.parse (loan.Images_Json) : '';
                      });
                    }                            
                  })
                });
                
                this.searchSubjectPartyName
                .pipe(
                  debounceTime(300), // Wait 300ms after user stops typing
                  distinctUntilChanged() // Only emit if the value is different from the last
                )
                .subscribe((searchText) => {                  
                  if (!searchText || searchText.length < 3) { return;}
                  let cust = new ClsParties(this.dataService);
                  cust.getPartybySearch(searchText,this.globals.PartyTypCustomers,0,0,0).subscribe(data=> {
                    if (data.queryStatus == 0){
                      this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
                      return;
                    }
                    else{
                      this.CustomersList = JSON.parse(data.apiData);
                    }
                  },
                  error => {
                    this.globals.ShowAlert(this.globals.DialogTypeError,error);
                    return;             
                  });
                });
              }

 ngOnInit(): void {             
  this.LockPreviousDate = this.globals.AppSetup()[0].Lock_PreviousDate == 1 ? true : false;

  this.TillDate   = this.globals.DateToInt (new Date());
  let ser = new ClsVoucherSeries(this.dataService);
  ser.getVoucherSeries(0,this.globals.VTypLoanReceipt).subscribe(data=> {
    if (data.queryStatus == 0){
      this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
      return;
    }
    else{
      this.VoucherSeriesList = JSON.parse (data.apiData);
      
      if (this.Receipt.ReceiptSno === 0)
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
        this.SelectedSeries = this.Receipt.Series
      }     
    }
  },
  error => {
    this.globals.ShowAlert(this.globals.DialogTypeError,error);
    return;             
  });
  
    
    
      //   this.LoansList = this.LoansList.filter(ln =>{
      //   return ln.Loan_Status == this.globals.LoanStatusOpen || ln.Loan_Status == this.globals.LoanStatusMatured
      // }) 
      //   this.LoansList.map(loan => {        
      //     return  loan.Customer = JSON.parse (loan.Party_Json)[0], 
      //             loan.IGroup = JSON.parse (loan.IGroup_Json)[0], 
      //             loan.Location = JSON.parse (loan.Location_Json)[0], 
      //             loan.Scheme = JSON.parse (loan.Scheme_Json)[0], 
      //             loan.fileSource = loan.Images_Json ? JSON.parse (loan.Images_Json) : '';
      //   });
  

 
  if (this.Receipt.ReceiptSno === 0){
    let Trans  = new ClsReceipts(this.dataService);
    this.Receipt = Trans.Initialize();    
    this.Receipt.IsOpen = this.IsOpen;      
  }
  else{    
    this.Receipt.PaymentMode = JSON.parse ( JSON.stringify (this.Receipt.PaymentModes_Json));    
    let sln = new ClsLoans(this.dataService);
    sln.getLoanBySno(this.Receipt.Loan.LoanSno,0,0,0,0,0,0).subscribe(data =>{    
      this.SelectedLoan             = JSON.parse(data.apiData)[0];  
      this.SelectedLoan.IGroup      =   JSON.parse (this.SelectedLoan.IGroup_Json)[0],  
      this.SelectedLoan.Location    =   JSON.parse (this.SelectedLoan.Location_Json)[0],
      this.SelectedLoan.Scheme      =   JSON.parse (this.SelectedLoan.Scheme_Json)[0],
      this.SelectedLoan.Customer    =   JSON.parse (this.SelectedLoan.Party_Json)[0];           
      //this.SelectedLoan.fileSource =  JSON.parse(this.SelectedLoan.Images_Json);      
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


SaveReceipt(){     
    
  if (this.ValidateInputs() == false) {return};    

  if (this.Receipt.PaymentMode.length == 0){
    this.Receipt.PaymentMode.push ({"Ledger": this.PaymnentModeLedgers[0], "Amount" : this.Receipt.Nett_Payable})
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
        StrImageXml += " Image_Url='" + this.auth.getReceiptImagesServerPath() + "' ";           
        StrImageXml += " >";
        StrImageXml += "</Image_Details>";
      }      
    }   

    StrImageXml += "</Images>"
    StrImageXml += "</ROOT>";

  let Rec  = new ClsReceipts(this.dataService);
  Rec.Receipt = this.Receipt;    
  
  
  Rec.Receipt.Customer = Rec.Receipt.Loan.Customer;
  Rec.Receipt.ItemDetailXML   = StrItemXML;
  Rec.Receipt.ImageDetailXML  = StrImageXml;
  Rec.Receipt.PaymentModesXML = this.globals.GetPaymentModeXml(this.Receipt.PaymentMode, this.globals.VTypLoanReceipt);
  Rec.Receipt.fileSource      = this.Receipt.fileSource;
  Rec.Receipt.BranchSno       = this.auth.SelectedBranchSno();
  //Rec.Receipt.VouDetailXML = this.globals.GetReceiptVoucherXml(Rec.Receipt, this.StdLedgerList);

  Rec.saveReceipt().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          if (this.Receipt.ReceiptSno == 0) {this.alertService.CreateReceiptAlert(this.globals.AlertTypeNewReceipt, this.Receipt);}                    
          this.globals.SnackBar("info", this.Receipt.ReceiptSno == 0 ? "Receipt Created successfully" : "Receipt updated successfully");     
          this.router.navigate(['dashboard/receipts/' + this.IsOpen]);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    })
}

DeleteReceipt(){
  this.globals.QuestionAlert("Are you sure you wanto to delete this Receipt?").subscribe(Response => {      
    if (Response == 1){
      let ar = new ClsReceipts(this.dataService);
      ar.Receipt = this.Receipt;
      ar.deleteReceipt().subscribe(data => {
        if (data.queryStatus == 0)
        {
          this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
          return;
        }
        else{
          this.globals.SnackBar("info","Receipt deleted successfully");       
          this.router.navigate(['dashboard/Receipts']);   
        }
      })        
    }
  })
}

ValidateInputs(): boolean{                
  this.Receipt.Series          = this.SelectedSeries;
  this.Receipt.Loan           = this.SelectedLoan;  
  this.Receipt.fileSource      = this.TransImages;

  if (!this.Receipt.Series )  { this.SeriesValid = false; this.globals.SnackBar("error","Invalid Series...");  return false; }  else  {this.SeriesValid = true; }    
  if (!this.Receipt.Receipt_No.length )  { this.ReceiptNumberValid = false; this.globals.SnackBar("error","Invalid Receipt Number...");  return false; }  else  {this.ReceiptNumberValid = true; }    
  if (!this.Receipt.Loan || this.Receipt.Loan.LoanSno == 0 )  { this.LoanValid = false; this.globals.SnackBar("error","Invalid Loan...");  return false; }  else  {this.LoanValid = true; }    
  if (!this.Receipt.Nett_Payable || this.Receipt.Nett_Payable == 0 )  { this.NettPayableValid = false; this.globals.SnackBar("error","Invalid Nett Payable...");  return false; }  else  {this.NettPayableValid = true; }      
  return true;
} 
 
CalculateReceiptValues(){
  this.Receipt.Nett_Payable = +(+this.Receipt.Rec_Principal + +this.Receipt.Rec_Interest + +this.Receipt.Rec_Other_Credits + +this.Receipt.Rec_Other_Debits + +this.Receipt.Rec_Default_Amt + +this.Receipt.Rec_Add_Less).toFixed(2);
}

getAutoReceiptNumber(){
  let rec = new ClsReceipts(this.dataService);
  rec.getReceiptNumber(this.SelectedSeries.SeriesSno).subscribe(data => {        
    this.Receipt.Receipt_No = data.apiData;
  });
}

callGetLoan(){
  this.getLoan(this.SelectedLoan);
}

onSearchByBarCode(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.searchSubject.next(+input.value);
}

SearchbyLoanNo($event: string){
  this.searchSubjectLoanNo.next($event);    
}

SearchbyPartyName($event: string){
  this.searchSubjectPartyName.next($event);    
}

getLoan($event: TypeLoan){     
  this.SelectedLoan = $event;  
  this.IsEmiScheme = this.SelectedLoan.Scheme.Calc_Method == 3 ? true : false;
  this.InterestDetails = null!;
  this.InterestStructure = [];
 
  if (this.SelectedLoan && this.SelectedLoan.LoanSno)
  {
    this.SelectedCustomer = this.SelectedLoan.Customer;
    let rep = new ClsReports(this.dataService);  
      rep.getLoanDetailed(this.SelectedLoan.LoanSno, this.TillDate).subscribe(data => {
        this.InterestDetails = JSON.parse (data.apiData)[0];        
        this.InterestStructure = JSON.parse (this.InterestDetails.Struc_Json);    
      });

    this.Receipt.Rec_DueAmount = this.globals.RoundDigitsToNear (this.SelectedLoan.Emi_Due_Amt);
    this.Receipt.Rec_Principal = this.SelectedLoan.Emi_Principal;
    this.Receipt.Rec_Interest = this.SelectedLoan.Emi_Interest;
    this.CalculateEmiValues();
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
          let ln = new ClsLoans(this.dataService);
          ln.getLoanBySno(result.LoanSno,0,0,0,0,0,0).subscribe(data=>{
            this.SelectedLoan             = JSON.parse(data.apiData)[0];  
            this.SelectedLoan.IGroup      =   JSON.parse (this.SelectedLoan.IGroup_Json)[0],  
            this.SelectedLoan.Location    =   JSON.parse (this.SelectedLoan.Location_Json)[0],
            this.SelectedLoan.Scheme      =   JSON.parse (this.SelectedLoan.Scheme_Json)[0],
            this.SelectedLoan.Customer    =   JSON.parse (this.SelectedLoan.Party_Json)[0]; 
            this.getLoan(this.SelectedLoan);
          })          
          //this.getLoan(this.LoansList.filter((ln)=> ln.LoanSno === parseInt(result.LoanSno))[0]);
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
      this.getAutoReceiptNumber();
    }    
  // }  
}


getTransImages($event: FileHandle[]){    
  this.TransImages = $event;  
}

MultiPaymentModes(){
  if (this.Receipt.Nett_Payable == 0) { this.globals.SnackBar("error","Nett Payable is zero!!"); return; }
  const dialogRef = this.dialog.open(PaymodesComponent, 
    { 
      height:"100%",
      position:{"right":"0","top":"0" },
      data: {"Amount": this.Receipt.Nett_Payable, "PaymentModeList": this.Receipt.PaymentMode} ,
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {        
      if (result){  
        if (result){                    
          this.Receipt.PaymentMode = result;
        }        
      }      
    }); 
}

CalculateEmiValues(){
  this.Receipt.Rec_DueAmount = this.Receipt.Rec_DuesCount * this.SelectedLoan.Emi_Due_Amt;
  const DiffEmi = +this.SelectedLoan.Emi_Due_Amt -  (+this.SelectedLoan.Emi_Principal + +this.SelectedLoan.Emi_Interest);
  this.Receipt.Rec_Principal = this.Receipt.Rec_DuesCount * this.SelectedLoan.Emi_Principal;
  this.Receipt.Rec_Interest = this.Receipt.Rec_DuesCount * this.SelectedLoan.Emi_Interest;
  
  if (DiffEmi > 0 ){
    this.Receipt.Rec_Other_Credits =  DiffEmi * this.Receipt.Rec_DuesCount;
  }
  else{
    this.Receipt.Rec_Other_Debits =  DiffEmi * this.Receipt.Rec_DuesCount;
  }
  
  this.CalculateReceiptValues();
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

