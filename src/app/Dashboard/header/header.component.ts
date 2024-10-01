import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, HostListener, Inject, OnDestroy, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/Services/auth.service';
import { CompaniesComponent } from '../Components/companies/companies.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'] 
})
@AutoUnsubscribe
export class HeaderComponent implements OnDestroy {
  private subscriptionName: Subscription;
  CompName: string = "";
  LoggedUser: string = "";
  UserProfileImage: string = "";

  constructor(@Inject(DOCUMENT) private document: any, @Inject(AuthService) private auth: AuthService, private dialog: MatDialog, private router: Router ){
    this.subscriptionName= this.auth.getCompUpdate().subscribe
    (compname => { //message contains the data sent from service
      
      this.CompName = compname.CompName;
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
    this.CompName = this.auth.SelectedCompany.Comp_Name;
    this.LoggedUser = this.auth.LoggedUser.UserName!;
    this.UserProfileImage = this.auth.LoggedUser.Profile_Image;
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
      }); 
  }

  ToggleSideNav(){
    this.toggleValue = !this.toggleValue;
    this.toggleEvent.emit(this.toggleValue);
  }

  ngOnDestroy(): void {
    this.subscriptionName.unsubscribe();
  }
  Logout(){
    sessionStorage.clear();    
    this.router.navigate(['']);
  }
}
