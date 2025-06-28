import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { WebcamModule } from 'ngx-webcam';

/* *********************** ANGULAR MATERIAL LIBRARIES *******************************/
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import { MatFormFieldModule,}     from '@angular/material/form-field';
import { MatSelectModule}         from '@angular/material/select';
import { MatTableModule}          from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule }          from '@angular/material/icon';
import {MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule} from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule} from '@angular/material/checkbox';
/* **********************************************************************************/

import { WebcamComponent } from './GlobalWidgets/webcam/webcam.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './Auth/login/login.component';
import { DashboardComponent } from './Dashboard/dashboard.component';
import { SidenavComponent } from './Dashboard/sidenav/sidenav.component';
import { HeaderComponent } from './Dashboard/header/header.component';
import { BodyComponent } from './Dashboard/body/body.component';
import { CompaniesComponent } from './Dashboard/Components/companies/companies.component';
import { IntToDatePipe } from './Dashboard/Pipes/int-to-date.pipe';

import { MsgboxComponent } from './GlobalWidgets/msgbox/msgbox.component';
import { SnackbarComponent } from './GlobalWidgets/snackbar/snackbar.component';
import { IndexpageComponent } from './Dashboard/Components/indexpage/indexpage.component';
import { ItemgroupsComponent } from './Dashboard/Components/Masters/itemgroups/itemgroups.component';
import { ItemgroupComponent } from './Dashboard/Components/Masters/itemgroups/itemgroup/itemgroup.component';
import { ItemsComponent } from './Dashboard/Components/Masters/items/items.component';
import { ItemComponent } from './Dashboard/Components/Masters/items/item/item.component';
import { PuritiesComponent } from './Dashboard/Components/Masters/purities/purities.component';
import { PurityComponent } from './Dashboard/Components/Masters/purities/purity/purity.component';
import { SelectionlistComponent } from './Dashboard/widgets/selectionlist/selectionlist.component';
import { AreasComponent } from './Dashboard/Components/Masters/areas/areas.component';
import { AreaComponent } from './Dashboard/Components/Masters/areas/area/area.component';
import { SchemesComponent } from './Dashboard/Components/Masters/schemes/schemes.component';
import { SchemeComponent } from './Dashboard/Components/Masters/schemes/scheme/scheme.component';
import { LocationsComponent } from './Dashboard/Components/Masters/locations/locations.component';
import { LocationComponent } from './Dashboard/Components/Masters/locations/location/location.component';
import { PartiesComponent } from './Dashboard/Components/Masters/parties/parties.component';
import { PartyComponent } from './Dashboard/Components/Masters/parties/party/party.component';
import { ProgressComponent } from './Dashboard/widgets/progress/progress.component';
import { ImagesComponent } from './Dashboard/widgets/images/images.component';
import { CompanyComponent } from './Dashboard/Components/companies/company/company.component';
import { LoansComponent } from './Dashboard/Components/Transactions/loans/loans.component';
import { LoanComponent } from './Dashboard/Components/Transactions/loans/loan/loan.component';
import { PartyselectionComponent } from './Dashboard/widgets/partyselection/partyselection.component';
import { PartycardComponent } from './Dashboard/widgets/partycard/partycard.component';
import { ItemdetailsComponent } from './Dashboard/widgets/itemdetails/itemdetails.component';
import { MatSortModule } from '@angular/material/sort';
import { NumberInputDirective } from './Dashboard/Directives/NumberInput';
import { ReceiptsComponent } from './Dashboard/Components/Transactions/receipts/receipts.component';
import { ReceiptComponent } from './Dashboard/Components/Transactions/receipts/receipt/receipt.component';

import { SlabsComponent } from './Dashboard/widgets/slabs/slabs.component';
import { AddPrincipalComponent } from './Dashboard/Components/add-principal/add-principal.component';
import { LoanSelectionComponent } from './Dashboard/widgets/loan-selection/loan-selection.component';
import { LoansummaryComponent } from './Dashboard/Components/Reports/loansummary/loansummary.component';
import { CustomerdetailsComponent } from './Dashboard/widgets/customerdetails/customerdetails.component';
import { LoandetailsComponent } from './Dashboard/widgets/loandetails/loandetails.component';

