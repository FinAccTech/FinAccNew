import { Component, OnInit } from '@angular/core';
import { LoanService } from '../loan.service';
import { Location,} from '@angular/common';
import { Router } from '@angular/router';
import { TypeParties } from 'src/app/Dashboard/Classes/ClsParties';
import { TypeVoucherSeries } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { ClsSchemes, TypeScheme } from 'src/app/Dashboard/Classes/ClsSchemes';
import { TypeItemGroup } from 'src/app/Dashboard/Classes/ClsItemGroups';
import { TypeLocation } from 'src/app/Dashboard/Classes/ClsLocations';
import { TypeGridItem } from 'src/app/Dashboard/Types/TypeGridItem';
import { TypeLoanGridTotals } from 'src/app/Dashboard/Types/TypeLoanGridTotals';
import { FileHandle } from 'src/app/Dashboard/Types/file-handle';
import { ClsLoans, TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { GlobalsService } from 'src/app/Services/globals.service';
import { DataService } from 'src/app/Services/data.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ClsReports, TypeCustomerDetailed } from 'src/app/Dashboard/Classes/ClsReports';
import { AddPrincipalComponent } from '../../../add-principal/add-principal.component';
import { MatDialog } from '@angular/material/dialog';
import { StatusupdateComponent } from 'src/app/Dashboard/widgets/statusupdate/statusupdate.component';
import { PaymodesComponent } from 'src/app/Dashboard/widgets/paymodes/paymodes.component';
import { TypeLedger } from 'src/app/Dashboard/Classes/ClsLedgers';
import { VoucherprintService } from 'src/app/Services/voucherprint.service';
import { AlertsService } from 'src/app/Services/alerts.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAlertSetup } from 'src/app/Dashboard/Classes/ClsAlertsSetup';


@Component({
  selector: 'app-loan',
  templateUrl: './loan.component.html',
  styleUrls: ['./loan.component.scss']
})

@AutoUnsubscribe
export class LoanComponent implements OnInit {

  CustomersList!:       TypeParties[];
  SelectedCustomer!:    TypeParties;
  CustomerDetails!:     TypeCustomerDetailed;
  LoanData!:            any[];

  VoucherSeriesList!:   TypeVoucherSeries[];
  SelectedSeries!:      TypeVoucherSeries;
  DefaultSeries!:       TypeVoucherSeries[];

  SchemesList!:         TypeScheme[];
  DataSchemesList!:         TypeScheme[];
  SelectedScheme!:      TypeScheme;

  GrpList!:             TypeItemGroup[];
  SelectedGrp!:         TypeItemGroup;

  LocationList!:        TypeLocation[];
  SelectedLocation!:    TypeLocation;

  //PaymentModesList:     TypePayMode[] = [];
  PaymnentModeLedgers:  TypeLedger[] = [];

  StdLedgerList:       TypeLedger[] = [];

  GridList!:            TypeGridItem[];   
  GridTotals!:          TypeLoanGridTotals;

  TransImages:          FileHandle[] = [];

  Loan!:                TypeLoan;
  IntAmtPerMonth:       number = 0;
  
  MappedScheme: boolean  = false;
  AutoSeriesNo: boolean = false;
  FirstTimeLoaded: boolean = true;

  // For Validations  
  SeriesValid:        boolean = true;
  LoanNumberValid:    boolean = true;
  LoadnDateValid:     boolean = true;
  CustomerValid:      boolean = true;
  SchemeValid:        boolean = true;
  GrpValid:           boolean = true;
  TotQtyValid:        boolean = true;
  TotGrossWtValid:    boolean = true;
  TotNettWtValid:     boolean = true;
  MarketValueValid:   boolean = true;
  PrincipalValid:     boolean = true;
  IntRateValid:       boolean = true;
  MatureDateValid:    boolean = true;
  LocationValid:      boolean = true;

  ItemDetailsValid:   boolean = true;

  // For Calculating Market Value
  SchemeMaxper: number = 0;
  LoanPerGram: number = 0;
  
  IsOpen: number = 0;

  
  constructor (  
                private globals: GlobalsService, 
                private auth: AuthService,
                private loanService: LoanService, 
                private dataService: DataService, 
                private router : Router,
                private location: Location,
                private dialog: MatDialog,
                private vouprint: VoucherprintService,
                private alertService: AlertsService
              )
              {           
                this.Loan = loanService.getLoan();                  
                if (!this.Loan){
                  this.router.navigate(['dashboard/loans/' + sessionStorage.getItem("loanIsOpen")]);
                  return;
                }   
                else{
                  this.IsOpen = this.Loan.IsOpen;
                }
              }

 ngOnInit(): void {  
    
  let ln = new ClsLoans(this.dataService);
  ln.getLoanMasters().subscribe(data=>{
    
    this.VoucherSeriesList = JSON.parse(data.apiData.SeriesList);
    this.DataSchemesList = JSON.parse(data.apiData.SchemesList);
    this.SchemesList = JSON.parse(data.apiData.SchemesList);
    this.GrpList = JSON.parse(data.apiData.ItemGroupsList);
    this.LocationList = JSON.parse(data.apiData.LocationList);
    this.CustomersList = JSON.parse(data.apiData.CustomerList);    
    this.PaymnentModeLedgers = JSON.parse(data.apiData.PaymentModesList);
    this.StdLedgerList = JSON.parse(data.apiData.StdLedgerList);

    if (this.Loan.LoanSno === 0){
      let Trans  = new ClsLoans(this.dataService);
      this.Loan = Trans.Initialize();      
      this.Loan.IsOpen = this.IsOpen;
      this.GridList = [{ "Item": {"ItemSno":0, "Item_Code": '', "Item_Name": '',"Name": ''} , "Qty":0, "Stone_Wt": 0, "Gross_Wt": 0, "Nett_Wt": 0, "Purity": { "PuritySno":0, "Purity_Code":"", "Purity_Name":"" }, "Item_Value": 0, "Remarks": "" }] ;    
      this.GridTotals = { TotQty:0, TotGrossWt: 0, TotNettWt: 0, TotValue: 0};
  
      //Voucher Series
      this.DefaultSeries = this.VoucherSeriesList;
         this.DefaultSeries =  this.DefaultSeries.filter((obj) =>{
          return obj.IsDefault == true;
        })
        this.getSeries(this.DefaultSeries[0]);   

      //Schemes
      this.SchemesList = this.DataSchemesList.filter(sch =>{
          return sch.Series!.SeriesSno == this.SelectedSeries.SeriesSno;
        })
        this.getScheme(this.SchemesList[0]);   
      
      //Item Groups
      this.getGroup(this.GrpList[0]);

      //Locations
      this.getLocation (this.LocationList[0]);
    }
    else
    {
      this.Loan.Series = JSON.parse(this.Loan.Series_Json!)[0]; 
      this.SelectedSeries = this.Loan.Series;

      this.Loan.Scheme = JSON.parse(this.Loan.Scheme_Json!)[0]; 
      this.SelectedScheme = this.Loan.Scheme;

      this.Loan.IGroup = JSON.parse(this.Loan.Group_Json!)[0]; 
      this.SelectedGrp = this.Loan.IGroup;

      this.Loan.Location = JSON.parse(this.Loan.Location_Json!)[0]; 
      this.SelectedLocation = this.Loan.Location;

      this.Loan.Customer = JSON.parse(this.Loan.Party_Json!)[0];       
      this.getCustomer(this.Loan.Customer);      

      this.Loan.PaymentMode = JSON.parse (this.Loan.PaymentModes_Json);
      //this.PaymentModesList = JSON.parse (this.Loan.PaymentModes_Json);
            

      this.GridList = JSON.parse (this.Loan.Items_Json);                    

      if (this.Loan.Images_Json.trim() !== '' && JSON.parse (this.Loan.Images_Json).length > 0){
        this.TransImages =       JSON.parse (this.Loan.Images_Json);    
      }    
      this.GridTotals = { TotQty: this.Loan.TotQty , TotGrossWt: this.Loan.TotGrossWt, TotNettWt: this.Loan.TotNettWt, TotValue: this.Loan.Market_Value};
    }
  })

  
  // let ser = new ClsVoucherSeries(this.dataService);
  // ser.getVoucherSeries(0,this.globals.VTypLoanPayment).subscribe(data=> {
  //   if (data.queryStatus == 0){
  //     this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
  //     return;
  //   }
  //   else{
  //     this.VoucherSeriesList = JSON.parse (data.apiData);
      
  //     if (this.Loan.LoanSno === 0)
  //     {
  //       this.DefaultSeries = JSON.parse (data.apiData);        
  //        this.DefaultSeries =  this.DefaultSeries.filter((obj) =>{
  //         return obj.IsDefault == true;
  //       })
  //       this.getSeries(this.DefaultSeries[0]);        
  //     }
  //     else
  //     {   
  //       this.SelectedSeries = this.Loan.Series;
  //     }     
  //   }
  // }, 
  // error => {
  //   this.globals.ShowAlert(this.globals.DialogTypeError,error);
  //   return;             
  // });
  
  // let sch = new ClsSchemes(this.dataService);
  // sch.getSchemes(0,).subscribe(data=> {
  //   if (data.queryStatus == 0){
  //     this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
  //     return;
  //   }
  //   else{
  //     this.DataSchemesList = JSON.parse (data.apiData);
  //     this.SchemesList = this.DataSchemesList;
  //     this.SchemesList = this.DataSchemesList.filter(sch =>{
  //       return sch.Series!.SeriesSno == this.SelectedSeries.SeriesSno;
  //     })
  //     if (this.Loan.LoanSno === 0)
  //     {
  //       this.getScheme(this.SchemesList[0]);        
  //     }
  //     else
  //     {
  //       this.getScheme(this.Loan.Scheme);
  //     }      
  //   }
  // },
  // error => {
  //   this.globals.ShowAlert(this.globals.DialogTypeError,error);
  //   return;             
  // });

  // let grp = new ClsItemGroups(this.dataService);    
  // grp.getItemGroups(0).subscribe( data => {        
  //   if (data.queryStatus == 0){
  //     this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
  //   }
  //   else{      
  //     this.GrpList = JSON.parse (data.apiData);
  //     if (this.Loan.LoanSno === 0)
  //     {        
  //       this.getGroup(this.GrpList[0]);
  //     }
  //     else
  //     {
  //      this.getGroup (this.Loan.IGroup);
  //     }
  //   }
  // },
  // error => {
  //   this.globals.ShowAlert(this.globals.DialogTypeError, error);      
  // });

  // let loc = new ClsLocations(this.dataService);    
  // loc.getLocations(0).subscribe( data => {        
  //   if (data.queryStatus == 0){
  //     this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
  //   }
  //   else{      
  //     this.LocationList = JSON.parse (data.apiData);
  //     if (this.Loan.LoanSno == 0)
  //     {
  //       //this.SelectedLocation = this.LocationList[0];
  //       this.getLocation (this.LocationList[0]);
  //     }
  //     else
  //     {
  //       // this.SelectedLocation = this.Loan.Location;        
  //       this.getLocation(this.Loan.Location);
  //     }
  //   }
  // },
  // error => {
  //   this.globals.ShowAlert(this.globals.DialogTypeError, error);      
  // });

  // let pty = new ClsParties(this.dataService);    
  // pty.getParties(0,this.globals.PartyTypCustomers,0,0,0).subscribe( data => {        
  //   if (data.queryStatus == 0){
  //     this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
  //   }
  //   else{      
  //     this.CustomersList = JSON.parse (data.apiData);
      
  //     if (this.Loan.LoanSno !==0)
  //     {
  //       this.SelectedCustomer = this.Loan.Customer;
  //     }      
  //   }
  // },
  // error => {
  //   this.globals.ShowAlert(this.globals.DialogTypeError, error);      
  // }); 
  
  // let led = new ClsLedgers(this.dataService);
  // led.getPaymentModes().subscribe(data=>{
  //   this.PaymnentModeLedgers = JSON.parse(data.apiData);
  // });
  // let led = new ClsLedgers(this.dataService);
  // led.getPaymentModes().subscribe(data =>{
  //   this.PaymentModes = JSON.parse (data.apiData);
  // })
   
}

SaveLoan(){      
  if (this.Loan.LoanSno !== 0){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLoans, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
  }
  

  if (this.ValidateInputs() == false) {return};    

  if (this.Loan.PaymentMode.length == 0){
    this.Loan.PaymentMode.push ({"Ledger": this.PaymnentModeLedgers[0], "Amount" : this.Loan.Nett_Payable})
  }
  
  var StrItemXML: string = "";  
  StrItemXML = "<ROOT>"
  StrItemXML += "<Transaction>"  
  for (var i=0; i < this.GridList.length; i++)
  {
      StrItemXML += "<Transaction_Details ";
      StrItemXML += " ItemSno='" + this.GridList[i].Item.ItemSno + "' ";                 
      StrItemXML += " Qty='" + this.GridList[i].Qty + "' ";             
      StrItemXML += " GrossWt='" + this.GridList[i].Gross_Wt + "' ";             
      StrItemXML += " StoneWt='" + 0 + "' ";             
      StrItemXML += " NettWt='" + this.GridList[i].Nett_Wt + "' ";             
      StrItemXML += " PuritySno='" + this.GridList[i].Purity.PuritySno + "' ";             
      StrItemXML += " ItemValue='" + this.GridList[i].Item_Value + "' ";             
      StrItemXML += " IteRemarks='" + this.GridList[i].Remarks + "' ";             
      StrItemXML += " >";
      StrItemXML += "</Transaction_Details>";    
  }   
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
        StrImageXml += " Image_Url='" + this.auth.getLoanImagesServerPath() + "' ";           
        StrImageXml += " >";
        StrImageXml += "</Image_Details>";
      }      
    }   
    StrImageXml += "</Images>"
    StrImageXml += "</ROOT>";

  let Ln  = new ClsLoans(this.dataService);
  Ln.Loan = this.Loan;  
  Ln.Loan.ItemDetailXML   = StrItemXML;
  Ln.Loan.ImageDetailXML  = StrImageXml;    
  Ln.Loan.PaymentModesXML = this.globals.GetPaymentModeXml(this.Loan.PaymentMode, this.globals.VTypLoanPayment);
  
  Ln.Loan.fileSource      = this.Loan.fileSource;
  Ln.Loan.BranchSno = this.auth.SelectedBranchSno;
  //Ln.Loan.VouDetailXML = this.globals.GetLoanVoucherXml(Ln.Loan, this.StdLedgerList);

  Ln.saveLoan().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }        
        else{      
          
          if (this.Loan.LoanSno == 0) {this.alertService.CreateLoanAlert(this.globals.AlertTypeNewLoan, this.Loan);}

          this.globals.SnackBar("info", this.Loan.LoanSno == 0 ? "Loan Created successfully" : "Loan updated successfully");     
          this.router.navigate(['dashboard/loans/' + this.IsOpen]);  
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    })
}

