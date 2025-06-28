import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';
import { IdleService } from '../idle.service';
import { DataService } from '../Services/data.service';
import { GlobalsService } from '../Services/globals.service';
import { AuthService } from '../Services/auth.service';
import { ClsCompanies } from './Classes/ClsCompanies';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

@AutoUnsubscribe
export class DashboardComponent {
  MobileView: boolean = false;
  
  SubscriptionAlert: boolean = false;
  SubscriptionMsg: string = "";
  CloseEnable: boolean = false;
  ShowAlert: boolean = true;

  UsedDataPercentage: number = 0;
  UsedSpace: string = "";
  AvailableSpace:string = "";

  constructor(@Inject(DOCUMENT) private document: any,private idleService: IdleService, private dataService: DataService, private auth: AuthService, private globals: GlobalsService ){    
  } 

//  ngOnInit(){
//     if (this.auth.Authenticated == 0){
//       this.router.navigate(['']);      
//     }
//  }

 ngOnInit() {
  this.idleService.startMonitoring();

  this.dataService.GetServerDate().subscribe(data=>{
    const currentDate = new Date(data);
    const AlertDate = new Date(currentDate);
    AlertDate.setMonth(currentDate.getMonth() -1);

    if (this.auth.LoggedClient.Subscription_End < this.globals.DateToInt(AlertDate)){
      this.SubscriptionAlert = true;
      this.SubscriptionMsg = "Your subscription is about to expire on  " + this.globals.IntToDateString(this.auth.LoggedClient.Subscription_End);
      this.CloseEnable = true;
    }      

    if (this.auth.LoggedClient.Subscription_End < this.globals.DateToInt(currentDate)){
      this.SubscriptionAlert = true;
      this.CloseEnable = false;
      this.SubscriptionMsg = "Your subscription ended on " + this.globals.IntToDateString(this.auth.LoggedClient.Subscription_End);
      //this.globals.SubscriptionExpired = true;
    }      

    if (this.auth.LoggedClient.Subscription_End == this.globals.DateToInt(currentDate)){
      this.SubscriptionAlert = true;
      this.CloseEnable = false;
      this.SubscriptionMsg = "Your subscription is expiring Today";
    }      
  })

  let comp = new ClsCompanies(this.dataService);
  comp.getClientDataSize(this.auth.LoggedClient.ClientSno).subscribe(data=>{
    
    // 2Gb - 2147483648
    this.UsedDataPercentage = +((data / 2147483648)*100).toFixed(2);
    let retData = this.globals.getBytesintoSize(data);
    this.UsedSpace = retData.Size + ' ' + retData.SizeType ;
    
  })

}

CloseAlert(){
  this.ShowAlert = false;
}

ngOnDestroy() {
  this.idleService.stopMonitoring();
}

  @HostListener('window:resize', ['$event'])  
  onResize(event: any) {    
    if (window.innerWidth <=768){ this.CompactView=true; this.MobileView = true; }
    else {this.CompactView=false; this.MobileView = false;}
  }
 
  @HostListener('window:load', ['$event'])  
  onLoad(event: any) {    
    if (window.innerWidth <=768){ this.CompactView=true; this.MobileView = true; }
    else {this.CompactView=false; this.MobileView = false;}
  }

  CompactView: boolean = false;
  SlideNav: boolean = false;
  
  SetCompact($event: boolean){  
    this.CompactView = !$event;
  }
 
  RenewApp(){
    this.globals.SnackBar("info","Online Payment is not yet enabled. Call FinAcc for Renewal Support");
  }

  BuyMoreSpace(){
    this.globals.SnackBar("info","Online Payment is not yet enabled. Call FinAcc for Space Support");
  }
}