import { AppsetupComponent } from './Dashboard/Components/Settings/appsetup/appsetup.component';
import { VoucherserieslistComponent } from './Dashboard/Components/Settings/voucherserieslist/voucherserieslist.component';
import { VoucherseriesComponent } from './Dashboard/Components/Settings/voucherserieslist/voucherseries/voucherseries.component';
import { RedemptionsComponent } from './Dashboard/Components/Transactions/redemptions/redemptions.component';
import { RedemptionComponent } from './Dashboard/Components/Transactions/redemptions/redemption/redemption.component';
import { LoanhistoryComponent } from './Dashboard/Components/Reports/loanhistory/loanhistory.component';
import { AuctionhistoryComponent } from './Dashboard/Components/Reports/auctionhistory/auctionhistory.component';
import { PendingreportComponent } from './Dashboard/Components/Reports/pendingreport/pendingreport.component';
import { AuctionentriesComponent } from './Dashboard/Components/Transactions/auctionentries/auctionentries.component';
import { AuctionentryComponent } from './Dashboard/Components/Transactions/auctionentries/auctionentry/auctionentry.component';
import { StatusupdateComponent } from './Dashboard/widgets/statusupdate/statusupdate.component';
import { ReloansComponent } from './Dashboard/Components/Transactions/reloans/reloans.component';
import { ReloanComponent } from './Dashboard/Components/Transactions/reloans/reloan/reloan.component';
import { UsersComponent } from './Dashboard/Components/Masters/users/users.component';
import { UserComponent } from './Dashboard/Components/Masters/users/user/user.component';
import { LedgergroupsComponent } from './Dashboard/Components/Accounts/ledgergroups/ledgergroups.component';
import { LedgergroupComponent } from './Dashboard/Components/Accounts/ledgergroups/ledgergroup/ledgergroup.component';
import { LedgersComponent } from './Dashboard/Components/Accounts/ledgers/ledgers.component';
import { PaymodesComponent } from './Dashboard/widgets/paymodes/paymodes.component';
import { DaybookComponent } from './Dashboard/Components/Accounts/daybook/daybook.component';
import { VouchersComponent } from './Dashboard/Components/Accounts/vouchers/vouchers.component';
import { VoucherComponent } from './Dashboard/Components/Accounts/vouchers/voucher/voucher.component';
import { PrintsetupComponent } from './Dashboard/Components/Settings/printsetup/printsetup.component';
import { TrialbalanceComponent } from './Dashboard/Components/Accounts/trialbalance/trialbalance.component';
import { BalancesheetComponent } from './Dashboard/Components/Accounts/balancesheet/balancesheet.component';
import { GroupsummaryComponent } from './Dashboard/Components/Accounts/groupsummary/groupsummary.component';
import { ProfitandlossComponent } from './Dashboard/Components/Accounts/profitandloss/profitandloss.component';
import { UserrightsComponent } from './Dashboard/Components/Masters/users/userrights/userrights.component';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { VoucherpostingComponent } from './Dashboard/Components/Settings/voucherposting/voucherposting.component';
import { AlertssetupComponent } from './Dashboard/Components/Settings/alertssetup/alertssetup.component';
import { AlerttemplateComponent } from './Dashboard/widgets/alerttemplate/alerttemplate.component';
import { CustomHttpInterceptor } from './http-interceptor';
import { DayhistoryComponent } from './Dashboard/Components/Reports/dayhistory/dayhistory.component';
import { MatTableExporterModule } from 'mat-table-exporter';
import { LedgerComponent } from './Dashboard/Components/Accounts/ledgers/ledger/ledger.component';
import { RepledgesComponent } from './Dashboard/Components/Transactions/repledges/repledges.component';
import { RepledgeComponent } from './Dashboard/Components/Transactions/repledges/repledge/repledge.component';
import { SearchPipe } from './Dashboard/Pipes/search.pipe';
import { RppaymentsComponent } from './Dashboard/Components/Transactions/rppayments/rppayments.component';
import { RppaymentComponent } from './Dashboard/Components/Transactions/rppayments/rppayment/rppayment.component';
import { RepledgecardComponent } from './Dashboard/widgets/repledgecard/repledgecard.component';
import { RpclosuresComponent } from './Dashboard/Components/Transactions/rpclosures/rpclosures.component';
import { RpclosureComponent } from './Dashboard/Components/Transactions/rpclosures/rpclosure/rpclosure.component';
import { SupplierhistoryComponent } from './Dashboard/Components/Reports/supplierhistory/supplierhistory.component';
import { CustomerhistoryComponent } from './Dashboard/Components/Reports/partyhistory/customerhistory.component';
import { HomeComponent } from './Home/home/home.component';
import { SiteheaderComponent } from './Home/siteheader/siteheader.component';
import { SitebodyComponent } from './Home/sitebody/sitebody.component';
import { SimplifyComponent } from './Home/simplify/simplify.component';
import { SiteschemesComponent } from './Home/siteschemes/siteschemes.component';
import { SitemodulesComponent } from './Home/sitemodules/sitemodules.component';
import { SitecashflowComponent } from './Home/sitecashflow/sitecashflow.component';
import { SiterepledgeComponent } from './Home/siterepledge/siterepledge.component';
import { SitemobileappComponent } from './Home/sitemobileapp/sitemobileapp.component';
import { AlertconfirmationComponent } from './Dashboard/widgets/alertconfirmation/alertconfirmation.component';
import { AgeAnalysisComponent } from './Dashboard/Components/Reports/age-analysis/age-analysis.component';
import { AlertHistoryComponent } from './Dashboard/Components/Reports/alert-history/alert-history.component';
import { MarketValueAnalysisComponent } from './Dashboard/Components/Reports/marketvalueanalysis/marketvalueanalysis.component';
import { IntStatement1percentComponent } from './Dashboard/Components/Reports/int-statement1percent/int-statement1percent.component';
import { EverysizeComponent } from "./Home/everysize/everysize.component";
import { AutomationComponent } from './Home/automation/automation.component';
import { TestimonialsComponent } from './Home/testimonials/testimonials.component';
import { ContactComponent } from "./Home/contact/contact.component";
import { PricingComponent } from './Home/pricing/pricing.component';
import { RepledgesummaryComponent } from './Dashboard/Components/Reports/repledgesummary/repledgesummary.component';
import { RepledgehistoryComponent } from './Dashboard/Components/Reports/repledgehistory/repledgehistory.component';
import { AgentsComponent } from './Dashboard/Components/Masters/agents/agents.component';
import { AgentComponent } from './Dashboard/Components/Masters/agents/agent/agent.component';
import { LogindefaultComponent } from './Auth/logindefault/logindefault.component';
import { LoginpennyComponent } from './Auth/loginpenny/loginpenny.component';
import { RepledgeauctionhistoryComponent } from './Dashboard/Components/Reports/repledgeauctionhistory/repledgeauctionhistory.component';
import { BranchComponent } from './Dashboard/Components/Settings/branchdivisions/branch/branch.component';
import { DivisionComponent } from './Dashboard/Components/Settings/branchdivisions/division/division.component';
import { BusinessregisterComponent } from './Dashboard/Components/Reports/businessregister/businessregister.component';
import { IntToMonthYear } from './Dashboard/Pipes/int-to-monthyear.pipe';
import { DailyRegisterComponent } from './Dashboard/widgets/daily-register/daily-register.component';
import { ImportdataComponent } from './Dashboard/Components/Settings/importdata/importdata.component';
import { LazyLoadOnVisibleDirective } from './Dashboard/Directives/lazy-load-on-visible.directive';
import { IntstatementViewComponent } from './Dashboard/widgets/intstatement-view/intstatement-view.component';
import { TableviewComponent } from './Dashboard/widgets/tableview/tableview.component';
import FileSaver from 'file-saver';
import { AucnoticesVelsamyComponent } from './Dashboard/Components/Custom/aucnotices-velsamy/aucnotices-velsamy.component';
import { LoanhistoryBrgoldComponent } from './Dashboard/Components/Custom/loanhistory-brgold/loanhistory-brgold.component';
import { CustomDayHistoryFS2025061361Component } from './Dashboard/Components/Custom/custom-day-history-fs2025061361/custom-day-history-fs2025061361.component';