DeleteLoan(){
  this.globals.QuestionAlert("Are you sure you wanto to delete this Loan?").subscribe(Response => {      
    if (Response == 1){
      let ar = new ClsLoans(this.dataService);
      ar.Loan = this.Loan;
      ar.deleteLoan().subscribe(data => {
        if (data.queryStatus == 0)
        {
          this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
          return;
        }
        else{
          this.globals.SnackBar("info","Loan deleted successfully");       
          this.router.navigate(['dashboard/loans']);   
        }
      })        
    }
  })
}

ValidateInputs(): boolean{                
  this.Loan.Series          = this.SelectedSeries;
  this.Loan.Customer        = this.SelectedCustomer;
  this.Loan.Scheme          = this.SelectedScheme;
  this.Loan.IGroup          = this.SelectedGrp;
  this.Loan.Location        = this.SelectedLocation;
  this.Loan.fileSource      = this.TransImages;

  if (!this.Loan.Series )  { this.SeriesValid = false; this.globals.SnackBar("error","Invalid Series...");  return false; }  else  {this.SeriesValid = true; }    
  if (!this.Loan.Loan_No.length )  { this.LoanNumberValid = false; this.globals.SnackBar("error","Invalid Loan Number...");  return false; }  else  {this.LoanNumberValid = true; }    

  if (!this.Loan.Customer || this.Loan.Customer.PartySno == 0 )  { this.CustomerValid = false; this.globals.SnackBar("error","Invalid Customer...");  return false; }  else  {this.CustomerValid = true; }    
  if (!this.Loan.Scheme || this.Loan.Scheme.SchemeSno == 0 )  { this.SchemeValid = false; this.globals.SnackBar("error","Invalid Scheme...");  return false; }  else  {this.SchemeValid = true; }    
  if (!this.Loan.IGroup || this.Loan.IGroup.GrpSno == 0)  { this.GrpValid = false;  this.globals.SnackBar("error","Invalid Item Group..."); return false; }  else  {this.GrpValid = true; }    

  if(!this.GridList){
    this.globals.SnackBar("error", "Invalid Item Details");
    return false;
  }
  
  let InvalidItems = false;
   this.GridList.forEach((item) =>{
    if  (!item.Item || item.Item.ItemSno == 0){     
      InvalidItems =  true;
    }    
  })

  if (InvalidItems) {
    this.globals.SnackBar("error", "Item not selected properly for 1 or more items");
    return false;
  }

  let InvalidPurity = false;
   this.GridList.forEach((item) =>{
    if  (!item.Purity || item.Purity.PuritySno == 0){     
      InvalidPurity =  true;
    }    
  })

  if (InvalidPurity) {
    this.globals.SnackBar("error", "Purity not selected properly for 1 or more items");
    return false;
  }

  if (this.Loan.TotQty == 0 || this.Loan.TotGrossWt == 0 || this.Loan.TotNettWt == 0 || this.Loan.Market_Value == 0)
  {
    this.globals.SnackBar("error", "Invalid Item Details");
    return false;
  }

  if (!this.Loan.Principal || this.Loan.Principal == 0)  
    { 
      this.PrincipalValid = false;  
      this.globals.SnackBar("error","Invalid Loan Amount...");  
      return false; 
    }  
    else  {this.PrincipalValid = true; }    

  if (this.Loan.Principal > this.Loan.Market_Value ) {
    if (this.SelectedCustomer.Allow_More_Value == 1){
      this.PrincipalValid = true;
    }
    else{
      this.PrincipalValid = false; 
      this.globals.SnackBar("error","Loan Amount cannot be greater than the market value...");  
      return false; 
    }
  }


  
  if (!this.Loan.Roi || this.Loan.Roi == 0) {this.IntRateValid =false; this.globals.SnackBar("error","Interest Rate cannot be zero"); return false;  } else { this.IntRateValid = true;}
  //if (!this.Loan.Market_Value.length )  { this.LoanNumberValid = false;  return false; }  else  {this.LoanNumberValid = true; }    

  if (!this.Loan.Location || this.Loan.Location.LocationSno == 0 )  { this.LocationValid = false; this.globals.SnackBar("error","Invalid Location...");  return false; }  else  {this.LocationValid = true; }    
  return true;
} 

