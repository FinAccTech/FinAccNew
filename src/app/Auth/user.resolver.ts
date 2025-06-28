import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserResolver implements Resolve<boolean> {
  constructor(private router: Router) {}

  resolve(): Observable<boolean> {
    // const userRole = localStorage.getItem('role');
    const baseUrl = window.location.origin;
        
    switch (baseUrl) {
        case 'https://pennygold.in':
            this.router.navigate(['loginpenny'])    
            break;
        case 'https://pennygold.in/#/':
          this.router.navigate(['loginpenny'])    
          break;
            
        case 'https://finaccsaas.com':
          this.router.navigate(['logindefault'])    
          break;      
        case 'http://localhost:4200':
            this.router.navigate(['logindefault'])    
             //this.router.navigate(['loginpenny'])    
            break;        
        case 'http://localhost:4200/#/':
          this.router.navigate(['logindefault'])    
            break;        
    }
    
    // if (userRole === 'admin') {
    //   this.router.navigate(['/admin-dashboard']);
    // } else {
    //   this.router.navigate(['/user-dashboard']);
    // }
    
    return of(true);
  }
}
