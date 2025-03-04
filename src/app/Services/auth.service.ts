import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable, Subject } from 'rxjs';
import { TypeClientInfo } from '../Auth/TypeClientInfo';
import { TypeUser, TypeUserRights } from '../Dashboard/Classes/ClsUsers';
import { TypeCompanies } from '../Dashboard/Classes/ClsCompanies';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';
import { UrlService } from './url.service';

@Injectable({ 
  providedIn: 'root'
})

@AutoUnsubscribe
export class AuthService {

  Authenticated: number = 0;  
  LoggedClient!: TypeClientInfo;
  LoggedUser!: TypeUser;
  LoggedUserRights!: TypeUserRights[];

  CompSelected: number = 0;
  SelectedCompany!: TypeCompanies;
  
  SelectedBranchSno: number = 1;
  ServerImagePath: string = "";

  constructor(private http: DataService, private urls: UrlService) {     
    this.ServerImagePath = urls.getServerImagePath();

    this.Authenticated  = +sessionStorage.getItem("sessionAuthenticated")!;
    this.LoggedClient   = JSON.parse (sessionStorage.getItem("sessionLoggedClient")!);  
    this.LoggedUser     = JSON.parse (sessionStorage.getItem("sessionLoggedUser")!);  
        
    if (this.LoggedUser && this.LoggedUser.Rights_Json && this.LoggedUser.Rights_Json.length > 0)
    {
      this.LoggedUserRights = JSON.parse (this.LoggedUser.Rights_Json);       
    }
    else{
      this.LoggedUserRights = [];
    }

    this.CompSelected = +sessionStorage.getItem("sessionCompSelected")!;
    this.SelectedCompany = JSON.parse (sessionStorage.getItem("sessionSelectedCompany")!);    
    this.SelectedBranchSno = +sessionStorage.getItem("sessionSelectedBranchSno")!;    
  }

  // Authenticated(){
  //   return +sessionStorage.getItem("sessionAuthenticated")!;
  // }

  // LoggedClient{
  //   return JSON.parse (sessionStorage.getItem("sessionLoggedClient")!);  
  // }

  // LoggedUser(){
  //   return JSON.parse (sessionStorage.getItem("sessionLoggedUser")!);      
  // }

  // CompSelected(){
  //   return +sessionStorage.getItem("sessionCompSelected")!;
  // }

  // SelectedCompany{
  //   return JSON.parse (sessionStorage.getItem("sessionSelectedCompany")!); 
  // }

  // SelectedBranchSno(){
  //   return +sessionStorage.getItem("sessionSelectedBranchSno")!;  
  // }

  private subjectName = new Subject<any>(); //need to create a subject
    
        sendCompUpdate(CompName: string) { //the component that wants to update something, calls this fn
            this.subjectName.next({ CompName: CompName }); //next() will feed the value in Subject
        }
    
        getCompUpdate(): Observable<any> { //the receiver component calls this function 
            return this.subjectName.asObservable(); //it returns as an observable to which the receiver funtion will subscribe
        }
        
  CheckSaasLogin( username: string,password: string)
  {          
    let postdata ={ "App_Login" :  username, "App_Pwd" :  password }; 
    return this.http.HttpGet(postdata, "/CheckSaasLogin");     
  }   

  CheckLogin( username: string,password: string)
  {          
    let postdata ={ "App_Login" :  username, "App_Pwd" :  password }; 
    return this.http.HttpGet(postdata, "/CheckUserandgetCompanies");     
  }   
  
  getPartyImagesServerPath(): string{
    let url = "";
    if (this.SelectedCompany.CommMasters == 1)
    {
      url = this.ServerImagePath + "Images/" + this.LoggedClient.ClientSno + '/Parties/';
    }
    else
    {
      url = this.ServerImagePath + "Images/" + this.LoggedClient.ClientSno + '/' + this.SelectedCompany.CompSno + '/Parties/';
    }
    return url;    
  }

  getLoanImagesServerPath(): string{    
      return this.ServerImagePath + "Images/" + this.LoggedClient.ClientSno + '/' + this.SelectedCompany.CompSno + '/Loans/';    
  }

  getReceiptImagesServerPath(): string{    
    return this.ServerImagePath + "Images/" + this.LoggedClient.ClientSno + '/' + this.SelectedCompany.CompSno + '/Receipts/';    
  }

  getRedemptionImagesServerPath(): string{    
    return this.ServerImagePath + "Images/" + this.LoggedClient.ClientSno + '/' + this.SelectedCompany.CompSno + '/Redemptions/';    
  }

  getUserImagesServerPath(): string{    
    return this.ServerImagePath + "Images/" + this.LoggedClient.ClientSno + '/';    
}

getRepledgeImagesServerPath(): string{    
  return this.ServerImagePath + "Images/" + this.LoggedClient.ClientSno + '/' + this.SelectedCompany.CompSno + '/Repledges/';    
}
getRpPaymentImagesServerPath(): string{    
  return this.ServerImagePath + "Images/" + this.LoggedClient.ClientSno + '/' + this.SelectedCompany.CompSno + '/RpPayments/';    
}
getRpClosureImagesServerPath(): string{    
  return this.ServerImagePath + "Images/" + this.LoggedClient.ClientSno + '/' + this.SelectedCompany.CompSno + '/RpClosures/';    
}
}
