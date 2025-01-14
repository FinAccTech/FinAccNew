import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Auth/login/login.component';
//import { CanActivate, AuthGuard } from './Auth/auth-guard';
import { DashboardComponent } from './Dashboard/dashboard.component';
import { IndexpageComponent } from './Dashboard/Components/indexpage/indexpage.component';
import { ItemgroupsComponent } from './Dashboard/Components/Masters/itemgroups/itemgroups.component';
import { ItemsComponent } from './Dashboard/Components/Masters/items/items.component';
import { PuritiesComponent } from './Dashboard/Components/Masters/purities/purities.component';
import { AreasComponent } from './Dashboard/Components/Masters/areas/areas.component';
import { SchemesComponent } from './Dashboard/Components/Masters/schemes/schemes.component';
import { LocationsComponent } from './Dashboard/Components/Masters/locations/locations.component';
import { PartiesComponent } from './Dashboard/Components/Masters/parties/parties.component';
import { LoansComponent } from './Dashboard/Components/Transactions/loans/loans.component';
import { LoanComponent } from './Dashboard/Components/Transactions/loans/loan/loan.component';
import { ReceiptsComponent } from './Dashboard/Components/Transactions/receipts/receipts.component';
import { ReceiptComponent } from './Dashboard/Components/Transactions/receipts/receipt/receipt.component';
import { LoansummaryComponent } from './Dashboard/Components/Reports/loansummary/loansummary.component';

import { AppsetupComponent } from './Dashboard/Components/Settings/appsetup/appsetup.component';
import { VoucherserieslistComponent } from './Dashboard/Components/Settings/voucherserieslist/voucherserieslist.component';
import { RedemptionsComponent } from './Dashboard/Components/Transactions/redemptions/redemptions.component';
import { RedemptionComponent } from './Dashboard/Components/Transactions/redemptions/redemption/redemption.component';
import { LoanhistoryComponent } from './Dashboard/Components/Reports/loanhistory/loanhistory.component';
import { AuctionhistoryComponent } from './Dashboard/Components/Reports/auctionhistory/auctionhistory.component';
import { PendingreportComponent } from './Dashboard/Components/Reports/pendingreport/pendingreport.component';
import { AuctionentriesComponent } from './Dashboard/Components/Transactions/auctionentries/auctionentries.component';
import { AuctionentryComponent } from './Dashboard/Components/Transactions/auctionentries/auctionentry/auctionentry.component';
import { ReloansComponent } from './Dashboard/Components/Transactions/reloans/reloans.component';
import { ReloanComponent } from './Dashboard/Components/Transactions/reloans/reloan/reloan.component';
import { UsersComponent } from './Dashboard/Components/Masters/users/users.component';
import { LedgergroupsComponent } from './Dashboard/Components/Accounts/ledgergroups/ledgergroups.component';
import { LedgersComponent } from './Dashboard/Components/Accounts/ledgers/ledgers.component';
import { DaybookComponent } from './Dashboard/Components/Accounts/daybook/daybook.component';
import { VouchersComponent } from './Dashboard/Components/Accounts/vouchers/vouchers.component';
import { VoucherComponent } from './Dashboard/Components/Accounts/vouchers/voucher/voucher.component';
import { PrintsetupComponent } from './Dashboard/Components/Settings/printsetup/printsetup.component';
import { TrialbalanceComponent } from './Dashboard/Components/Accounts/trialbalance/trialbalance.component';
import { BalancesheetComponent } from './Dashboard/Components/Accounts/balancesheet/balancesheet.component';
import { GroupsummaryComponent } from './Dashboard/Components/Accounts/groupsummary/groupsummary.component';
import { ProfitandlossComponent } from './Dashboard/Components/Accounts/profitandloss/profitandloss.component';
import { AuthGuard } from './Auth/auth.guard';
import { CompGuard } from './Auth/comp.guard';
import { DeactivateGuard } from './Auth/deactivate.guard';
import { RightsGuard } from './Auth/rights.guard';
import { VoucherpostingComponent } from './Dashboard/Components/Settings/voucherposting/voucherposting.component';
import { AlertssetupComponent } from './Dashboard/Components/Settings/alertssetup/alertssetup.component';
import { DayhistoryComponent } from './Dashboard/Components/Reports/dayhistory/dayhistory.component';
import { RepledgesComponent } from './Dashboard/Components/Transactions/repledges/repledges.component';
import { RepledgeComponent } from './Dashboard/Components/Transactions/repledges/repledge/repledge.component';
import { RppaymentsComponent } from './Dashboard/Components/Transactions/rppayments/rppayments.component';
import { RppaymentComponent } from './Dashboard/Components/Transactions/rppayments/rppayment/rppayment.component';
import { RpclosuresComponent } from './Dashboard/Components/Transactions/rpclosures/rpclosures.component';
import { RpclosureComponent } from './Dashboard/Components/Transactions/rpclosures/rpclosure/rpclosure.component';
import { CustomerhistoryComponent } from './Dashboard/Components/Reports/partyhistory/customerhistory.component';
import { SupplierhistoryComponent } from './Dashboard/Components/Reports/supplierhistory/supplierhistory.component';

