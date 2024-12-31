import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReloginComponent } from './relogin/relogin.component';
import { GlobalsService } from './Services/globals.service';
import { AuthService } from './Services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  private idleTimeout: number = 10 * 60 * 1000; // 10 minutes
  private timeoutHandler: any;
  private events: string[] = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

  constructor(private dialog: MatDialog, private router: Router, private ngZone: NgZone, private globals: GlobalsService, private auth: AuthService) {}

  startMonitoring() {    
    this.resetTimer();

    // Attach event listeners for user activity
    this.events.forEach((event) =>
      document.addEventListener(event, this.resetTimer.bind(this))
    );
  }

  private resetTimer() {
    if (this.auth.Authenticated == 0) {return;}
    // Clear the existing timeout
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
    }

    // Set a new timeout
    this.ngZone.runOutsideAngular(() => {
      this.timeoutHandler = setTimeout(() => {
        this.showReLoginDialog();
      }, this.idleTimeout);
    });
  }

  private showReLoginDialog() {
    this.auth.Authenticated = 0;                
    sessionStorage.setItem("sessionAuthenticated","0")!;      
    this.ngZone.run(() => {
      const dialogRef = this.dialog.open(ReloginComponent, {
        // width: '400px',
        disableClose: true, // Prevent closing the dialog without action
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'stay') {          
          this.resetTimer(); // Reset the timer if the user wants to stay logged in
          this.auth.Authenticated = 1;                
          sessionStorage.setItem("sessionAuthenticated","1")!;      
          this.globals.SnackBar("info", "You are relogged successfully...")
        } else {
          this.logout();
        }
      });
    });
  }

  private logout() {
    console.log('User is idle, logging out...');
    this.stopMonitoring();
    this.router.navigate(['']); // Redirect to login page
    localStorage.clear();
    sessionStorage.clear();
  }

  stopMonitoring() {
    // Clear the timeout and remove event listeners
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
    }

    this.events.forEach((event) =>
      document.removeEventListener(event, this.resetTimer.bind(this))
    );
  }
}
