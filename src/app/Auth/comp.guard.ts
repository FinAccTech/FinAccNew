import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';

@Injectable({
  providedIn: 'root'  
})
@AutoUnsubscribe
export class CompGuard  {
  constructor(private authService: AuthService, private router: Router){};

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):boolean {
    let isCompanySelected = this.authService.CompSelected;
    let isBranchSelected = this.authService.BranchSelected;
    if (isCompanySelected && isBranchSelected ){
      return true
    } else {            
      return false;
    }
  }
}