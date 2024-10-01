import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ClsVoucherSeries, TypeVoucherSeries } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { VoucherseriesComponent } from './voucherseries/voucherseries.component';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';


@Component({
  selector: 'app-voucherserieslist',
  templateUrl: './voucherserieslist.component.html',
  styleUrls: ['./voucherserieslist.component.scss']
})

@AutoUnsubscribe
export class VoucherserieslistComponent {

  constructor(private dataService: DataService, private globals: GlobalsService, private dialog: MatDialog ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  VoucherSeriesList!: TypeVoucherSeries[];
  dataSource!: MatTableDataSource<TypeVoucherSeries>;  
  columnsToDisplay: string[] = [ '#', 'Series_Name', 'VouType','Num_Method', 'Current_No','Prefix', 'IsStd', 'IsDefault', 'Active_Status','crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadVoucherSeriesList();    
  }

  LoadVoucherSeriesList(){    
    let vou = new ClsVoucherSeries(this.dataService);         
    vou.getVoucherSeries(0,0).subscribe ( data => {      
            if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.VoucherSeriesList = JSON.parse(data.apiData);                 
        this.LoadDataIntoMatTable();
        console.log(this.VoucherSeriesList);
        
      }
    },
    error => {
      console.log(error);
      
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  AddNewVoucherSeries(){
    var VoucherSeries = new ClsVoucherSeries(this.dataService);    
    this.OpenVoucherSeries(VoucherSeries.Initialize());    
  }

  OpenVoucherSeries(VoucherSeries: TypeVoucherSeries){        
    const dialogRef = this.dialog.open(VoucherseriesComponent, 
      {
        data: VoucherSeries,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (result == true)
          {
            this.LoadVoucherSeriesList();
          }          
        }        
      });  
  } 

  DeleteVoucherSeries(series: TypeVoucherSeries){
    if (series.IsStd){
      this.globals.ShowAlert(3,"Standard Series cannot be deleted");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Group?").subscribe(Response => {      
      if (Response == 1){
        let vou = new ClsVoucherSeries(this.dataService);
        vou.Series = series;
        vou.deleteVoucherSeries().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info","Group deleted successfully");
            const index =  this.VoucherSeriesList.indexOf(series);
            this.VoucherSeriesList.splice(index,1);
            this.LoadDataIntoMatTable();
          }
        })        
      }
    })
  }

  LoadDataIntoMatTable(){
    this.dataSource = new MatTableDataSource<TypeVoucherSeries> (this.VoucherSeriesList);       
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
