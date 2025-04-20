import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAppSetup } from 'src/app/Dashboard/Classes/ClsAppSetup';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@AutoUnsubscribe
@Component({
  selector: 'app-logindefault',  
  templateUrl: './logindefault.component.html',
  styleUrl: './logindefault.component.scss'
})
export class LogindefaultComponent {
constructor(private auth: AuthService, private router: Router, private globals: GlobalsService, private dataService: DataService) {}

  ClientCode: string = "";
  UserName: string = "";
  Password: string = ""
  InvalidUser: boolean = false;
  errText: string = "";
  LocalIp: string = "";

  ngOnInit(){    
    let DbNameCookie = this.globals.getCookie('dbName');
    this.ClientCode = DbNameCookie!;    
    this.dataService.GetLocalIp().subscribe((data: any)=>{
      this.LocalIp = data.ip;
    })
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
      this.globals.setCookie('dbName',this.ClientCode);
      sessionStorage.setItem("sessionClientDbName",this.ClientCode);  

      
    this.auth.CheckLogin(this.UserName, this.Password, this.LocalIp).subscribe(data =>{      
       
      if (data.queryStatus == 0){
        this.InvalidUser = true;
        this.errText = this.globals.RemoveWordsFromString(data.apiData,["SQL Server"]);        
        //this.errText = "*** " + data.apiData; 
      }      
      else{                
        sessionStorage.clear();
        sessionStorage.setItem("sessionClientDbName",this.ClientCode);  
        this.auth.Authenticated = 1;                
        sessionStorage.setItem("sessionAuthenticated","1")!;      
        this.auth.LoggedClient = data.apiData.ClientInfo[0];    
                            
        sessionStorage.setItem("sessionLoggedClient", JSON.stringify (data.apiData.ClientInfo[0]))!;        
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

            //this.auth.SelectedBranchSno = data.apiData.CompInfo[0].CompSno;  // Branch option to be worked later. as of now just keeping BranchSno as 1 throught the app including database
    
            sessionStorage.setItem("sessionCompSelected","1")!;
            sessionStorage.setItem("sessionSelectedCompany",JSON.stringify(data.apiData.CompInfo[0]));
            sessionStorage.setItem("sessionSelectedCompSno",JSON.stringify(data.apiData.CompInfo[0].CompSno));            
            //sessionStorage.setItem("sessionSelectedBranchSno",this.auth.SelectedBranchSno.toString())!;                                            

            // let tset = new ClsAppSetup(this.dataService);
            // tset.getAppSetup(0).subscribe(data => {
            //   if (data.queryStatus == 0){
            //     alert ("Error getting Transaction Setup details");
            //     return;
            //   }
            //   else{
            //     sessionStorage.setItem("sessionTransactionSetup",data.apiData);
            //   }        
            // });
          }
        else{
            this.auth.CompSelected = 0;
            this.auth.SelectedCompany = null!;
            //this.auth.SelectedBranchSno = 0;  // Branch option to be worked later. as of now just keeping BranchSno as 1 throught the app including database
    
            sessionStorage.setItem("sessionSelectedCompany","")!;            
            sessionStorage.setItem("sessionSelectedBranchSno","0")!;                                                                 
        }
                
        if (data.apiData.BranchInfo) {
          sessionStorage.setItem("sessionBranchesList", JSON.stringify (data.apiData.BranchInfo))!;        
        }

        this.auth.BranchSelected = 0;
        sessionStorage.setItem("sessionBranchSelected","0")!;
        this.router.navigate(['dashboard']);      
      }
    })
  }
}
