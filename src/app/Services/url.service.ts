import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class UrlService {
  
  getSaasURLAuth():string{    
    return "https://finaccsaas.com/data/RestApi.php/auth";
  } 

  getServerImagePath():string{        
    const baseUrl = window.location.origin;
    switch (baseUrl) {
      case 'https://pennygold.in':
        return "https://pennygold.in/data/";
        
      // case 'https://pennygold.in/admin/#':
      //   return "https://pennygold.in/admin/data/";

      case 'https://finaccsaas.com':
        return "https://finaccsaas.com/data/";        

      case 'http://localhost:4200':
        return "https://finaccsaas.com/data/";

      case 'http://localhost:4200/#/':
        return "https://finaccsaas.com/data/";
        
      default:
        return "https://finaccsaas.com/data/";        
    }   

  } 

  getbaseApiURLAuth():string{    
    const baseUrl = window.location.origin;    
    switch (baseUrl) {
      case 'https://pennygold.in':
        return "https://pennygold.in/data/RestApi.php/auth";

      // case 'https://pennygold.in/admin/#':
      //     return "https://pennygold.in/admin/data/RestApi.php/auth";

      case 'https://finaccsaas.com':
        return "https://finaccsaas.com/data/RestApi.php/auth";        

      case 'http://localhost:4200':
        return "https://finaccsaas.com/data/RestApi.php/auth";
        // return "https://pennygold.in/admin/data/RestApi.php/auth";

      case 'http://localhost:4200/#/':
        return "https://finaccsaas.com/data/RestApi.php/auth";
        
      default:
        return "https://finaccsaas.com/data/RestApi.php/auth";        
    }   
  } 

  getbaseApiURL():string{
    const baseUrl = window.location.origin;    
    switch (baseUrl) {
      case 'https://pennygold.in':
        return "https://pennygold.in/data/RestApi.php/app";
        
      // case 'https://pennygold.in/admin/#/':
      //     return "https://pennygold.in/admin/data/RestApi.php/app";

      case 'https://finaccsaas.com':
        return "https://finaccsaas.com/data/RestApi.php/app";        

      case 'http://localhost:4200':
        return "https://finaccsaas.com/data/RestApi.php/app";
        // return "https://pennygold.in/admin/data/RestApi.php/app";

      case 'http://localhost:4200/#/':
        return "https://finaccsaas.com/data/RestApi.php/app";
        
      default:
        return "https://finaccsaas.com/data/RestApi.php/app";        
    }   
  }   

}
