import { Component } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsBranches, TypeBranch } from 'src/app/Dashboard/Classes/ClsBranches';
import { ClsDivisions, TypeDivision } from 'src/app/Dashboard/Classes/ClsDivisions';
import { DataService } from 'src/app/Services/data.service';
import { DivisionComponent } from './division/division.component';
import { MatDialog } from '@angular/material/dialog';
import { BranchComponent } from './branch/branch.component';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-branchdivisions',
  standalone: true,
  imports: [],
  templateUrl: './branchdivisions.component.html',
  styleUrl: './branchdivisions.component.scss'
})

@AutoUnsubscribe
export class BranchdivisionsComponent {

  DivisionList: TypeDivision[] = [];
  BranchesList: TypeBranch[] = [];
  SelectedDivision!: TypeDivision;

  constructor(private dataService: DataService, private dialog: MatDialog, private globals: GlobalsService){}

  ngOnInit(){
    let div = new ClsDivisions(this.dataService);
    div.getDivisions(0).subscribe(data=>{
      this.DivisionList = JSON.parse(data.apiData);
    })
  }

  CreateDivision(){
    let div = new ClsDivisions(this.dataService);
    let newDiv = div.Initialize();
    
    const dialogRef = this.dialog.open(DivisionComponent, 
      {
        data: newDiv,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        {           
          this.DivisionList.push(result);
          this.globals.SnackBar("info", "Division Deleted Successfully")
        }        
      }); 
  }

  CreateBranch(){
    if (!this.SelectedDivision || this.SelectedDivision.DivSno == 0){
      this.globals.SnackBar("error", "Select a Division to create a Branch");
      return;
    }

    let brh = new ClsBranches(this.dataService);
    let brhObj = brh.Initialize();
    brhObj.Division! = this.SelectedDivision;

    const dialogRef = this.dialog.open(BranchComponent, 
      {
        data: brhObj,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        {           
            this.BranchesList.push(result);
            this.globals.SnackBar("info", "Branch Created Successfully")
        }        
      }); 
  }

  OpenDivision(Div: TypeDivision){
    const dialogRef = this.dialog.open(DivisionComponent, 
      {
        data: Div,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        {           
          
        }        
      }); 
  }

  DeleteDivision(Div: TypeDivision, index: number){
    let div = new ClsDivisions(this.dataService);
    div.Division = Div;
    div.deleteDivision().subscribe(data=>{
      if (data.queryStatus == 1){
        this.DivisionList.splice(index,1);
        this.globals.SnackBar("info", "Division Deleted Successfully")
      }
      else{
        this.globals.ShowAlert(3,data.apiData);
      }
    })
  }

  LoadBranches(div: TypeDivision){
    let brh = new ClsBranches(this.dataService);
    brh.getBranches(0,div.DivSno).subscribe(data=>{
      this.BranchesList = JSON.parse(data.apiData);
    })
  }

  OpenBranch(brh: TypeBranch){
    const dialogRef = this.dialog.open(BranchComponent, 
      {
        data: brh,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        {          
            
        }        
      }); 
  }

  DeleteBranch(Brh: TypeBranch, index: number){
    let brh = new ClsBranches(this.dataService);
    brh.Branch = Brh;
    brh.deleteBranch().subscribe(data=>{
      if (data.queryStatus == 1){
        this.BranchesList.splice(index,1);
        this.globals.SnackBar("info", "Branch Deleted Successfully")
      }
      else{
        this.globals.ShowAlert(3,data.apiData);
      }
    })
  }

}
