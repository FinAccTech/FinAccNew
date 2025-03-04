import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA,  MatDialogRef } from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsDivisions, TypeDivision } from 'src/app/Dashboard/Classes/ClsDivisions';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-division',  
  templateUrl: './division.component.html',
  styleUrl: './division.component.scss'
})
@AutoUnsubscribe
export class DivisionComponent {
  Division!:          TypeDivision;  

  // For Validations  
  CodeAutoGen: boolean = false;
  DivisionNameValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<DivisionComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: TypeDivision,    
    private dataService: DataService,    
    private globals: GlobalsService,    
  ) 
  {
    this.Division = data;                
  }

  ngOnInit(): void {    
            
      
  }

  SaveDivision(){    
    
    if (!this.Division.Div_Code || this.Division.Div_Code == ''){
      this.globals.SnackBar("error","Division Code is Mandatory");
      return;
    }
    
    if (!this.Division.Div_Name || this.Division.Div_Name == ''){
      this.globals.SnackBar("error","Division Name is Mandatory");
      return;
    }

    if (this.ValidateInputs() == false) {return};    
    let ar = new ClsDivisions(this.dataService);
    ar.Division = this.Division;
        
    ar.saveDivision().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          ar.Division.DivSno = data.RetSno;
          ar.Division.Name = ar.Division.Div_Name;
          ar.Division.Details = 'Code: '+ ar.Division.Div_Code;
          this.globals.SnackBar("info", this.Division.DivSno == 0 ? "Division Created successfully" : "Division updated successfully");          
          this.CloseDialog(ar.Division);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteDivision(){
    if (this.Division.DivSno == 0){
      this.globals.SnackBar("error", "No Division selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Division?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsDivisions(this.dataService);
        ar.Division = this.Division;
        ar.deleteDivision().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Division deleted successfully");            
            this.CloseDialog(ar.Division);
          }
        })        
      }
    })
  }

  CloseDialog(Division: TypeDivision)  {
    this.dialogRef.close(Division);
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  
  ValidateInputs(): boolean{            
    if (!this.Division.Div_Name.length )  { this.DivisionNameValid = false;  return false; }  else  {this.DivisionNameValid = true; }        
    return true;
  }
  
}
