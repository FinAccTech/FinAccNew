import { Component, input, OnInit } from '@angular/core';
import { LoanService } from '../loan.service';
import { Location,} from '@angular/common';
import { Router } from '@angular/router';
import { ClsParties, TypeParties } from 'src/app/Dashboard/Classes/ClsParties';
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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TypeAgent } from 'src/app/Dashboard/Classes/ClsAgents';
import { EmitableComponent } from 'src/app/Dashboard/widgets/emitable/emitable.component';
import { ApiDataService } from 'src/app/Services/api-data.service';
import { ImageUploadtoServerService } from 'src/app/Services/image-uploadto-server.service';


@Component({
  selector: 'app-loan',
  templateUrl: './loan.component.html',
  styleUrls: ['./loan.component.scss']
})

@AutoUnsubscribe
export class LoanComponent implements OnInit {

  private searchSubject = new Subject<number>();

  CustomersList:       TypeParties[] = [];
  SelectedCustomer!:    TypeParties;
  CustomerDetails!:     TypeCustomerDetailed;
  LoanDataAll!:            any[];
  LoanData!:            any[];

  VoucherSeriesList!:   TypeVoucherSeries[];
  SelectedSeries!:      TypeVoucherSeries;
  DefaultSeries!:       TypeVoucherSeries[];

  SchemesList:         TypeScheme[] = [];
  DataSchemesList:         TypeScheme[] = [];
  SelectedScheme!:      TypeScheme;

  GrpList:             TypeItemGroup[] = [];
  SelectedGrp!:         TypeItemGroup;

  LocationList:        TypeLocation[] = [];
  SelectedLocation!:    TypeLocation;

  AgentList:            TypeAgent[] = [];
  SelectedAgent!:        TypeAgent;
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
  LockPreviousDate: boolean = false;
  EnablePaymentProcess: boolean = false;
  StdRoi: boolean = false;

  DocChargesTax: number = 0;

  SaveImageasFile: boolean = false;

  constructor (  
                private globals: GlobalsService, 
                private auth: AuthService,
                private loanService: LoanService, 
                private dataService: DataService, 
                private router : Router,
                private location: Location,
                private dialog: MatDialog,
                private vouprint: VoucherprintService,
                private alertService: AlertsService, 
                private apidataService: ApiDataService,
                private imgUpload: ImageUploadtoServerService,
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

                this.searchSubject
                .pipe(
                  debounceTime(300), // Wait 300ms after user stops typing
                  distinctUntilChanged() // Only emit if the value is different from the last
                )
                .subscribe((searchText) => {                  
                  if (searchText < 1) {return;}
                  let pty = new ClsParties(this.dataService);  
                  pty.getParties(searchText,0,0,0,0).subscribe(data=>{
                    if (data.apiData){
                      this.getCustomer(JSON.parse(data.apiData)[0]);
                    }
                    else{
                      this.SelectedCustomer = pty.Initialize();
                      this.CustomerDetails = null!; 
                    }
                  })
                  // Add your search logic here
                });

              }

