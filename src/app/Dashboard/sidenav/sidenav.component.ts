import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, Input, SimpleChanges } from '@angular/core';
import { menuTree } from './MenuTree';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
}) 

@AutoUnsubscribe 
export class SidenavComponent {  

 
  LogoPath: string = "";
  LogoName: string = "";

  constructor(@Inject(DOCUMENT) private document: any, private router: Router, private auth: AuthService){
    
  } 
  
  TreeData = menuTree;
  Expanded: boolean[] = [];

  @Input()  SideNavCompact: boolean = false; 
  // @Input()  SlideNav: boolean = false; 
  SlideNav: boolean = false;
  ShowCompact: boolean  = false;
  MinimalView: boolean = false;

  @HostListener('window:resize', ['$event'])  
  onResize(event: any) {    
    if (window.innerWidth <=790){ 
      this.MinimalView = true }
      else{ this.MinimalView = false}    
  }
 
  @HostListener('window:load', ['$event'])  
  onLoad(event: any) {    
    if (window.innerWidth <=790){ 
      this.MinimalView = true }
      else{ this.MinimalView = false}
  }

  toggleSlide()
  {
    if (this.SideNavCompact){
      if (this.SlideNav == true){
        this.ShowCompact = false;
      }
      else{
        this.ShowCompact = true;
      }
    }
  }

  ngOnInit(){
    const baseUrl = window.location.origin;
    switch (baseUrl) {
      case 'https://admin.pennygold.in':
        this.LogoPath = "assets/images/pennygold.png";
        this.LogoName = "";
        break;

      case 'https://finaccsaas.com':
        this.LogoPath = "assets/images/finacclogo.png";
        this.LogoName = "FinAcc";
        break;

      case 'http://localhost:4200':
        this.LogoPath = "assets/images/finacclogo.png";
        this.LogoName = "FinAcc";
        break;

      case 'http://localhost:4200/#/':
        this.LogoPath = "assets/images/finacclogo.png";
        this.LogoName = "FinAcc";
        break;
        
      default:
        this.LogoPath = "assets/images/finacclogo.png";
        this.LogoName = "FinAcc";
        break;
    }   

    for (var i=0; i<=this.TreeData.length; i++)
      {
        this.Expanded[i] = false;
      }   

  }

  Expandme(i: number){
    this.Expanded[i] = !this.Expanded[i];
    for (var a=0; a<=this.TreeData.length; a++)
      {
        if (a!==i){ this.Expanded[a] = false; }
      }  
  }

  ngOnChanges(changes: SimpleChanges){
    //console.log (changes);
    this.SideNavCompact = changes['SideNavCompact'].currentValue;    
    if (this.SideNavCompact){
      if (this.SlideNav == true){
        this.ShowCompact = false;
      }
      else{
        this.ShowCompact = true;
      }
    }
    else{
      this.ShowCompact = false;
    }
  }

  GotoHome(){ 
    this.router.navigate(['dashboard'])
  }

}

