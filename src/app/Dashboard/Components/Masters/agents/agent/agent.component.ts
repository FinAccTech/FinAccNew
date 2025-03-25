import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ClsAgents, TypeAgent } from 'src/app/Dashboard/Classes/ClsAgents';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-agent',  
  templateUrl: './agent.component.html',
  styleUrl: './agent.component.scss'
})
export class AgentComponent {
 
  Agent!:          TypeAgent;  

  // For Validations  
  CodeAutoGen: boolean = false;
  AgentNameValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<AgentComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeAgent,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService
  ) 
  {
    this.Agent = data;                
  }

  ngOnInit(): void {    
            
      if (this.globals.AppSetup()[0].AgentCode_AutoGen == 1){
        this.CodeAutoGen = true;
        if (this.Agent.AgentSno == 0){     
          let it = new ClsAgents(this.dataService)
          it.getAgentCode().subscribe(data => {
            this.Agent.Agent_Code = data.apiData;
          })
        }
      }
    
  }

  SaveAgent(){    
    if (this.ValidateInputs() == false) {return};    
    let ar = new ClsAgents(this.dataService);
    ar.Agent = this.Agent;
    ar.Agent.BranchSno =this.auth.SelectedBranchSno;
    
    ar.saveAgent().subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          ar.Agent.AgentSno = data.RetSno;
          ar.Agent.Name = ar.Agent.Agent_Name;
          ar.Agent.Details = 'Code: '+ ar.Agent.Agent_Code;
          this.globals.SnackBar("info", this.Agent.AgentSno == 0 ? "Agent Created successfully" : "Agent updated successfully");          
          this.CloseDialog(ar.Agent);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteAgent(){
    if (this.Agent.AgentSno == 0){
      this.globals.SnackBar("error", "No Agent selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Agent?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsAgents(this.dataService);
        ar.Agent = this.Agent;
        ar.deleteAgent().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Agent deleted successfully");            
            this.CloseDialog(ar.Agent);
          }
        })        
      }
    })
  }

  CloseDialog(Agent: TypeAgent)  {
    this.dialogRef.close(Agent);
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{            
    if (!this.Agent.Agent_Name!.length )  { this.AgentNameValid = false;  return false; }  else  {this.AgentNameValid = true; }        
    return true;
  }
  
}