CalculateLoanValues(){
  if (this.Loan.Principal == 0) { return; }  
  this.IntAmtPerMonth = +((this.Loan.Principal * (this.Loan.Roi / 100 )) /12).toFixed(2);  
  this.Loan.AdvIntAmt = this.IntAmtPerMonth * this.Loan.AdvIntDur;  
  this.Loan.DocChargesAmt =  Math.round(this.Loan.Principal * (this.Loan.DocChargesPer / 100));
  this.Loan.Nett_Payable = +(this.Loan.Principal - this.Loan.AdvIntAmt - this.Loan.DocChargesAmt).toFixed(2);
}

getAutoLoanNumber(){
  let ln = new ClsLoans(this.dataService);
  ln.getLoanNumber(this.SelectedSeries.SeriesSno).subscribe(data => {        
    this.Loan.Loan_No = data.apiData;
  });
} 

// getNewCustomer($event: TypeParties){
//   let pty = new ClsParties(this.dataService);
//   pty.getParties(0,this.globals.PartyTypCustomers, 0, 0, 0 ).subscribe(data =>{
//     this.CustomersList = JSON.parse(data.apiData);
//     this.getCustomer($event);
//   })

// }

getCustomer($event: TypeParties){     
  
  this.SelectedCustomer = $event;
  this.CustomerDetails = null!; 
  this.LoanData = [];
  if(this.SelectedCustomer)
  {
  let rep = new ClsReports(this.dataService);
      rep.getCustomerDetailed(this.SelectedCustomer.PartySno).subscribe(data =>{        
        this.CustomerDetails = JSON.parse (data.apiData)[0];                
        this.LoanData = JSON.parse(this.CustomerDetails.Loans_Json!);     

        if(this.LoanData)
        {
          this.LoanData = this.LoanData.filter(ln =>{
            return  (ln.Approval_Status == this.globals.ApprovalStatusApproved) 
                    && 
                    (ln.Cancel_Status == this.globals.CancelStatusNotCancelled) 
                    && 
                    (ln.Loan_Status == this.globals.LoanStatusOpen || ln.Loan_Status == this.globals.LoanStatusMatured);
          })
        }
      })
    }
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
      this.getAutoLoanNumber();
    // }    
  }

  this.SchemesList = this.DataSchemesList.filter(sch =>{
    return sch.Series!.SeriesSno == this.SelectedSeries.SeriesSno;
  })
  if (this.Loan.LoanSno === 0)
  {
    this.getScheme(this.SchemesList[0]);        
  }
  else
  {
    this.getScheme(this.Loan.Scheme);
  }      
  
  if (this.SelectedSeries.MapScheme){
    this.MappedScheme = true;
    this.SelectedScheme = this.SelectedSeries.MapScheme;    
  }
  else{
    this.MappedScheme = false;
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
  
  if (this.Loan.LoanSno == 0 ){
    this.Loan.Roi = this.SelectedScheme.Roi!;   
    this.Loan.AdvIntDur = this.SelectedScheme.AdvanceMonth!;
    this.Loan.DocChargesPer = parseFloat(this.SelectedScheme.ProcessingFeePer!.toString());      
  }  
  else{
    if (this.FirstTimeLoaded == false){
      this.Loan.Roi = this.SelectedScheme.Roi!;   
      this.Loan.AdvIntDur = this.SelectedScheme.AdvanceMonth!;
      this.Loan.DocChargesPer = parseFloat(this.SelectedScheme.ProcessingFeePer!.toString());              
    }
    this.FirstTimeLoaded = false;
  }

  this.SchemeMaxper = this.SelectedScheme.Max_MarketValue!;  
  this.SetMatureDate();
}

