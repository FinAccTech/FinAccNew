import { DOCUMENT } from '@angular/common';
import { Component,  EventEmitter, HostListener, Inject, OnDestroy, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/Services/auth.service';
import { CompaniesComponent } from '../Components/companies/companies.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { BranchesComponent } from '../Components/branches/branches.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'] 
})
@AutoUnsubscribe
export class HeaderComponent implements OnDestroy {
  private subscriptionNameCompany: Subscription;
  private subscriptionNameBranch: Subscription;
  CompName: string = "";
  BranchName: string = "";
  LoggedUser: string = "";
  UserProfileImage: string = "";

  ClientCode: string = "";
  VersionType: number = 1;

  elem: any;
  IsFullScreen: boolean = false;

  constructor(@Inject(DOCUMENT) private document: any, @Inject(AuthService) private auth: AuthService, private dialog: MatDialog, private router: Router ){
    this.subscriptionNameCompany= this.auth.getCompUpdate().subscribe
    (compname => { //message contains the data sent from service      
      this.CompName = compname.CompName;
    });

    this.subscriptionNameBranch= this.auth.getBranchUpdate().subscribe
    (branchname => { //message contains the data sent from service      
      this.BranchName = branchname.BranchName;
    });

  }
  
  
  @Output() toggleEvent = new EventEmitter<boolean>(); // Output New GridList as Output Param
  toggleValue: boolean = true;
  MinimalHeader: boolean = false;

  @HostListener('window:resize', ['$event'])  
  onResize(event: any) {    
    if (window.innerWidth <=790){ this.MinimalHeader=true }
    else {this.MinimalHeader=false}
  }
 
  @HostListener('window:load', ['$event'])  
  onLoad(event: any) {    
    if (window.innerWidth <=790){ this.MinimalHeader=true }
    else {this.MinimalHeader=false}
  } 

  ngOnInit(){ 
    this.elem = document.documentElement;
    this.CompName = this.auth.SelectedCompany.Comp_Name;
    
    if (this.auth.SelectedBranch){
      this.BranchName = this.auth.SelectedBranch.Branch_Name;
    }
    
    this.LoggedUser = this.auth.LoggedUser.UserName!;
    this.UserProfileImage = this.auth.LoggedUser.Profile_Image;

    this.ClientCode = this.auth.LoggedClient.Client_Code;
    this.VersionType = this.auth.LoggedClient.Version_Type;
  }

  LoadCompanies(){ 
    const dialogRef = this.dialog.open(CompaniesComponent,  
      {
        data: "", 
        height: '50%', 
        width: '50%',                  
      });

      dialogRef.disableClose = false;  
      dialogRef.afterClosed().subscribe(result => {             
        if (this.auth.BranchSelected == 0){
              const dialogRef = this.dialog.open(BranchesComponent,  
                {
                  data: "", 
                  height: '50%',  
                  width: '50%',                  
                });
          
                dialogRef.disableClose = false;  
                dialogRef.afterClosed().subscribe(result => {                               
                }); 
            }            
      }); 
  }

  OpenBranches(){
    const dialogRef = this.dialog.open(BranchesComponent,  
      {
        data: "", 
        height: '50%',  
        width: '50%',                  
      });

      dialogRef.disableClose = false;  
      dialogRef.afterClosed().subscribe(result => {                               
      }); 
  }

  ToggleSideNav(){
    this.toggleValue = !this.toggleValue;
    this.toggleEvent.emit(this.toggleValue);
  }

  ngOnDestroy(): void {
    this.subscriptionNameCompany.unsubscribe();
    this.subscriptionNameBranch.unsubscribe();
  }

  Logout(){
    sessionStorage.clear();    
    this.router.navigate(['']);
  }

  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
    this.IsFullScreen = true;
  }

  /* Close fullscreen */
  closeFullscreen() {    
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
    this.IsFullScreen = false;
  }
  

}
