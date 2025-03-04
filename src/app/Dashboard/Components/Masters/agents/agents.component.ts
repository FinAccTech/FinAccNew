import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClsAgents, TypeAgent } from 'src/app/Dashboard/Classes/ClsAgents';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { AgentComponent } from './agent/agent.component';

@Component({
  selector: 'app-agents',  
  templateUrl: './agents.component.html',
  styleUrl: './agents.component.scss'
})
export class AgentsComponent {

  constructor(private dataService: DataService, private auth: AuthService, private globals: GlobalsService, private dialog: MatDialog ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  AgentList!: TypeAgent[];
  dataSource!: MatTableDataSource<TypeAgent>;  
  columnsToDisplay: string[] = [ '#', 'Agent_Code', 'Agent_Name', 'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadAgentList();    
  }

  LoadAgentList(){    
    let ar = new ClsAgents(this.dataService);     
    
    ar.getAgents(0).subscribe ( data => {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.AgentList = JSON.parse(data.apiData);
                
        if (!this.AgentList){
          this.AgentList = [];
        }  
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewAgent(){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdAgents, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    var ar = new ClsAgents(this.dataService);    
    this.OpenAgent(ar.Initialize());    
  }

  OpenAgent(ar: TypeAgent){               
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdAgents, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    let Sno = ar.AgentSno; 
    const dialogRef = this.dialog.open(AgentComponent, 
      {
        data: ar,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        {           
          if (Sno !== 0) { return; }
          this.AgentList.push(result);
          this.LoadDataIntoMatTable()
        }        
      });  
  } 

  DeleteAgent(Agent: TypeAgent){
    if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdAgents, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Agent?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsAgents(this.dataService);
        ar.Agent = Agent;
        ar.deleteAgent().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Agent deleted successfully");
            const index =  this.AgentList.indexOf(Agent);
            this.AgentList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeAgent> (this.AgentList);       
    if (this.dataSource.filteredData)
    {  
      setTimeout(() => this.dataSource.paginator = this.paginator);
      setTimeout(() => this.dataSource.sort = this.sort);      
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
}