@NgModule({ declarations: [                
        LazyLoadOnVisibleDirective,
        NumberInputDirective,
        AppComponent,
        IntToDatePipe,
        IntToMonthYear,
        DashboardComponent,
        SidenavComponent,
        HeaderComponent,
        BodyComponent,
        LoginComponent,
        LogindefaultComponent,
        LoginpennyComponent,
        CompaniesComponent,
        WebcamComponent,
        MsgboxComponent,
        SnackbarComponent,
        IndexpageComponent,
        ItemgroupsComponent,
        ItemgroupComponent,
        ItemsComponent,
        ItemComponent,
        PuritiesComponent,
        PurityComponent,
        SelectionlistComponent,
        AreasComponent,
        AreaComponent,
        SchemesComponent,
        SchemeComponent,
        LocationsComponent,
        LocationComponent,
        PartiesComponent,
        PartyComponent,
        ProgressComponent,
        ImagesComponent,
        CompanyComponent,
        LoansComponent,
        LoanComponent,
        PartyselectionComponent,
        PartycardComponent,
        ItemdetailsComponent,
        ReceiptsComponent,
        ReceiptComponent,
        IntstatementViewComponent,
        SlabsComponent,
        AddPrincipalComponent,
        LoanSelectionComponent,
        LoansummaryComponent,
        CustomerdetailsComponent,
        LoandetailsComponent,
        CustomerhistoryComponent,
        AppsetupComponent,
        VoucherserieslistComponent,
        VoucherseriesComponent,
        RedemptionsComponent,
        RedemptionComponent, LoanhistoryComponent, AuctionhistoryComponent, PendingreportComponent, AuctionentriesComponent, AuctionentryComponent, StatusupdateComponent,
        ReloansComponent, ReloanComponent, UsersComponent, UserComponent, LedgergroupsComponent, LedgergroupComponent, LedgersComponent, LedgerComponent, PaymodesComponent, 
        DaybookComponent, VouchersComponent, VoucherComponent, PrintsetupComponent, TrialbalanceComponent, BalancesheetComponent, GroupsummaryComponent, ProfitandlossComponent, 
        UserrightsComponent, VoucherpostingComponent, AlertssetupComponent, AlerttemplateComponent, DayhistoryComponent, RepledgesComponent, RepledgeComponent, SearchPipe, 
        RppaymentsComponent, RppaymentComponent, RepledgecardComponent, RpclosuresComponent, RpclosureComponent, SupplierhistoryComponent, HomeComponent, SiteheaderComponent, 
        SitebodyComponent, SimplifyComponent, SiteschemesComponent, SitemodulesComponent, SitecashflowComponent, SiterepledgeComponent, SitemobileappComponent, AlertconfirmationComponent, 
        AgeAnalysisComponent, AlertHistoryComponent, MarketValueAnalysisComponent, IntStatement1percentComponent, EverysizeComponent, AutomationComponent, TestimonialsComponent,
        ContactComponent, PricingComponent, RepledgesummaryComponent, RepledgehistoryComponent, AgentsComponent, AgentComponent, RepledgeauctionhistoryComponent,
        BranchComponent, DivisionComponent, BusinessregisterComponent, DailyRegisterComponent, ImportdataComponent, TableviewComponent, AucnoticesVelsamyComponent, LoanhistoryBrgoldComponent,
        CustomDayHistoryFS2025061361Component
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,        
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    WebcamModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatMenuModule,
    MatListModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatIconModule,
    MatGridListModule,
    MatProgressBarModule,
    MatSortModule,
    NgxEchartsDirective,
    MatTableExporterModule,    
    NgxEchartsModule.forRoot({
        /**
         * This will import all modules from echarts.
         * If you only need custom modules,
         * please refer to [Custom Build] section.
         */
        echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
    }),], providers: [
        provideEcharts(),
        { provide: HTTP_INTERCEPTORS,
            useClass: CustomHttpInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