getNewGroup($event: TypeItemGroup){
  if ($event){
    this.GrpList.push($event);
    this.getGroup($event);
  }
}
getGroup($event: TypeItemGroup){    
  this.SelectedGrp = $event;
  this.LoanPerGram = this.SelectedGrp.Loan_PerGram!;
}  

getNewLocation($event: TypeLocation){
  if ($event){
    this.LocationList.push ($event);
    this.getLocation($event);
  }
}

getLocation($event: TypeLocation){    
  this.SelectedLocation = $event;
}

SetMatureDate(){
  let tDate = new Date( this.globals.IntToDate(this.Loan.Loan_Date) );
  tDate.setFullYear(tDate.getFullYear() + this.SelectedScheme.LpYear! );
  tDate.setMonth(tDate.getMonth() + this.SelectedScheme.LpMonth!);
  tDate.setDate(tDate.getDate() + this.SelectedScheme.LpDays!);   
  this.Loan.Mature_Date = this.globals.DateToInt(tDate);  
}

GetRoi($event: any){
  const amt =  $event.target.value;    
  if (this.CheckMinMaxLoanValues(amt) == false) { $event.target.value = 0; return; }
  if (this.SelectedScheme.Enable_AmtSlab == false && this.SelectedScheme.Enable_FeeSlab == false ) { return;}

    let sch = new ClsSchemes(this.dataService);    
    sch.getRoiforAmoount(this.SelectedScheme.SchemeSno, amt).subscribe(data => {            
        if (JSON.parse(data.apiData).length < 1) {return}        
        this.Loan.Roi = (JSON.parse (data.apiData)[0].Roi);
        if (this.SelectedScheme.Enable_FeeSlab){
          this.Loan.DocChargesPer = (JSON.parse (data.apiData)[0].FeePer);        
        }        
        this.CalculateLoanValues();
    })  
    
}

