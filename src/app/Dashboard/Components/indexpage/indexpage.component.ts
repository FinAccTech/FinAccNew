import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/Services/auth.service';
import { CompaniesComponent } from '../companies/companies.component';
import { ClsTransactions } from '../../Classes/ClsTransactions';
import { DataService } from 'src/app/Services/data.service';
import { EChartsOption } from 'echarts';
import { GlobalsService } from 'src/app/Services/globals.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

interface TypeStatusCard{
  FreshCount: number;
  FreshLoans: number;
  Loans: number;
  OldCount: number;
  OldLoans: number;
  PrevFreshLoans: number;
  PrevOldLoans: number;
  Receipts: number;
  Redemptions: number;
}

interface TypeTransactionList{
  VouTypeSno: number;
  VouType_Name: string;
  TransSno: number;
  Trans_No: string;
  Trans_Date: number;
  Party_Name: string;
  Nett_Payable: number;
  UserName: string;
}

interface TypeChartDataList{
  Month: number;
  Amount: number;
}

@Component({
  selector: 'app-indexpage',
  templateUrl: './indexpage.component.html',
  styleUrls: ['./indexpage.component.scss']
})

@AutoUnsubscribe
export class IndexpageComponent {
  LineDataXvalue: Array<string> = [];
  LineDataSource: Array<number> = [];
  DataChartList: TypeChartDataList[] = [];
  chartOption!: EChartsOption;
  constructor(private globals: GlobalsService, private dataService: DataService, private auth: AuthService, private dialog: MatDialog){
    
  }

  LoggedUser: string = "";
  Duration: number = 0;
  StatusData!: TypeStatusCard;
  TransactionList: TypeTransactionList[] = [];
  ChartType: number = 0;
  ChartPeriod: number = 0;

  ngOnInit(){
    this.LoggedUser = this.auth.LoggedUser.UserName!;

    
    if (this.auth.CompSelected == 0){      
      const dialogRef = this.dialog.open(CompaniesComponent,  
        {
          data: "", 
          height: '50%',  
          width: '50%',                  
        });
  
        dialogRef.disableClose = false;  
        dialogRef.afterClosed().subscribe(result => {             
        }); 
    }    
    
    this.LoadCard(0);
    let trans  = new ClsTransactions(this.dataService);
    trans.getRecentTransactions().subscribe(data=>{      
      this.TransactionList = JSON.parse (data.apiData);      
    })
    this.LoadChart();
  }

  
  LoadCard(duration: number){
    let trans  = new ClsTransactions(this.dataService);
    trans.getStatusCard(duration+1).subscribe(data=>{      
      this.StatusData = data.apiData[0];      
    })
  }

  SetChartType($event:any){
    this.ChartType = $event.target.value;
    this.LoadChart();
  }

  SetChartPeriod($event:any){
    this.ChartPeriod = $event.target.value;
    this.LoadChart();
  }

  LoadChart(){    
    let trans = new ClsTransactions(this.dataService);
    trans.getSummedMonthlyLoanAmount( this.ChartPeriod == 0 ? 3 : this.ChartPeriod == 1 ? 6 : 12 ).subscribe(data=>{
      this.DataChartList = JSON.parse(data.apiData);
      this.LineDataXvalue = [];
      this.LineDataSource = [];
      this.DataChartList.forEach(dt => {        
        this.LineDataXvalue.push(this.globals.GetMonthName(dt.Month,true));          
        this.LineDataSource.push(dt.Amount);  
        this.chartOption = {
          xAxis: {        
            type: 'category',
            data: this.LineDataXvalue,
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              data: this.LineDataSource,
              type: this.ChartType == 0 ? 'line' : 'bar',          
              color: 'orange',          
            },
          ],
        };
      });      
      
    })
  }

  // dataSource = [
  //   ['product', '2015', '2016', '2017'],
  //   ['April', 43.3, 85.8],
  //   ['May', 83.1, 73.4],
  //   ['June', 86.4, 65.2],
  //   ['July', 72.4, 53.9],
  //   ['August', 43.3, 85.8],
  //   ['September', 83.1, 73.4],
  //   ['October', 86.4, 65.2],
  //   ['November', 86.4, 65.2],
  //   ['December', 72.4, 53.9],
  //   ['January', 43.3, 85.8],
  //   ['February', 83.1, 73.4],
  //   ['March', 86.4, 65.2],    
  // ];

  // options: EChartsOption = {
  //   legend: {},
  //   tooltip: {},
  //   dataset: {
  //     // Provide a set of data.
  //     source: this.dataSource,
  //   },
  //   // Declare an x-axis (category axis).
  //   // The category map the first column in the dataset by default.
  //   xAxis: { type: 'category' },
  //   // Declare a y-axis (value axis).
  //   yAxis: {},
  //   // Declare several 'bar' series,
  //   // every series will auto-map to each column by default.
  //   series: [{ type: 'bar' }, { type: 'bar' }],
  // };

  // mergeOptions!: EChartsOption;

  // RandomDataset() {
  //   this.mergeOptions = {
  //     dataset: {
  //       source: [
          
  //         ['Matcha Latte', ...this.getRandomValues()],
  //         ['Milk Tea', ...this.getRandomValues()],
  //         ['Cheese Cocoa', ...this.getRandomValues()],
  //         ['Walnut Brownie', ...this.getRandomValues()],
  //       ],
  //     },
  //   };
  // }

  // private getRandomValues() {
  //   const res: number[] = [];
  //   for (let i = 0; i < 3; i++) {
  //     res.push(Math.random() * 100);
  //   }
  //   return res;
  // }
}
