import { Component } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAppSetup, TypeAppSetup } from 'src/app/Dashboard/Classes/ClsAppSetup';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-appsetup',
  templateUrl: './appsetup.component.html',
  styleUrls: ['./appsetup.component.scss']
})

@AutoUnsubscribe
export class AppsetupComponent {

  constructor(private dataService: DataService, private globals: GlobalsService) {}

  AppSetup!: TypeAppSetup;

  ngOnInit(){
    let as = new ClsAppSetup(this.dataService);
    as.getAppSetup(0).subscribe(data =>{
      this.AppSetup = JSON.parse (data.apiData)[0];
    })
  }

  SaveSettings(){
    let as = new ClsAppSetup(this.dataService);
    as.AppSetup = this.AppSetup; 
    as.saveAppSetup().subscribe(data =>{
      if (data.queryStatus == 0){
        this.globals.ShowAlert(3,data.apiData)
      }
      else{
        sessionStorage.setItem("sessionTransactionSetup", JSON.stringify(this.AppSetup));        
        this.globals.SnackBar("info","Settings updated Sucessfully")
      }
    })
  }

}
