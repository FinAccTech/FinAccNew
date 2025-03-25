import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsBranches, TypeBranch } from 'src/app/Dashboard/Classes/ClsBranches';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss'
})
@AutoUnsubscribe
export class BranchComponent {
  Branch!:          TypeBranch;  

  // For Validations  
  CodeAutoGen: boolean = false;
  BranchNameValid: boolean = true; 
  
  constructor(
    public dialogRef: MatDialogRef<BranchComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: TypeBranch,    
    private dataService: DataService,    
    private globals: GlobalsService,    
  ) 
  {
    this.Branch = data;                
  }

  ngOnInit(): void {        
      if (this.globals.AppSetup()[0].BranchCode_AutoGen == 1){
        this.CodeAutoGen = true;
        if (this.Branch.BranchSno == 0){     
          let it = new ClsBranches(this.dataService)
          it.getBranchCode().subscribe(data => {
            this.Branch.Branch_Code = data.apiData;
          })
        }
      }    
  }

  SaveBranch(){    
    if (!this.Branch.Branch_Code || this.Branch.Branch_Code == ''){
      this.globals.SnackBar("error","Branch Code is Mandatory");
      return;
    }
    
    if (!this.Branch.Branch_Name || this.Branch.Branch_Name == ''){
      this.globals.SnackBar("error","Branch Name is Mandatory");
      return;
    }

    if (this.ValidateInputs() == false) {return};    
    let ar = new ClsBranches(this.dataService);
    ar.Branch = this.Branch;
    
    console.log(this.Branch);
    
    ar.saveBranch().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          ar.Branch.BranchSno = data.RetSno;
          ar.Branch.Name = ar.Branch.Branch_Name;
          ar.Branch.Details = 'Code: '+ ar.Branch.Branch_Code;
          this.globals.SnackBar("info", this.Branch.BranchSno == 0 ? "Branch Created successfully" : "Branch updated successfully");          
          this.CloseDialog(ar.Branch);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteBranch(){
    if (this.Branch.BranchSno == 0){
      this.globals.SnackBar("error", "No Branch selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Branch?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsBranches(this.dataService);
        ar.Branch = this.Branch;
        ar.deleteBranch().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Branch deleted successfully");            
            this.CloseDialog(ar.Branch);
          }
        })        
      }
    })
  }

  CloseDialog(Branch: TypeBranch)  {
    this.dialogRef.close(Branch);
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{            
    if (!this.Branch.Branch_Name.length )  { this.BranchNameValid = false;  return false; }  else  {this.BranchNameValid = true; }        
    return true;
  }
  
}
