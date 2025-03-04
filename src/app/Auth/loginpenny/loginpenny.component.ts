import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAppSetup } from 'src/app/Dashboard/Classes/ClsAppSetup';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';

@Component({
  selector: 'app-loginpenny',  
  templateUrl: './loginpenny.component.html',
  styleUrl: './loginpenny.component.scss'
})
@AutoUnsubscribe
export class LoginpennyComponent {
constructor(private auth: AuthService, private router: Router, private dataService: DataService) {}

  ClientCode: string = "";
  UserName: string = "";
  Password: string = ""
  InvalidUser: boolean = false;
  errText: string = "";
 
  ngOnInit(){        
    this.ClientCode = "FS2025030143";    
  }

  CheckLogin(){
    if (!this.ClientCode  || this.ClientCode == '' ){
      return;
    }
    
    this.InvalidUser = false;

    if ((this.UserName.trim().length == 0) ||(this.Password.trim().length == 0))
      {
        this.InvalidUser = true;
        return;
      }
      sessionStorage.clear();      
      sessionStorage.setItem("sessionClientDbName",this.ClientCode);  
    
      this.auth.CheckSaasLogin(this.UserName, this.Password).subscribe(data=>{
        if (data.queryStatus == 0){
          this.InvalidUser = true;
          this.errText = "*** " + data.apiData; 
          return;
        }      
        else{ 
          sessionStorage.clear();
          sessionStorage.setItem("sessionClientDbName",this.ClientCode);  
          this.auth.LoggedClient = data.apiData.ClientInfo[0];                                
          sessionStorage.setItem("sessionLoggedClient", JSON.stringify (data.apiData.ClientInfo[0]))!;  
          
            this.auth.CheckLogin(this.UserName, this.Password).subscribe(data =>{      
        
              if (data.queryStatus == 0){
                this.InvalidUser = true;
                this.errText = "*** " + data.apiData; 
              }      
              else{                        
                this.auth.Authenticated = 1;                
                sessionStorage.setItem("sessionAuthenticated","1")!;      
                
                this.auth.LoggedUser = data.apiData.UserInfo[0];     
                    
                if (this.auth.LoggedUser.Rights_Json)
                {
                  this.auth.LoggedUserRights = JSON.parse (this.auth.LoggedUser.Rights_Json);       
                }
                else{
                  this.auth.LoggedUserRights = [];
                }
        
                sessionStorage.setItem("sessionLoggedUser", JSON.stringify (data.apiData.UserInfo[0]))!;        
                        
                if (data.apiData.CompInfo.length > 0)
                  {
                    this.auth.CompSelected = 1;
                    this.auth.SelectedCompany  = data.apiData.CompInfo[0];        
        
                    this.auth.SelectedBranchSno = data.apiData.CompInfo[0].CompSno;  // Branch option to be worked later. as of now just keeping BranchSno as 1 throught the app including database
            
                    sessionStorage.setItem("sessionCompSelected","1")!;
                    sessionStorage.setItem("sessionSelectedCompany",JSON.stringify(data.apiData.CompInfo[0]));
                    sessionStorage.setItem("sessionSelectedCompSno",JSON.stringify(data.apiData.CompInfo[0].CompSno));            
                    sessionStorage.setItem("sessionSelectedBranchSno",this.auth.SelectedBranchSno.toString())!;                                            
        
                    let tset = new ClsAppSetup(this.dataService);
                    tset.getAppSetup(0).subscribe(data => {
                      if (data.queryStatus == 0){
                        alert ("Error getting Transaction Setup details");
                        return;
                      }
                      else{
                        sessionStorage.setItem("sessionTransactionSetup",data.apiData);
                      }        
                    });
                  }
                else{
                    this.auth.CompSelected = 0;
                    this.auth.SelectedCompany = null!;
                    this.auth.SelectedBranchSno = 0;  // Branch option to be worked later. as of now just keeping BranchSno as 1 throught the app including database
            
                    sessionStorage.setItem("sessionSelectedCompany","")!;            
                    sessionStorage.setItem("sessionSelectedBranchSno","0")!;                                                                 
                }
                this.router.navigate(['dashboard']);      
              }
            })

        }
      })

    
  }
}