import { AgeAnalysisComponent } from './Dashboard/Components/Reports/age-analysis/age-analysis.component';
import { AlertHistoryComponent } from './Dashboard/Components/Reports/alert-history/alert-history.component';
import { MarketValueAnalysisComponent } from './Dashboard/Components/Reports/marketvalueanalysis/marketvalueanalysis.component';
import { IntStatement1percentComponent } from './Dashboard/Components/Reports/int-statement1percent/int-statement1percent.component';
import { HomeComponent } from './Home/home/home.component';



const routes: Routes = [
  // { path:'', component: LoginComponent}, 
  { path:'', component: HomeComponent},
  { path:'dashboard', component: DashboardComponent,canActivate: [AuthGuard], canDeactivate: [DeactivateGuard],

    children:[
      { path:'', component: IndexpageComponent},                                     
      { path:'loans/:isopen', component: LoansComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno": 1 } },      
      { path:'loan', component: LoanComponent, canActivate:[AuthGuard, CompGuard] },          
      { path:'receipts/:isopen', component: ReceiptsComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":2} },     
      { path:'receipt', component: ReceiptComponent, canActivate:[AuthGuard, CompGuard] },     
      
      { path:'redemptions', component: RedemptionsComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":3} },     
      { path:'redemptions/:redemption', component: RedemptionComponent, canActivate:[AuthGuard, CompGuard] },     

      { path:'repledges/:isopen', component: RepledgesComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno": 16 } },      
      { path:'repledge', component: RepledgeComponent, canActivate:[AuthGuard, CompGuard] },  
      { path:'rppayments/:isopen', component: RppaymentsComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno": 17 } },      
      { path:'rppayment', component: RppaymentComponent, canActivate:[AuthGuard, CompGuard] },  
      { path:'rpclosures', component: RpclosuresComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":18} },     
      { path:'rpclosures/:rpclosure', component: RpclosureComponent, canActivate:[AuthGuard, CompGuard] },     
      { path:'supplierhistory', component: SupplierhistoryComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":33} },     

      { path:'auctions', component: AuctionentriesComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":4} },      
      { path:'auctions/auction', component: AuctionentryComponent, canActivate:[AuthGuard, CompGuard] },      

      { path:'reloans', component: ReloansComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":5} },      
      { path:'reloans/reloan', component: ReloanComponent, canActivate:[AuthGuard, CompGuard],},    

      { path:'itemgroups', component: ItemgroupsComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":8}  },     
      { path:'items', component: ItemsComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":9} },     
      { path:'parties/:partycat', component: PartiesComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":10} },
      { path:'purities', component: PuritiesComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":12} },    
      { path:'areas', component: AreasComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":13} },    
      { path:'schemes', component: SchemesComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":14} },    
      { path:'locations', component: LocationsComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":15} },    
            
      { path:'ledgergroups', component: LedgergroupsComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":24} },     
      { path:'ledgers', component: LedgersComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":25} },     
      { path:'vouchers', component: VouchersComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":26} },     
      { path:'vouchers/:voucher', component: VoucherComponent, canActivate:[AuthGuard, CompGuard] },    

      { path:'daybook', component: DaybookComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":27} },     
      { path:'groupsummary', component: GroupsummaryComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":28} },     
      { path:'trialbalance', component: TrialbalanceComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":29} },     
      { path:'profitandloss', component: ProfitandlossComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":30} },     
      { path:'balancesheet', component: BalancesheetComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":31} },     

      { path:'dayhistory', component: DayhistoryComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":32} },     
      { path:'loansummary', component: LoansummaryComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":19} },     
      { path:'customerhistory', component: CustomerhistoryComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":20} },     
      { path:'loanhistory', component: LoanhistoryComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":21} },     
      { path:'auctionhistory', component: AuctionhistoryComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno":22} }, 
      { path:'pendingreport', component: PendingreportComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno": 23} }, 
      { path:'ageanalysis', component: AgeAnalysisComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno": 34 }}, 
      { path:'marketvalueanalysis', component: MarketValueAnalysisComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno": 35 }},       
      { path:'intstatementcustom', component: IntStatement1percentComponent, canActivate:[AuthGuard, CompGuard, RightsGuard], data:{"FormSno": 36 }}, 
      
      { path:'appsetup', component: AppsetupComponent, canActivate:[AuthGuard, CompGuard],data:{"adminCheck":true} },     
      { path:'voucherseries', component: VoucherserieslistComponent, canActivate:[AuthGuard, CompGuard],data:{"adminCheck":true} },        
      { path:'users', component: UsersComponent, canActivate:[AuthGuard, CompGuard],data:{"adminCheck":true}},    
      { path:'printsetup', component: PrintsetupComponent, canActivate:[AuthGuard, CompGuard],data:{"printSetupCheck":true}},    
      { path:'alertsetup', component: AlertssetupComponent, canActivate:[AuthGuard, CompGuard],data:{"admincheck":true}}, 
      { path:'alerthistory', component: AlertHistoryComponent, canActivate:[AuthGuard, CompGuard],data:{"adminCheck":true} },              
      { path:'voucherposting', component: VoucherpostingComponent, canActivate:[AuthGuard, CompGuard],data:{"adminCheck":true}},    
      
  ]},  
];

@NgModule({  
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AuthGuard, CompGuard, RightsGuard],
  
})

export class AppRoutingModule { 
  
}

