import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

@AutoUnsubscribe
export class DashboardComponent {
  MobileView: boolean = false;
  constructor(@Inject(DOCUMENT) private document: any){
    
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
  
}
