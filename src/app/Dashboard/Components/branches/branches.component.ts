import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsBranches, TypeBranch } from '../../Classes/ClsBranches';
import { ClsAppSetup } from '../../Classes/ClsAppSetup';

@Component({
  selector: 'app-branches',  
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss'
})
@AutoUnsubscribe
export class BranchesComponent {
constructor( private dialog: MatDialog,public dialogRef: MatDialogRef<BranchesComponent>, private globals: GlobalsService,              
    @Inject(MAT_DIALOG_DATA) public data: any, private auth: AuthService, private router: Router, private dataService: DataService) {}

  BranchesList: TypeBranch[]  = [];

  ngOnInit(): void{        
    this.BranchesList = JSON.parse (sessionStorage.getItem("sessionBranchesList")!);   
        
    if (this.BranchesList.length == 0 || !this.BranchesList ){
      let brh = new ClsBranches(this.dataService);
        brh.getBranches(0,0,0).subscribe(data=>{
        sessionStorage.setItem("sessionBranchesList", JSON.stringify (data.apiData))!;        
        this.BranchesList = this.BranchesList.filter(brh=>{
          return brh.CompSno  == this.auth.SelectedCompany.CompSno;
        })     
        if (this.BranchesList.length < 2){
          this.SelectBranch(this.BranchesList[0]);
        }
      })
    }
    else{      
      this.BranchesList = this.BranchesList.filter(brh=>{
        return brh.CompSno  == this.auth.SelectedCompany.CompSno;
      })     
      if (this.BranchesList.length < 2){
        this.SelectBranch(this.BranchesList[0]);
      }
    }
    
  }

  SelectBranch(brh: TypeBranch){ 
    if (brh){
      this.auth.BranchSelected = 1;
      this.auth.SelectedBranch  = brh;     

      //this.auth.SelectedBranchSno = comp.CompSno; // Branch option to be worked later. as of now just keeping BranchSno as 1 throught the app including database    

      sessionStorage.setItem("sessionBranchSelected","1")!;
      sessionStorage.setItem("sessionSelectedBranch",JSON.stringify(brh));
      sessionStorage.setItem("sessionSelectedBranchSno",JSON.stringify(brh.BranchSno));         

      let tset = new ClsAppSetup(this.dataService);
      tset.getAppSetup(0, brh.BranchSno).subscribe(data => {
        if (data.queryStatus == 0){
          this.globals.SnackBar("error","Error getting Transaction Setup details");
          return;
        }
        else{
          sessionStorage.setItem("sessionTransactionSetup",data.apiData);
        }        
      });
      
      this.auth.sendBranchUpdate(brh.Branch_Name);

      //sessionStorage.setItem("sessionSelectedBranchSno",this.auth.SelectedBranchSno.toString())!;                   

      // let tset = new ClsAppSetup(this.dataService);
      // tset.getAppSetup(0).subscribe(data => {
      //   if (data.queryStatus == 0){
      //     this.globals.SnackBar("error","Error getting Transaction Setup details");
      //     return;
      //   }
      //   else{
      //     sessionStorage.setItem("sessionTransactionSetup",data.apiData);
      //   }        
      // });
      
      //this.auth.sendCompUpdate(comp.Comp_Name);
      
      this.router.navigate(['dashboard']);  
      this.dialogRef.close();           
    }
  }

 
}