 ngOnInit(): void {  
    
  this.LockPreviousDate = this.globals.AppSetup()[0].Lock_PreviousDate == 1 ? true : false;
  this.EnablePaymentProcess = this.globals.AppSetup()[0].Enable_Payment_Process == 1 ? true : false;
  this.SaveImageasFile  = this.globals.AppSetup()[0].ImageUpload_ByFile == 1 ? true : false;

  let ln = new ClsLoans(this.dataService);
  ln.getLoanMasters().subscribe(data=>{
    
    this.VoucherSeriesList    = JSON.parse(data.apiData.SeriesList);
    this.DataSchemesList      = JSON.parse(data.apiData.SchemesList);
    this.SchemesList          = JSON.parse(data.apiData.SchemesList);    
    this.GrpList              = JSON.parse(data.apiData.ItemGroupsList);
    this.LocationList         = JSON.parse(data.apiData.LocationList);
    this.AgentList            = JSON.parse(data.apiData.AgentList);
    this.CustomersList        = JSON.parse(data.apiData.CustomerList);    
    this.PaymnentModeLedgers  = JSON.parse(data.apiData.PaymentModesList);
    this.StdLedgerList        = JSON.parse(data.apiData.StdLedgerList);

    if (this.Loan.LoanSno === 0){

      this.VoucherSeriesList = this.VoucherSeriesList.filter(vou=>{ return vou.Active_Status == true; })
      this.SchemesList = this.SchemesList.filter(sch=>{ return sch.Active_Status == true; })
      this.DataSchemesList = this.DataSchemesList.filter(sch=>{ return sch.Active_Status == true; })
      this.GrpList = this.GrpList.filter(grp=>{ return grp.Active_Status == 1; })
      this.LocationList = this.LocationList.filter(loc=>{ return loc.Active_Status == 1; })
      this.CustomersList = this.CustomersList.filter(cust=>{ return cust.BlackListed == false; })
      
      let Trans  = new ClsLoans(this.dataService);
      this.Loan = Trans.Initialize();      
      this.Loan.IsOpen = this.IsOpen;
      this.GridList = [{ "Item": {"ItemSno":0, "Item_Code": '', "Item_Name": '',"Name": ''} , "Qty":0, "Stone_Wt": 0, "Gross_Wt": 0, "Nett_Wt": 0, "Purity": { "PuritySno":0, "Purity_Code":"", "Purity_Name":"" }, "Item_Value": 0, "Remarks": "" }] ;    
      this.GridTotals = { TotQty:0, TotGrossWt: 0, TotNettWt: 0, TotPureWt:0, TotValue: 0};
  
      //Voucher Series
      this.DefaultSeries = this.VoucherSeriesList;
         this.DefaultSeries =  this.DefaultSeries.filter((obj) =>{
          return obj.IsDefault == true;
        })
        this.getSeries(this.DefaultSeries[0]);   

      //Schemes
      // this.SchemesList = this.DataSchemesList.filter(sch =>{
      //     return sch.Series!.SeriesSno == this.SelectedSeries.SeriesSno;
      //   })
                
      this.getScheme(this.SchemesList[0]);   
      
      //Item Groups
      this.getGroup(this.GrpList[0]);

      //Locations
      this.getLocation (this.LocationList[0]);

      //Agents
      this.getAgent(this.AgentList[0]);

      if (this.EnablePaymentProcess){
        this.Loan.Payment_Status = 0;
      }
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

      this.Loan.Agent = JSON.parse(this.Loan.Agent_Json!)[0]; 
      this.SelectedAgent = this.Loan.Agent;

      this.Loan.Customer = JSON.parse(this.Loan.Party_Json!)[0];       
      this.getCustomer(this.Loan.Customer);      

      this.Loan.PaymentMode = JSON.parse (this.Loan.PaymentModes_Json);
      
      this.GridList = JSON.parse (this.Loan.Items_Json);    
      
      if (this.Loan.Images_Json.trim() !== '' && JSON.parse (this.Loan.Images_Json).length > 0){
        this.TransImages =       JSON.parse (this.Loan.Images_Json);    
      }    
      this.GridTotals = { TotQty: this.Loan.TotQty , TotGrossWt: this.Loan.TotGrossWt, TotNettWt: this.Loan.TotNettWt, TotPureWt: this.Loan.TotPureWt, TotValue: this.Loan.Market_Value};
      this.IntAmtPerMonth = +((this.Loan.Principal * (this.Loan.Roi / 100 )) /12).toFixed(2);  
    }
  })     
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
  StrItemXML = "<ROOT>";
  StrItemXML += "<Transaction>";  
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
  StrItemXML += "</Transaction>";
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
  

  if (this.SaveImageasFile == false) {         
      Ln.Loan.fileSource      = this.TransImages;
  }
  
  Ln.Loan.BranchSno = this.auth.SelectedBranchSno();
  
  if (this.SelectedScheme.Calc_Method == 3){
    const OriginalEmi           = (+this.Loan.Principal + +(this.Loan.Principal * (this.Loan.Roi/100)) + this.Loan.DocChargesAmt ) / +this.SelectedScheme.EmiDues!;
    this.Loan.OrgEmi_Due_Amt    = OriginalEmi;
    this.Loan.Emi_Principal     = this.Loan.Principal / this.SelectedScheme.EmiDues!;
    this.Loan.Emi_Interest      = (this.Loan.Principal * (this.Loan.Roi/100)) / this.SelectedScheme.EmiDues!;     
  }

  Ln.saveLoan().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }        
        else{      
          
          if (this.Loan.LoanSno == 0) {            
            this.alertService.CreateLoanAlert(this.globals.AlertTypeNewLoan, this.Loan);
          }

          Ln.Loan.LoanSno = data.RetSno;
          Ln.Loan.Loan_No = Ln.Loan.Loan_No;

          if (this.SaveImageasFile == true) {     
            // let ImageFiles: File[] = [];
            // this.TransImages.forEach(img=>{
            //   ImageFiles.push(img.Image_FilesBlob);
            // })

            this.imgUpload.UploadImages( this.TransImages, "Loans",Ln.Loan.Loan_No!);
          }
          this.globals.SnackBar("info", this.Loan.LoanSno == 0 ? "Loan Created successfully" : "Loan updated successfully");   
          //this.apidataService.fetchData("1");  
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
  this.Loan.Agent           = this.SelectedAgent;
  //this.Loan.fileSource      = this.TransImages;

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

  if (this.Loan.TotQty == 0 || this.Loan.TotGrossWt == 0 || this.Loan.TotNettWt == 0 || this.Loan.TotPureWt == 0 || this.Loan.Market_Value == 0)
  {
    this.globals.SnackBar("error", "Weight Details or Market Values are missing in Item Details.");
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
  if (this.Loan.DocChargesPer && this.Loan.DocChargesPer !== 0){
    this.Loan.DocChargesAmt =  Math.round(this.Loan.Principal * (this.Loan.DocChargesPer / 100));  
    if (this.DocChargesTax !== 0) {
      this.Loan.DocChargesAmt += (this.Loan.DocChargesAmt * (this.DocChargesTax/100))
    }
  }  

  this.Loan.Nett_Payable = +(this.Loan.Principal - this.Loan.AdvIntAmt - this.Loan.DocChargesAmt);

  if (this.SelectedScheme.Calc_Method == 3){    
    this.Loan.Emi_Due_Amt  =  this.globals.RoundDigitsToNear ((+this.Loan.Principal + +(this.Loan.Principal * (this.Loan.Roi/100)) + this.Loan.DocChargesAmt ) / +this.SelectedScheme.EmiDues!);
    this.Loan.AdvIntAmt = this.Loan.Emi_Due_Amt * this.Loan.AdvIntDur;  
    this.Loan.Nett_Payable = +(this.Loan.Principal - (this.Loan.AdvIntDur * this.Loan.Emi_Due_Amt) - this.Loan.DocChargesAmt ).toFixed(2);
  }
}

ValidateDueAmount(){  
  
  if ((this.SelectedScheme.Calc_Method == 3) && (this.Loan.Emi_Due_Amt !==0) ){    
    if  (this.Loan.Emi_Due_Amt  < ((+this.Loan.Principal + +(this.Loan.Principal * (this.Loan.Roi/100)) + this.Loan.DocChargesAmt )/ +this.SelectedScheme.EmiDues!))
    {
      this.globals.SnackBar("error", "Invalid Due Amount");
      this.Loan.Emi_Due_Amt  =  (+this.Loan.Principal + +(this.Loan.Principal * (this.Loan.Roi/100)) + this.Loan.DocChargesAmt ) / +this.SelectedScheme.EmiDues!;
      this.Loan.AdvIntAmt = this.Loan.Emi_Due_Amt * this.Loan.AdvIntDur;  
      this.Loan.Nett_Payable = +(this.Loan.Principal - (this.Loan.AdvIntDur * this.Loan.Emi_Due_Amt)).toFixed(2);
      return;
    }
  }
  this.Loan.AdvIntAmt = this.Loan.Emi_Due_Amt * this.Loan.AdvIntDur;  
  this.Loan.Nett_Payable = +(this.Loan.Principal - (this.Loan.AdvIntDur * this.Loan.Emi_Due_Amt)).toFixed(2);
}

GetEmiTable(){
  const FromDate: Date = new Date( this.globals.IntToDate (this.Loan.Due_Start_Date));
  const PFreq: number = this.SelectedScheme.Payment_Frequency!;  
  const EmiDues: number = this.SelectedScheme.EmiDues!;  
  let DueAmt  = this.Loan.Emi_Due_Amt;
  const OriginalEmi  =  +((+this.Loan.Principal + +(this.Loan.Principal * (this.Loan.Roi/100)) + this.Loan.DocChargesAmt ) / +this.SelectedScheme.EmiDues!).toFixed(2);

  let TblArray = [];  
  let currentDate = FromDate;
  let ExcessAmt: number = 0;

  for (let index = 0; index < EmiDues; index++) {
    ExcessAmt += DueAmt- OriginalEmi
    if (index == EmiDues-1){
      DueAmt = this.globals.RoundDigitsToNear(DueAmt - ExcessAmt);
    }

    TblArray.push({ "DueDate": this.globals.IntToDateString( this.globals.DateToInt(currentDate)), "DueAmt": DueAmt, "OrgEmi": OriginalEmi });

    let tDate = currentDate;
    switch (PFreq) {
      case 0:        
        tDate.setDate(tDate.getDate()+1);
        currentDate = tDate;
        break;

      case 1:        
        tDate.setDate(tDate.getDate()+7);
        currentDate = tDate;
        break;

      case 2:
        tDate.setDate(tDate.getDate()+15);
        currentDate = tDate;
        break;

      case 3:
        tDate.setMonth(tDate.getMonth()+1);
        currentDate = tDate;
        break;
    }    
  }

  const dialogRef = this.dialog.open(EmitableComponent, 
    { 
      width:"35vw",
      height:"100vh",
      position:{"right":"0","top":"0" },
      data: TblArray,
    });    
    dialogRef.disableClose = true;
}


getAutoLoanNumber(){
  let ln = new ClsLoans(this.dataService);
  ln.getLoanNumber(this.SelectedSeries.SeriesSno).subscribe(data => {        
    this.Loan.Loan_No = data.apiData;
  });
} 


onSearchByBarCode(event: Event): void { 
  const input = event.target as HTMLInputElement;
  this.searchSubject.next(+input.value);
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
  this.LoanDataAll = [];
  this.LoanData = [];
  if(this.SelectedCustomer)
  {
  let rep = new ClsReports(this.dataService);
      rep.getCustomerDetailed(this.SelectedCustomer.PartySno).subscribe(data =>{        
        this.CustomerDetails = JSON.parse (data.apiData)[0];   
        this.LoanDataAll = JSON.parse(this.CustomerDetails.Loans_Json!);     
        this.LoanData = JSON.parse(this.CustomerDetails.Loans_Json!);     
        
        if(this.LoanData)
        {
          this.LoanData = this.LoanData.filter(ln =>{
            return  (ln.Approval_Status == this.globals.ApprovalStatusApproved) 
                    && 
                    (ln.Cancel_Status == this.globals.CancelStatusNotCancelled) 
                    && 
                    ((ln.Loan_Status == this.globals.LoanStatusOpen) || (ln.Loan_Status == this.globals.LoanStatusMatured));
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

  const BranchesList = JSON.parse (sessionStorage.getItem("sessionBranchesList")!);     
    
  if  (BranchesList.length < 2){
    this.SchemesList = this.DataSchemesList.filter(sch =>{
      return sch.Series!.SeriesSno == this.SelectedSeries.SeriesSno;
    })
  }

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
     
  this.StdRoi = this.SelectedScheme.IsStdRoi!;
  
  if (this.Loan.LoanSno == 0 ){
    this.Loan.Roi = this.SelectedScheme.Roi!;   
    this.Loan.AdvIntDur = this.SelectedScheme.AdvanceMonth!;
    this.Loan.DocChargesPer = parseFloat(this.SelectedScheme.ProcessingFeePer!.toString());      
    this.Loan.DocChargesAmt = this.SelectedScheme.Doc_Charges!;      
    this.DocChargesTax = this.SelectedScheme.Tax_Per!;
  }  
  else{
    if (this.FirstTimeLoaded == false){
      this.Loan.Roi = this.SelectedScheme.Roi!;   
      this.Loan.AdvIntDur = this.SelectedScheme.AdvanceMonth!;
      this.Loan.DocChargesPer = parseFloat(this.SelectedScheme.ProcessingFeePer!.toString());              
      this.Loan.DocChargesAmt = this.SelectedScheme.Doc_Charges!;      
      this.DocChargesTax = this.SelectedScheme.Tax_Per!;
    }
    this.FirstTimeLoaded = false;
  }

  this.SchemeMaxper = this.SelectedScheme.Max_MarketValue!;  
  this.SetMatureDate();
  this.CalculateLoanValues();
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

getNewAgent($event: TypeAgent){
  if ($event){
    this.AgentList.push ($event);
    this.getAgent($event); 
  }
}

getAgent($event: TypeAgent){    
  this.SelectedAgent = $event;
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
    this.Loan.TotPureWt = this.GridTotals.TotPureWt;
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
  
  if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series "); return; }
    else { this.vouprint.PrintVoucher(trans, 12 ,trans.Series.Print_Style!);}
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
    });  

 
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

