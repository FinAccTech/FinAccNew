import { Component, HostListener, SimpleChanges } from '@angular/core';
import { IdleService } from './idle.service';
import { ApiDataService } from './Services/api-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title: string = 'FinAccSaas';

  constructor(private apidataService: ApiDataService){}
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event:any) {
    event.preventDefault();
    event.returnValue = 'Your data will be lost!';
    return false;  
    //I have used return false but you can your other functions or any query or condition
  }
  

  ngOnInit(){    

    const CompSno: number   = +sessionStorage.getItem("sessionSelectedCompSno")!;     
	  const ClientSno: number = sessionStorage.getItem("sessionLoggedClient") ? JSON.parse (sessionStorage.getItem("sessionLoggedClient")!).ClientSno : 0; 
    const BranchSno: number = +sessionStorage.getItem("sessionSelectedBranchSno")!;      
	  const UserSno: number   = sessionStorage.getItem("sessionLoggedUser") ? JSON.parse(sessionStorage.getItem("sessionLoggedUser")!).UserSno : 0; 

    if ((CompSno && CompSno > 0 ) && (ClientSno && ClientSno>0) && (BranchSno && BranchSno >0) && (UserSno && UserSno > 0) ){
      this.apidataService.fetchData("1");
    }

    const baseUrl = window.location.origin; 
    switch (baseUrl) {
      case 'https://pennygold.in/#/':
        document.body.classList.add('pennyTheme');
        this.title = "PennyGold";
        break;
        case 'https://pennygold.in':
          document.body.classList.add('pennyTheme');
          this.title = "PennyGold";
          break;
      case 'https://finaccsaas.com':
        document.body.classList.add('finaccTheme');
        this.title = "FinAccSaas";
        break;      
      case 'http://localhost:4200':
        document.body.classList.add('finaccTheme');
        this.title = "FinAccSaas";
        break;        
    }        
  }
  // @HostListener('window:unload', [ '$event' ])
  // unloadHandler(event: any) {
  //   // ...
  //   alert ("event");
    
  // }

  // @HostListener('window:beforeunload', [ '$event' ])
  // beforeUnloadHandler(event: any) {
  //   alert ("event");
    
  //   // ...
  // }

  // @HostListener('document:visibilitychange', ['$event']) 
  // visibilityChange($event: Event) {
    
  //   if (document.visibilityState === 'hidden') {
  //     alert ("document.visibilityState === 'hidden'")
  //   }
  // }
  
}
