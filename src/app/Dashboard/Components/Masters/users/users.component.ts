import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UserComponent } from './user/user.component';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsUser, TypeUser } from 'src/app/Dashboard/Classes/ClsUsers';

@AutoUnsubscribe
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {

  constructor(private dataService: DataService, private globals: GlobalsService, private dialog: MatDialog ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  UserList!: TypeUser[];
  dataSource!: MatTableDataSource<TypeUser>;  
  columnsToDisplay: string[] = [ '#', 'UserName', 'User_Type', 'Active_Status' ,'crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadUserList();
  }

  LoadUserList(){
    let grp = new ClsUser(this.dataService);    
    grp.getUsers(0).subscribe( data => {    
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.UserList = JSON.parse(data.apiData);
        console.log(this.UserList);
        
        this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  } 

  AddNewUser(){
    var grp = new ClsUser(this.dataService);    
    this.OpenUser(grp.Initialize());    
  }
 
  OpenUser(grp: TypeUser){     
    const dialogRef = this.dialog.open(UserComponent, 
      {
        data: grp, 
      });       
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (result == true)
          {
            this.LoadUserList();
          }          
        }        
      });  
  } 

  DeleteUser(User: TypeUser){
    this.globals.QuestionAlert("Are you sure you wanto to delete this User?").subscribe(Response => {      
      if (Response == 1){
        let grp = new ClsUser(this.dataService);
        grp.User = User;
        grp.deleteUser().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","User deleted successfully");
            const index =  this.UserList.indexOf(User);
            this.UserList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeUser> (this.UserList);       
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
