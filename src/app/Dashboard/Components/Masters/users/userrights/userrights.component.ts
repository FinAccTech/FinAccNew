import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsUser, TypeUserRights } from 'src/app/Dashboard/Classes/ClsUsers';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

interface CompRights{ 
  CompSno : number;
  Checked: boolean;
} 

@AutoUnsubscribe
@Component({
  selector: 'app-userrights',
  templateUrl: './userrights.component.html',
  styleUrls: ['./userrights.component.scss']
})

export class UserrightsComponent implements OnInit {

  UserRights: TypeUserRights[] = [];
  
  constructor(
    public dialogRef: MatDialogRef<UserrightsComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: string,    
    private dataService: DataService,     
    private globals: GlobalsService   
  ) 
  { 
    if (data && data.length > 0){
      this.UserRights = JSON.parse (data);              
    }
    else{
      this.UserRights = [];
    }
  }

  ngOnInit(): void {    
    
    if (this.UserRights.length < 30){
      let usr = new ClsUser(this.dataService);
      this.UserRights = usr.GetDefaultRightList();
    }  
    else{
      this.UserRights.map(right=>{
        right.Form_Name = this.GetFormName(right.FormSno);
      })
    }    
  }

  SaveUserRights(){        
    this.CloseDialog()    
  }
 
  CloseDialog()  {
    this.dialogRef.close(this.UserRights);
  }

  GetFormName(FormSno: number): string {
    let FormName = "";
    switch (FormSno) {
      case 1:
          FormName = "Loans";
        break;    
      case 2:
        FormName = "Receipts";
      break;    
      case 3:
        FormName = "Redemptions";
      break;    
      case 4:
        FormName = "Auctions";
      break;    
      case 5:
        FormName = "ReLoan";
      break;    
      case 6:
        FormName = "OpeningLoan";
      break;    
      case 7:
        FormName = "OpeningReceipt";
      break;    
      case 8:
        FormName = "ItemGroups";
      break;    
      case 9:
        FormName = "Items";
      break;    
      case 10:
        FormName = "Customers";
      break;    
      case 11:
        FormName = "Suppliers";
      break;    
      case 12:
        FormName = "Purity";
      break;    
      case 13:
        FormName = "Areas";
      break;  
      case 14:
        FormName = "Schemes";
      break;    
      case 15:
        FormName = "Locations";
      break;    
      case 16:
        FormName = "Repledge";
      break;    
      case 17:
        FormName = "RpPayments";
      break;    
      case 18:
        FormName = "RpRedemption";
      break;    
      case 19:
        FormName = "LoanSummary";
      break;    
      case 20:
        FormName = "PartyHistory";
      break;    
      case 21:
        FormName = "Loan History";
      break;    
      case 22:
        FormName = "AuctionHistory";
      break;    

      case 23:
        FormName = "PendingReport";
      break;    
      case 24:
        FormName = "LedgerGroups";
      break;    
      case 25:
        FormName = "Ledgers";
      break;    
      case 26:
        FormName = "Vouchers";
      break; 
      case 27:
        FormName = "DayBook";
      break; 
      case 28:
        FormName = "GroupSummary";
      break; 
      case 29:
        FormName = "TrialBalance";
      break; 
      case 30:
        FormName = "ProfitandLoss";
      break; 
      case 31:
        FormName = "BalanceSheet";
      break;                   
      case 32:
        FormName = "DayHistory";
      break;  
      case 33:
        FormName = "SupplierHistory";
      break;                   
      case 34:
        FormName = "AgeAnalysis";
      break;                   
      case 35:
        FormName = "MarketValueAnalysis";
      break;                   
    }
    return FormName;
  }
  
SelectAll(){
  this.UserRights.map(right=>{
    right.View_Right = true;
    right.Create_Right = true;
    right.Edit_Right = true;
    right.Delete_Right = true;
    right.Print_Right = true;
    right.Search_Access = true;
    right.Date_Access = true;
  })
}

UnSelectAll(){
  this.UserRights.map(right=>{
    right.View_Right = false;
    right.Create_Right = false;
    right.Edit_Right = false;
    right.Delete_Right = false;
    right.Print_Right = false;
    right.Search_Access = false;
    right.Date_Access = false;
  })
}

ChangeSelectValue(right: TypeUserRights, $event: any, RightType: number){

  switch (RightType) {
    case this.globals.UserRightView:
      right.View_Right =   $event.target.checked;
      break;  
    case this.globals.UserRightCreate:
      right.Create_Right =   $event.target.checked;
      break;  
    case this.globals.UserRightEdit:
      right.Edit_Right =   $event.target.checked;
      break;  
    case this.globals.UserRightDelete:
      right.Delete_Right =   $event.target.checked;
      break;  
    case this.globals.UserRightPrint:
      right.Print_Right =   $event.target.checked;
      break;  
    case this.globals.UserRightDateAccess:
      right.Date_Access =   $event.target.checked;
      break;  
    case this.globals.UserRightSearchAccess:
      right.Search_Access =   $event.target.checked;
      break;  
  }
}
  
}

