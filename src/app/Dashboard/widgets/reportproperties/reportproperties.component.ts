import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { ClsReportProperties, TypeReportPropertie } from '../../Classes/ClsReport_Properties';
import { DataService } from 'src/app/Services/data.service';
import { FormsModule } from '@angular/forms';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-reportproperties',
  standalone: true,
  imports: [FormsModule, MatDialogClose],
  templateUrl: './reportproperties.component.html',
  styleUrl: './reportproperties.component.scss'
})
export class ReportpropertiesComponent {
constructor(
    public dialogRef: MatDialogRef<ReportpropertiesComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: number,            
    private dataService: DataService,
    private globals: GlobalsService
  )  {}

  RepProps!: TypeReportPropertie;
  StyleList: string[] = [];
  NewStyleName: string = "";

  ngOnInit(){
    let rep = new ClsReportProperties(this.dataService);
    rep.getReportProperties(this.data,).subscribe(data=>{
      this.RepProps = JSON.parse(data.apiData)[0];            
      if (this.RepProps.Report_Style !== ''){
        this.StyleList = this.RepProps.Report_Style.split(";");
      }
    })    
    //this.StyleList = this.data.result;    
  }

  AddStyle(){
    if (this.NewStyleName.trim() == ''){ this.globals.SnackBar("error","StyleName cannot be empty, 1000"); return; }      
    this.StyleList.push(  this.NewStyleName);
    let rep = new ClsReportProperties(this.dataService);  
    rep.ReportPropertie = this.RepProps;

    console.log(this.RepProps);
    
    console.log(rep.ReportPropertie);
    
    rep.saveReportProperties().subscribe(data=>{
      if (data.queryStatus == 1){
        this.NewStyleName = "";
        this.ExtractStyles();
      }
      else{
        this.globals.SnackBar("error", "Problem adding Style");        
      }
      
    })
    
  }

  RemoveStyle($index: number){
    this.StyleList.splice($index, 1)
    this.ExtractStyles();
  }

  SelectStyle(style: string){
    style = style.trim();
    this.dialogRef.close(style);
  }
  ExtractStyles(){
    this.RepProps.Report_Style = "";
    this.StyleList.forEach((sty) =>{
      this.RepProps.Report_Style += sty + '; ';
    })
    
  }
}
