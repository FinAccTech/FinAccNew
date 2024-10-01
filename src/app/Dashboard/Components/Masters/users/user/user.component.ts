import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsCompanies, TypeCompanies } from 'src/app/Dashboard/Classes/ClsCompanies';
import { ClsUser, TypeCompRights, TypeUser } from 'src/app/Dashboard/Classes/ClsUsers';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { UserrightsComponent } from '../userrights/userrights.component';
import { FileHandle } from 'src/app/Dashboard/Types/file-handle';
import { DomSanitizer } from '@angular/platform-browser';

@AutoUnsubscribe
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})

export class UserComponent implements OnInit {
  
  User!: TypeUser;
  DataChanged: boolean = false;
  CompaniesList: TypeCompanies[] = [];
  CompRightsList: TypeCompRights[] = [];

  TransImages!: FileHandle;

  // For Validations  
  UserNameValid: boolean = true;
  PasswordValid: boolean = true;
  
  
  constructor(
    public dialogRef: MatDialogRef<UserComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeUser,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
  ) 
  {    
    this.User = data;            
  }
 
  ngOnInit(): void {        
    let comp = new ClsCompanies(this.dataService)
      comp.getCompanies(this.auth.LoggedUser.UserSno).subscribe(data =>{       
        if (this.User.UserSno == 0){
          this.CompRightsList = JSON.parse (data.apiData);
          this.CompRightsList.map(right=>{
            right.Comp_Right = false;
          })          
        }
        else{          
          if (this.User.Comp_Rights_Json && this.User.Comp_Rights_Json.length >0){
            this.CompRightsList = JSON.parse(this.User.Comp_Rights_Json);
          }
          else{
            this.CompRightsList = [];
          }
          if (this.CompRightsList.length < 1){
            this.CompRightsList = JSON.parse (data.apiData);
            this.CompRightsList.map(right=>{
              right.Comp_Right = false;
            })
          }   
                               
        }
      })    

      if (this.User.UserSno !== 0){
               
        if (this.User.Rights_Json && this.User.Rights_Json.length >0){
          this.User.Rights_List = JSON.parse (this.User.Rights_Json);
        }
        else{
          this.User.Rights_List = [];
        }        
        
        this.TransImages = {"DelStatus":0, "Image_File":null!, "Image_Url":this.User.Profile_Image, "SrcType":1,"Image_Name":this.User.Image_Name} ;
        this.User.fileSource =  {"DelStatus":0, "Image_File":null!, "Image_Url":this.User.Profile_Image, "SrcType":1,"Image_Name":this.User.Image_Name};           
      }
      else{
        this.TransImages = {"DelStatus":0, "Image_File":null!, "Image_Url":"", "SrcType":1,"Image_Name":""} ;
        this.User.fileSource =  {"DelStatus":0, "Image_File":null!, "Image_Url":"", "SrcType":1,"Image_Name":""};  
      }
      
      
  }

  SaveUser(){        
    if (this.ValidateInputs() == false) {return};    
    let um = new ClsUser(this.dataService);
    um.User = this.User;    
    um.User.UserRightsXml = this.GetRightsXml();
    um.User.CompRightsXml = this.GetCompRightsXml();
    um.User.Profile_Image = this.auth.getUserImagesServerPath() + um.User.UserName + '/' + this.TransImages.Image_Name;
    um.User.Image_Name = this.TransImages.Image_Name;
    um.User.fileSource = this.TransImages;

    um.saveUser().subscribe(data => {            
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.globals.SnackBar("info", this.User.UserSno == 0 ? "User created successfully" : "User updated successfully");
          this.auth.LoggedUser.Profile_Image = this.auth.getUserImagesServerPath() + um.User.UserName + '/' + this.TransImages.Image_Name;
          this.DataChanged = true;
          this.CloseDialog();
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  
  DeleteUser(){
    if (this.User.UserSno == 0){
      this.globals.SnackBar("error", "No User selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this User?").subscribe(Response => {      
      if (Response == 1){
        let um = new ClsUser(this.dataService);
        um.User = this.User;
        um.deleteUser().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "User deleted successfully");
            this.DataChanged = true;
            this.CloseDialog();
          }
        })        
      }
    })
  }

  OpenUserRights(){
    const dialogRef = this.dialog.open(UserrightsComponent, 
      {
        data: this.User.Rights_Json, 
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          this.User.Rights_List = result;
        }        
      });  
  }
  
  CloseDialog()  {
    this.dialogRef.close(this.DataChanged);
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{        
    if (!this.User.UserName!.length )  { this.UserNameValid = false;  return false; }  else  {this.UserNameValid = true; }    
    return true;
  }

  ChangeSelectValue(comp: TypeCompRights, $event: any){
    comp.Comp_Right = $event.target.checked;
  }
  
  GetRightsXml(){
    let StrXml = '<ROOT>';
    StrXml += '<Users>';
    this.User.Rights_List.forEach(right=>{
      StrXml += '<User_Rights ';  
        StrXml += 'FormSno="' + right.FormSno + '" VR="' + right.View_Right + '" ER="' + right.Edit_Right + '" PR="' + right.Print_Right + '" DR="' + right.Delete_Right + '" CR="' + right.Create_Right + '" RR="1" DA="' + right.Date_Access + '" SA="' + right.Search_Access + '" ';  
      StrXml += '/>';  
    })
    StrXml += '</Users>';
    StrXml += '</ROOT>';
    
    return StrXml;
  }

  GetCompRightsXml(){
    let StrXml = '<ROOT>';
    StrXml += '<Companies>';
    this.CompRightsList.forEach(right=>{
      StrXml += '<Comp_Rights ';  
        StrXml += 'CompSno="' + right.CompSno + '" Comp_Right="' + right.Comp_Right + '"';  
      StrXml += '/>';  
    })
    StrXml += '</Companies>';
    StrXml += '</ROOT>';
    
    return StrXml;
  }
  selectFile($event: any)
  {     
    if ($event.target.files)
    {
      // for (var i=0; i < $event.target.files.length; i++)
      // {
        const file = $event?.target.files[0];
        var reader = new FileReader();
        reader.readAsDataURL($event.target.files[0]);
        reader.onload = (event: any) => {
          const fileHandle: FileHandle ={
            Image_Name: file.name,
            Image_File: event.target.result,  
            Image_Url: this.sanitizer.bypassSecurityTrustUrl(
              window.URL.createObjectURL(file),              
            ),
            SrcType:0,
            DelStatus:0
          };          
          //this.TransImages[0] = (fileHandle);
          this.TransImages = (fileHandle);
          //this.User.Profile_Image = fileHandle.Image_File;                  
        }
      // }        
    }    
    
  }
}

