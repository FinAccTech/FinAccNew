import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ClsCompanies, TypeCompanies } from '../../Classes/ClsCompanies';
import { AuthService } from 'src/app/Services/auth.service';
import { Router } from '@angular/router';
import { CompanyComponent } from './company/company.component';
import { DataService } from 'src/app/Services/data.service';
import { ClsAppSetup } from '../../Classes/ClsAppSetup';
import { GlobalsService } from 'src/app/Services/globals.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsBranches } from '../../Classes/ClsBranches';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})

@AutoUnsubscribe
export class CompaniesComponent {
  constructor( private dialog: MatDialog,public dialogRef: MatDialogRef<CompaniesComponent>, private globals: GlobalsService,              
    @Inject(MAT_DIALOG_DATA) public data: any, private auth: AuthService, private router: Router, private dataService: DataService) {}

  CompaniesList: TypeCompanies[]  = [];

  ngOnInit(): void{    
    this.LoadCompaniesList();
  }

  LoadCompaniesList(){
    let comp = new ClsCompanies(this.dataService);
    comp.getCompanies(this.auth.LoggedUser.UserSno).subscribe(data =>{              
      this.CompaniesList = JSON.parse (data.apiData);
    })
    
  }

  SelectCompany(comp: TypeCompanies){ 
    if (comp){
      this.auth.CompSelected = 1;
      this.auth.BranchSelected = 0;
      this.auth.SelectedCompany  = comp;     

      //this.auth.SelectedBranchSno = comp.CompSno; // Branch option to be worked later. as of now just keeping BranchSno as 1 throught the app including database    

      sessionStorage.setItem("sessionBranchSelected","0")!;

      sessionStorage.setItem("sessionCompSelected","1")!;
      sessionStorage.setItem("sessionSelectedCompany",JSON.stringify(comp));
      sessionStorage.setItem("sessionSelectedCompSno",JSON.stringify(comp.CompSno));         

      //sessionStorage.setItem("sessionSelectedBranchSno",this.auth.SelectedBranchSno.toString())!;                   

      this.auth.sendCompUpdate(comp.Comp_Name);
        
      this.router.navigate(['dashboard']);  
      this.dialogRef.close();           
    }
  }

  AddNewCompany(){
    if (this.auth.LoggedUser.UserSno !== 1){
      this.globals.SnackBar("error","You are not authorized to Create Companies");
      return;
    }
    var comp = new ClsCompanies(this.dataService);    
    this.OpenCompany(comp.Initialize());    
  }


  OpenCompany(comp: TypeCompanies){        
    const dialogRef = this.dialog.open(CompanyComponent, 
      {
        data: comp,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (result == true)
          {
            this.LoadCompaniesList();            
          }          
        }        
      });  
  } 
}
