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
  import { ClsReports, TypeInterestDetails, TypeInterestStructure } from 'src/app/Dashboard/Classes/ClsReports';
  import { MatDialog } from '@angular/material/dialog';
  import { LoanSelectionComponent } from 'src/app/Dashboard/widgets/loan-selection/loan-selection.component';
import { AuctionService } from '../auction.service';
import { ClsAuctionEntries, TypeAuctionEntry } from 'src/app/Dashboard/Classes/ClsAuctionEntries';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ApiDataService } from 'src/app/Services/api-data.service';
  
  @Component({
    selector: 'app-auctionentry',
  templateUrl: './auctionentry.component.html',
  styleUrls: ['./auctionentry.component.scss']
  })

  @AutoUnsubscribe
  export class AuctionentryComponent implements OnInit {
  
    LoansList!:       TypeLoan[];
    SelectedLoan!:    TypeLoan;
  
    CustomersList!:       TypeParties[];
    SelectedCustomer!:    TypeParties;
  
    VoucherSeriesList!:   TypeVoucherSeries[];
    SelectedSeries!:      TypeVoucherSeries;
    DefaultSeries!:       TypeVoucherSeries[];
  
    TransImages:          FileHandle[] = [];
  
    Auction!:                TypeAuctionEntry;  
    
    
    InterestDetails!: TypeInterestDetails;
    InterestStructure: TypeInterestStructure[] = [];
  
    AutoSeriesNo: boolean = false;

    // For Validations  
    SeriesValid:        boolean = true;
    AuctionNumberValid:    boolean = true;
    AuctionDateValid:     boolean = true;
    TillDateValid:     boolean = true;
    LoanValid:      boolean = true;
    NettPayableValid: boolean = true; 
  
    constructor (  
                  private globals: GlobalsService, 
                  private auth: AuthService,
                  private auctionservice: AuctionService, 
                  private dataService: DataService, 
                  private router : Router,
                  private location: Location,
                  private dialog: MatDialog,
                  private apidataService: ApiDataService
                )
                {           
                  this.Auction = auctionservice.getAuction();     
                  if (!this.Auction){
                    this.router.navigate(['dashboard/auctions']);
                    return;
                  }   
                }
  
   ngOnInit(): void {     
    
    let ser = new ClsVoucherSeries(this.dataService);
    ser.getVoucherSeries(0,this.globals.VTypAuctionEntry).subscribe(data=> {
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{
        this.VoucherSeriesList = JSON.parse (data.apiData);
        
        if (this.Auction.AuctionSno === 0)
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
          this.getSeries(this.Auction.Series);          
        }     
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });

    
      this.LoansList = this.apidataService.getLoansList();
      this.LoansList.filter(ln=>{
        return ln.Loan_Status == this.globals.LoanStatusMatured;
      })
          this.LoansList.map(loan => {        
          return  loan.IGroup       =   JSON.parse (loan.IGroup_Json)[0],  
                    loan.Location   =   JSON.parse (loan.Location_Json)[0],
                    loan.Scheme     =   JSON.parse (loan.Scheme_Json)[0],
                    loan.Customer   =   JSON.parse (loan.Party_Json)[0], 
                    loan.fileSource =   loan.Images_Json ? JSON.parse (loan.Images_Json) : '';
          });
    
    
    // let ln = new ClsLoans(this.dataService);
    // ln.getLoans(0,0,0,this.globals.LoanStatusMatured,this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans ).subscribe(data=> {
    //   if (data.queryStatus == 0){
    //     this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
    //     return;
    //   }
    //   else{
    //     this.LoansList = JSON.parse (data.apiData);
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
   
    if (this.Auction.AuctionSno === 0){
      let Trans  = new ClsAuctionEntries(this.dataService);
      this.Auction = Trans.Initialize();          
    }
    else{    
      let sln = new ClsLoans(this.dataService);
      sln.getLoanBySno(this.Auction.Loan.LoanSno,0,0,0,0,0,0).subscribe(data =>{    
        this.SelectedLoan           = JSON.parse(data.apiData)[0];  
        this.SelectedLoan.IGroup    =   JSON.parse (this.SelectedLoan.IGroup_Json)[0],  
        this.SelectedLoan.Location   =   JSON.parse (this.SelectedLoan.Location_Json)[0],
        this.SelectedLoan.Scheme     =   JSON.parse (this.SelectedLoan.Scheme_Json)[0],
        this.SelectedLoan.Customer   =   JSON.parse (this.SelectedLoan.Party_Json)[0],           
        this.SelectedLoan.fileSource =  JSON.parse(this.SelectedLoan.Images_Json);
      })
    }
  }
  
  SaveAuction(){    
      
    // if (this.Loan.PaymentMode.length == 0){
    //   this.Loan.PaymentMode.push ({"Ledger": this.PaymnentModeLedgers[0], "Amount" : this.Loan.Nett_Payable})
    // }
    if (this.ValidateInputs() == false) {return};    
  
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
          StrImageXml += " Image_Url='" + "" + "' ";           
          StrImageXml += " >";
          StrImageXml += "</Image_Details>";
        }      
      }   
  
      StrImageXml += "</Images>"
      StrImageXml += "</ROOT>"; 
  
    let Rec  = new ClsAuctionEntries(this.dataService);
    Rec.Auction = this.Auction;        
    Rec.Auction.ItemDetailXML  = null!;
    Rec.Auction.ImageDetailXML  = StrImageXml;
    Rec.Auction.fileSource      = this.Auction.fileSource;
    Rec.Auction.BranchSno = this.auth.SelectedBranchSno();
  
    Rec.saveAuction().subscribe(data => {
          if (data.queryStatus == 0) {
            this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
            return;
          }
          else{                              
            this.globals.SnackBar("info", this.Auction.AuctionSno == 0 ? "Auction Created successfully" : "Auction updated successfully");     
            this.router.navigate(['dashboard/Auctions']);
          }
      }, 
      error => {
        this.globals.ShowAlert(this.globals.DialogTypeError, error);
      })
  }
  
  DeleteAuction(){
    this.globals.QuestionAlert("Are you sure you wanto to delete this Auction?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsAuctionEntries(this.dataService);
        ar.Auction = this.Auction;
        ar.deleteAuction().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Auction deleted successfully");       
            this.router.navigate(['dashboard/Auctions']);   
          }
        })        
      }
    })
  }
  
  ValidateInputs(): boolean{                
    this.Auction.Series          = this.SelectedSeries;
    this.Auction.Loan           = this.SelectedLoan;  
    this.Auction.fileSource      = this.TransImages;
  
    if (!this.Auction.Series )  { this.SeriesValid = false; this.globals.SnackBar("error","Invalid Series...");  return false; }  else  {this.SeriesValid = true; }    
    if (!this.Auction.Auction_No.length )  { this.AuctionNumberValid = false; this.globals.SnackBar("error","Invalid Auction Number...");  return false; }  else  {this.AuctionNumberValid = true; }    
    if (!this.Auction.Loan || this.Auction.Loan.LoanSno == 0 )  { this.LoanValid = false; this.globals.SnackBar("error","Invalid Loan...");  return false; }  else  {this.LoanValid = true; }    
    if (!this.Auction.Auction_Amount || this.Auction.Auction_Amount == 0 )  { this.NettPayableValid = false; this.globals.SnackBar("error","Invalid Nett Payable...");  return false; }  else  {this.NettPayableValid = true; }      
    return true;
  } 
  
  CalculateAuctionValues(){
//    this.Auction.Nett_Payable = +(this.Auction.Rec_Principal + this.Auction.Rec_Interest + this.Auction.Rec_Other_Credits + this.Auction.Rec_Other_Debits + this.Auction.Rec_Default_Amt + this.Auction.Rec_Add_Less).toFixed(2);
  }
  
  getAutoAuctionNumber(){
    let rec = new ClsAuctionEntries(this.dataService);
    rec.getAuctionNumber(this.SelectedSeries.SeriesSno).subscribe(data => {        
      this.Auction.Auction_No = data.apiData;
    });
  }
  
  getLoan($event: TypeLoan){      
    this.SelectedLoan = $event;  
    this.InterestDetails = null!;
    this.InterestStructure = [];
    if (this.SelectedLoan && this.SelectedLoan.LoanSno){
      let rep = new ClsReports(this.dataService);  
      rep.getLoanDetailed(this.SelectedLoan.LoanSno, this.Auction.Auction_Date).subscribe(data => {
        this.InterestDetails = JSON.parse (data.apiData)[0];        
        this.InterestStructure = JSON.parse (this.InterestDetails.Struc_Json);    
      });
    }  
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
  
  getSeries($event: TypeVoucherSeries){    
    this.SelectedSeries = $event;
    this.AutoSeriesNo = this.SelectedSeries.Num_Method == 2 ? true : false;
    // if (this.SelectedSeries !== $event ){
      if ($event.Num_Method !== 0){
        this.getAutoAuctionNumber();
      }    
    // }  
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
  
  