CheckMinMaxLoanValues(amount: number) : boolean {
  if ((this.SelectedScheme.Min_LoanValue !== 0) && (amount <  this.SelectedScheme.Min_LoanValue!) ) { this.globals.SnackBar("error","Loan Amount is less than the Minimum value of the Scheme"); return false }
  if ((this.SelectedScheme.Max_LoanValue !== 0) && (amount >  this.SelectedScheme.Max_LoanValue!) ) { this.globals.SnackBar("error","Loan Amount is more than the Minimum value of the Scheme"); return false }
  return true;
}


getGridDetails($event: TypeGridItem[]){    
  this.GridList = $event;  
}

getGridTotals($event: TypeLoanGridTotals){    
  this.GridTotals = $event;
  if (this.GridTotals){
    this.Loan.TotQty = this.GridTotals.TotQty;
    this.Loan.TotGrossWt = this.GridTotals.TotGrossWt;
    this.Loan.TotNettWt = this.GridTotals.TotNettWt;
    this.Loan.Market_Value = this.GridTotals.TotValue;
  }
}

getTransImages($event: FileHandle[]){    
  this.TransImages = $event;  
}

DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
}

AddPrincipal(){
    
  const dialogRef = this.dialog.open(AddPrincipalComponent, 
    {         
      // width:'50vw',
      data: { "LoanSno":this.Loan.LoanSno, "Loan_Date": this.Loan.Loan_Date },
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {        
      if (result){
        
      }
      
    }); 
}

PrintTransaction(trans: TypeLoan){    
  if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLoans, this.globals.UserRightPrint)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
  if (trans.Approval_Status == this.globals.ApprovalStatusUnApproved){
    this.globals.SnackBar("error","UnApproved Loans cannot be printed... ")
    return;
  }
  // let ser = new ClsVoucherSeries(this.dataService);
  // trans.Series = JSON.parse(trans.Series_Json)[0];
  // trans.Customer = JSON.parse(trans.Party_Json)[0];
  // trans.Scheme = JSON.parse(trans.Scheme_Json)[0];
  // trans.IGroup = JSON.parse(trans.IGroup_Json)[0];
  // trans.Location = JSON.parse(trans.Location_Json)[0];
  
  if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series "); return; }
    else { this.vouprint.PrintVoucher(trans, 12 ,trans.Series.Print_Style!);}

  // if (trans.Series.Print_Style !== "") {
  //   this.vouprint.Style_Loan_Pgf(trans, trans.Series.Print_Style!);
  // }
}

