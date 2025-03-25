import { Component } from '@angular/core';
import { concatMap, from } from 'rxjs';
import { ClsCompanies, TypeCompanies } from 'src/app/Dashboard/Classes/ClsCompanies';
import { ClsLoans } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsParties } from 'src/app/Dashboard/Classes/ClsParties';
import { ClsSchemes, TypeScheme } from 'src/app/Dashboard/Classes/ClsSchemes';
import { ClsTransactions } from 'src/app/Dashboard/Classes/ClsTransactions';
import { ClsVoucherSeries, TypeVoucherSeries } from 'src/app/Dashboard/Classes/ClsVoucherSeries';
import { TypeFileImport } from 'src/app/Dashboard/Types/TypeFileImport';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-importdata',  
  templateUrl: './importdata.component.html',
  styleUrl: './importdata.component.scss'
})

export class ImportdataComponent {

  excelData: TypeFileImport[] = [];
  currLoan: number = 0;
  CompaniesList: TypeCompanies[] = [];
  SelectedCompany!: TypeCompanies;

  SeriesList: TypeVoucherSeries[] = [];
  SelectedSeries!: TypeVoucherSeries;

  SchemesList: TypeScheme[] = [];
  SelectedScheme!: TypeScheme;


  constructor(private dataService: DataService, private globals: GlobalsService){}
  
  ngOnInit(){
    let comp = new ClsCompanies(this.dataService);
    comp.getCompanies(1).subscribe(data=>{
      this.CompaniesList = JSON.parse (data.apiData);
    })    
  }

  onExcelFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      alert ('Cannot use multiple files');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const data: Uint8Array = new Uint8Array(e.target.result);
      const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });

      const sheetName: string = workbook.SheetNames[0]; // Get first sheet
      const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      this.excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert to JSON (Array of Arrays)
      //console.log(this.excelData); // Debugging
    };
    reader.readAsArrayBuffer(target.files[0]); // Read file
  }

  onJsonFileChange(event: any){
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        this.excelData = JSON.parse(e.target.result);
        // console.log('Parsed JSON:', this.excelData);
      } catch (error) {
        console.error('Invalid JSON file', error);
      }
    };
    reader.readAsText(file);
  }

  StartImporing(){
    this.currLoan = 1;
      from(this.excelData) // Convert array into observable sequence
      .pipe(
        concatMap(loan => this.ImportLoan(loan) ) // Ensures sequential execution
      )
      .subscribe(
        response => console.log('API Response:', response),
        error => console.error('Error:', error),
        () => console.log('All API calls completed!')
      );
    }
  

  ImportLoan(Loan: TypeFileImport){
    let trans = new ClsTransactions(this.dataService);

    return trans.importLoan(Loan)
  
  }
  //checkapi(){
    //   let items = [24, 25, 26, 27, 28]; 
      
    //   from(items) // Convert array into observable sequence
    //   .pipe(
    //     concatMap(item => this.makeapicall(item) ) // Ensures sequential execution
    //   )
    //   .subscribe(
    //     response => console.log('API Response:', response),
    //     error => console.error('Error:', error),
    //     () => console.log('All API calls completed!')
    //   );
    // }
    
    // makeapicall(item: number){
    //   console.log(item);
    //   let trans = new ClsTransactions(this.dataService);
    
    //   return trans.getLoans(item,0,0,0,0,0,0)
      
    // }

    getCompany($event: TypeCompanies){
      this.SelectedCompany = $event;

      let ser = new ClsVoucherSeries(this.dataService);
      ser.getVoucherSeriesforSelectedCompany(0,this.globals.VTypLoanPayment, this.SelectedCompany.CompSno).subscribe(data=>{
        this.SeriesList = JSON.parse(data.apiData);
        if (this.SeriesList && this.SeriesList.length > 0) {  this.getSeries(this.SeriesList[0]); }
      })

      let sch = new ClsSchemes(this.dataService);
      sch.getSchemesforSelectedCompany(0, this.SelectedCompany.CompSno).subscribe(data=>{
        this.SchemesList = JSON.parse(data.apiData);
        if (this.SchemesList && this.SchemesList.length > 0) { this.getScheme(this.SchemesList[0]); }
      })
    }

    getSeries($event: TypeVoucherSeries){
      this.SelectedSeries = $event;
    }

    getScheme($event: TypeScheme){
      this.SelectedScheme = $event;
    }
}
