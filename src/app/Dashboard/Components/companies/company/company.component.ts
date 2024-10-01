import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsCompanies, TypeCompanies } from 'src/app/Dashboard/Classes/ClsCompanies';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})

@AutoUnsubscribe
export class CompanyComponent implements OnInit {
  
  Comp!:          TypeCompanies;  
  DataChanged:    boolean = false;

  // For Validations  
  CompNameValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<CompanyComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeCompanies,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService
  ) 
  {
    this.Comp = data;                
  }

  ngOnInit(): void {    


  }

  SaveCompany(){    
    if (this.ValidateInputs() == false) {return};    
    let comp = new ClsCompanies(this.dataService);
    comp.Comp = this.Comp;
    comp.Comp.ClientSno = this.auth.LoggedClient.ClientSno;
    
    // comp.Comp.BranchSno =this.auth.SelectedBranchSno;
     
    comp.saveCompany().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.globals.SnackBar("info", this.Comp.CompSno == 0 ? "Company Created successfully" : "Company updated successfully");
          this.DataChanged = true;
          this.CloseDialog();
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteCompany(){
    if (this.Comp.CompSno == 0){
      this.globals.SnackBar("error", "No Comp selected to delete");
      return;
    }
    this.globals.QuestionAlert("compe you sure you wanto to delete this Comp?").subscribe(Response => {      
      if (Response == 1){
        let comp = new ClsCompanies(this.dataService);
        comp.Comp = this.Comp;
        comp.deleteCompany().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Comp deleted successfully");
            this.DataChanged = true;
            this.CloseDialog();
          }
        })        
      }
    })
  }

  CloseDialog()  {
    this.dialogRef.close(this.DataChanged);
  }

  
  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
  

  ValidateInputs(): boolean{            
    if (!this.Comp.Comp_Name.length )  { this.CompNameValid = false;  return false; }  else  {this.CompNameValid = true; }        
    return true;
  }
  
}
