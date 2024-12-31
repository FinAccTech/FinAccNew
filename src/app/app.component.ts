import { Component, HostListener, SimpleChanges } from '@angular/core';
import { IdleService } from './idle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'FinAcc';

  constructor(){}
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event:any) {
    event.preventDefault();
    event.returnValue = 'Your data will be lost!';
    return false;
    //I have used return false but you can your other functions or any query or condition
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
