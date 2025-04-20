import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAreas, TypeArea } from 'src/app/Dashboard/Classes/ClsAreas';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})

@AutoUnsubscribe
export class AreaComponent implements OnInit {
  
  Area!:          TypeArea;  

  // For Validations  
  CodeAutoGen: boolean = false;
  AreaNameValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<AreaComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeArea,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService
  ) 
  {
    this.Area = data;                
  }

  ngOnInit(): void {    
            
      if (this.globals.AppSetup()[0].AreaCode_AutoGen == 1){
        this.CodeAutoGen = true;
        if (this.Area.AreaSno == 0){     
          let it = new ClsAreas(this.dataService)
          it.getAreaCode().subscribe(data => {
            this.Area.Area_Code = data.apiData;
          })
        }
      }
    
  }

  SaveArea(){    
    if (this.ValidateInputs() == false) {return};    
    let ar = new ClsAreas(this.dataService);
    ar.Area = this.Area;
    ar.Area.BranchSno =this.auth.SelectedBranchSno();
    
    ar.saveArea().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          ar.Area.AreaSno = data.RetSno;
          ar.Area.Name = ar.Area.Area_Name;
          ar.Area.Details = 'Code: '+ ar.Area.Area_Code;
          this.globals.SnackBar("info", this.Area.AreaSno == 0 ? "Area Created successfully" : "Area updated successfully");          
          this.CloseDialog(ar.Area);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteArea(){
    if (this.Area.AreaSno == 0){
      this.globals.SnackBar("error", "No Area selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Area?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsAreas(this.dataService);
        ar.Area = this.Area;
        ar.deleteArea().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Area deleted successfully");            
            this.CloseDialog(ar.Area);
          }
        })        
      }
    })
  }

  CloseDialog(area: TypeArea)  {
    this.dialogRef.close(area);
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{            
    if (!this.Area.Area_Name.length )  { this.AreaNameValid = false;  return false; }  else  {this.AreaNameValid = true; }        
    return true;
  }
  
}
