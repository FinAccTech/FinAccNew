import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TypeClientInfo } from 'src/app/Auth/TypeClientInfo';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-clientprofile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clientprofile.component.html',
  styleUrl: './clientprofile.component.scss'
})

export class ClientprofileComponent {
  constructor(private auth: AuthService, private globals: GlobalsService, private dataService: DataService) {}

  ClientInfo!: TypeClientInfo;
  SubsStartDate: string = "";
  SubsEndDate: string = "";

  SubscriptionAlert: boolean = false;
  SubscriptionMsg: string = "";

  ngOnInit(){
    this.ClientInfo = this.auth.LoggedClient;
    this.SubsStartDate = this.globals.IntToDateString (this.ClientInfo.Subscription_Start);
    this.SubsEndDate = this.globals.IntToDateString (this.ClientInfo.Subscription_End);
    
     this.dataService.GetServerDate().subscribe(data=>{
          const currentDate = new Date(data);
          const AlertDate = new Date(currentDate);
          AlertDate.setMonth(currentDate.getMonth() -1);
    
          if (this.auth.LoggedClient.Subscription_End < this.globals.DateToInt(AlertDate)){
            this.SubscriptionAlert = true;
            this.SubscriptionMsg = "Your subscription is about to expire on  " + this.globals.IntToDateString(this.auth.LoggedClient.Subscription_End);
          }      
    
          if (this.auth.LoggedClient.Subscription_End < this.globals.DateToInt(currentDate)){
            this.SubscriptionAlert = true;
            this.SubscriptionMsg = "Your subscription ended on " + this.globals.IntToDateString(this.auth.LoggedClient.Subscription_End);
          }      
    
          if (this.auth.LoggedClient.Subscription_End == this.globals.DateToInt(currentDate)){
            this.SubscriptionAlert = true;
            this.SubscriptionMsg = "Your subscription is expiring Today";
          }          
        })
  }
}