ApproveLoan(){
  const dialogRef = this.dialog.open(StatusupdateComponent, 
    {         
      width:'40vw',
      data: { "LoanSno":this.Loan.LoanSno, "Updation_Type": 1, "Document_Type": 1 },
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {        
      if (result){
        this.Loan.Approval_Status = this.globals.ApprovalStatusApproved;
        if (result == true){
          this.PrintTransaction(this.Loan);
        }
        this.router.navigate(['dashboard/loans/' + this.IsOpen ]); 
      }
      // if (result == true){                   
      //     this.Loan.Approval_Status = this.globals.ApprovalStatusApproved;
      //     this.router.navigate(['dashboard/loans']); 
      // }      
    });  

  // this.globals.QuestionAlert("Are you sure you want to Approve this Loan?").subscribe(data =>{
  //   if (data == 0) { return; }
  //   let ln = new ClsLoans(this.dataService);
  //   ln.approveLoan(this.Loan.LoanSno).subscribe(data =>{
  //       if (data.queryStatus == 0){
  //         this.globals.ShowAlert(3,"Error Approving Loan!!")
  //       }
  //       else{
  //         this.globals.SnackBar("info","Loan Approved Sucecssfully");
  //         this.Loan.Approval_Status = 1;
  //       }
  //   })
  //   });  
}

CancelLoan(){
  const dialogRef = this.dialog.open(StatusupdateComponent, 
    {         
      width:'40vw',
      data: { "LoanSno":this.Loan.LoanSno, "Updation_Type": 2, "Document_Type": 1 },
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {        
      if (result){        
        if (result == true){          
          this.Loan.Cancel_Status = this.globals.CancelStatusCancelled;
        }
        
      }      
    }); 
  // this.globals.QuestionAlert("Are you sure you want to Cancel this Loan?").subscribe(data =>{
  //   if (data == 0) { return; }
  //   let ln = new ClsLoans(this.dataService);
  //   ln.cancelLoan(this.Loan.LoanSno, '').subscribe(data =>{
  //       if (data.queryStatus == 0){
  //         this.globals.ShowAlert(3,"Error Cancelling Loan!!")
  //       }
  //       else{
  //         this.globals.SnackBar("info","Loan Cancelled Sucecssfully");
  //         this.Loan.Cancel_Status = 1;
  //       }
  //   })
  //   });  
}

MultiPaymentModes(){
  if (this.Loan.Nett_Payable == 0) { this.globals.SnackBar("error","Nett Payable is zero!!"); return; }
  const dialogRef = this.dialog.open(PaymodesComponent, 
    { 
      height:"100%",
      position:{"right":"0","top":"0" },
      data: {"Amount": this.Loan.Nett_Payable, "PaymentModeList": this.Loan.PaymentMode} ,
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {        
      if (result){  
        if (result){                    
          this.Loan.PaymentMode = result;
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

  GetStatusColor(ln: TypeLoan){
    return ln.Loan_Status == this.globals.LoanStatusOpen ? 'green' :  ln.Loan_Status == this.globals.LoanStatusClosed ? '#6e6c6c' : ln.Loan_Status == this.globals.LoanStatusMatured ? 'red' : 'black';
  }
}

