import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';
import { AuthService } from '../Services/auth.service';
import { Router } from '@angular/router';
import { IdleService } from '../idle.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

@AutoUnsubscribe
export class DashboardComponent {
  MobileView: boolean = false;
  constructor(@Inject(DOCUMENT) private document: any,private idleService: IdleService,  private auth: AuthService, private router: Router){    
  } 

//  ngOnInit(){
//     if (this.auth.Authenticated == 0){
//       this.router.navigate(['']);      
//     }
//  }

 ngOnInit() {
  this.idleService.startMonitoring();
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
  
}
