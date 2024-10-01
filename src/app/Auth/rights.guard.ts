import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { GlobalsService } from '../Services/globals.service';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';

@Injectable({
  providedIn: 'root'  
})
@AutoUnsubscribe
export class RightsGuard  {
  constructor(private authService: AuthService, private globals: GlobalsService){};

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):boolean {
    
    if (this.authService.LoggedUser.User_Type == 1){
      return true;
    }
    
    let FormSno = next.data["FormSno"];
    
    if (this.authService.LoggedUserRights.length < 1 ) { return true;}
    let FormRight = false;
        
    FormRight = this.authService.LoggedUserRights.filter(right=>{
      return right.FormSno == FormSno
    })[0].View_Right

    if (FormRight) {
        return true;
    }
    else{
        this.globals.SnackBar("error","You are not authorized for this Operation. Contact Admin...")
        return false;
    }
  }
}