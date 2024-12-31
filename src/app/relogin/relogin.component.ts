import { Component } from '@angular/core';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { GlobalsService } from '../Services/globals.service';

@Component({
  selector: 'app-relogin',
  standalone: true,
  imports: [MatDialogClose, FormsModule],
  templateUrl: './relogin.component.html',
  styleUrl: './relogin.component.scss'
})
export class ReloginComponent {
  constructor(private dialogRef: MatDialogRef<ReloginComponent>, private globals: GlobalsService) {}
  Password: string = "";

  ReLogin() {
    let UserDetails =  JSON.parse (sessionStorage.getItem("sessionLoggedUser")!);
    //UserDetails = (JSON.parse (UserDetails!)[0]);    
    if (this.Password == UserDetails.Password){
      this.dialogRef.close('stay');
    }else{
      this.globals.SnackBar("error","Invalid Relogin attempt");
    }
  }

  logout() {
    this.dialogRef.close();
  }
}
