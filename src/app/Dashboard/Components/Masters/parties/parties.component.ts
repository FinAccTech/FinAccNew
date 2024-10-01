import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsParties, TypeParties } from 'src/app/Dashboard/Classes/ClsParties';
import { ActivatedRoute, Params } from '@angular/router';
import { PartyComponent } from './party/party.component';
import { AuthService } from 'src/app/Services/auth.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

interface TypePreviewStatus {
  Index: number;
  Status: boolean;
}

@AutoUnsubscribe

@Component({
  selector: 'app-parties',
  templateUrl: './parties.component.html',
  styleUrls: ['./parties.component.scss']
})
export class PartiesComponent {

 Party_Cat: number = 0;
  PartyCaption: string = "";
 ShowPreview: TypePreviewStatus[] = [];
  
  constructor(private route: ActivatedRoute, private dataService: DataService, private auth: AuthService, private globals: GlobalsService, private dialog: MatDialog ){
    this.route.params.subscribe(             
      (params: Params) => 
      {                      
        this.Party_Cat =  (params['partycat']);
        switch ( parseInt (this.Party_Cat.toString())) {
          case 1:
            this.PartyCaption = "Customers";
            break;
          case 2:
            this.PartyCaption = "Suppliers";
            break;
        }  
        this.LoadPartiesList();   
      });  
  }
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  PartiesList!: TypeParties[];
  dataSource!: MatTableDataSource<TypeParties>;  
  columnsToDisplay: string[] = [ '#', 'Party_Code', 'ProfileImage', 'Party_Name','RelGroup','Nominee', 'Mobile', 'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadPartiesList();    
  }

  LoadPartiesList(){    
    let pty = new ClsParties(this.dataService);     
    
    pty.getParties(0,this.Party_Cat,0,0,0).subscribe ( data => {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.PartiesList = JSON.parse(data.apiData);         

        if (!this.PartiesList) {
          this.PartiesList = [];
        }        
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewParty(){
    if (this.Party_Cat == this.globals.PartyTypCustomers){
      if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdCustomers, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    }
    else{
      if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdSuppliers, this.globals.UserRightCreate)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    }
    
    var pty = new ClsParties(this.dataService);    
    let rpty = pty.Initialize();
    rpty.Party_Cat = this.Party_Cat;
    this.OpenParty(rpty);    
  }

  OpenParty(pty: TypeParties){    
    if (this.Party_Cat == this.globals.PartyTypCustomers){
      if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdCustomers, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    }
    else{
      if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdSuppliers, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    }

    let Sno = pty.PartySno;    
    const dialogRef = this.dialog.open(PartyComponent, 
      { 
        width:"45vw", 
        height:"100%",
        position:{"right":"0","top":"0" },
        data: pty,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.PartiesList.push(result);
          this.LoadDataIntoMatTable();
        }        
      });  
  } 

  DeleteParty(Party: TypeParties){
    if (this.Party_Cat == this.globals.PartyTypCustomers){
      if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdCustomers, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    }
    else{
      if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdSuppliers, this.globals.UserRightDelete)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Party?").subscribe(Response => {      
      if (Response == 1){
        let pty = new ClsParties(this.dataService);
        pty.Party = Party;
        pty.deleteParty().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Party deleted successfully");
            const index =  this.PartiesList.indexOf(Party);
            this.PartiesList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeParties> (this.PartiesList);       
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
  
  EnablePreview(i: number){
    const itemIndex  = this.ShowPreview.findIndex((a) => a.Index == i);
    if (this.ShowPreview[itemIndex]){
      this.ShowPreview[itemIndex].Status = true;  
    }
    else{
      this.ShowPreview.push({"Index":i, "Status": true});
    }    
    
  }
  DisablePreview(i: number){
    const itemIndex  = this.ShowPreview.findIndex((a) => a.Index == i);
    this.ShowPreview[itemIndex].Status = false;
    // this.ShowPreview.splice(itemIndex,1);
    // //this.ShowPreview.push({"Index":i, "Status": false});
    // //console.log(this.ShowPreview);  
  }
}
