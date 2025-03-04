import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { GlobalsService } from '../Services/globals.service';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';

@Injectable({
  providedIn: 'root'  
})

@AutoUnsubscribe
export class AuthGuard  {
  constructor(private authService: AuthService, private globals: GlobalsService){};

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):boolean {
    let isLoggedIn = this.authService.Authenticated;
        
    let adminCheck = next.data["adminCheck"];
    let printSetupCheck = next.data["printSetupCheck"];

    if (!isLoggedIn){
      return false;
    }

    if (adminCheck) {
      if (this.authService.LoggedUser.User_Type == 0){
        this.globals.SnackBar("error","You are not authorized fot this Operation");
        return false
      }
    }

    if (printSetupCheck && printSetupCheck == true){
      if (this.authService.LoggedClient.Client_Code !== 'FS2024080701')
        {
            this.globals.SnackBar("error","You are not authorized for this operation. Contact FinAcc !!");
            return false;
        }
    }

    return true;
    // if (isLoggedIn){
    //   if (!adminCheck)  {
    //     return true
    //   }
    //   else{
    //     if (adminCheck == true){
    //       if (this.authService.LoggedUser.User_Type == 0){
    //         return false
    //       }
    //       else{            
    //         if (printSetupCheck && printSetupCheck == true){
    //           if (this.authService.LoggedClient.Client_Code !== 'FS2024080701')
    //               {
    //                   window.alert ("You are not authorized for this operation. Contact FinAcc !!")
    //                   return false;
    //               }
    //               else{
    //                 return true;
    //               }
    //         }
    //         else{
    //           return true;
    //         }

    //       }          
    //     }
    //     else{
    //       return true;
    //     }
    //   }      
    // } else {      
    //   this.router.navigate(['']);
    //   return false;
    // }
  }
}