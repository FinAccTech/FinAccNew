import { Component, ElementRef, ViewChild } from '@angular/core';
import { Location,} from '@angular/common';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsParties, TypeParties } from 'src/app/Dashboard/Classes/ClsParties';
import { ClsReports, TypeCustomerDetailed } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customerhistory',
  templateUrl: './customerhistory.component.html',
  styleUrls: ['./customerhistory.component.scss']
})
@AutoUnsubscribe
export class CustomerhistoryComponent {

  private searchSubject = new Subject<number>(); 
  @ViewChild('historyTable') historyTable!: ElementRef;
  
  constructor(private globals: GlobalsService, private dataService: DataService, private route: ActivatedRoute, private location: Location,){
    this.searchSubject
    .pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged() // Only emit if the value is different from the last
    )
    .subscribe((searchText) => {                  
      if (searchText < 1) {return;}
      let pty = new ClsParties(this.dataService);  
      pty.getParties(searchText,0,0,0,0).subscribe(data=>{
        if (data.apiData){
          this.getCustomer(JSON.parse(data.apiData)[0]);
          this.BarCode =0;
        }
        else{
          this.SelectedCustomer = pty.Initialize();
          this.CustomerDetails = null!; 
          this.BarCode =0;
        }
      })
      this.BarCode =0;
      // Add your search logic here
    });
  }
  
  AsOnDate:             number = 0;
  CustomersList!:       TypeParties[];
  SelectedCustomer!:    TypeParties; 
  SelectedLoan!:        TypeLoan;
  
  CustomerDetails!: TypeCustomerDetailed;
  LoanData: any[] = [];
  PrincipalTotal: number = 0; 
  MarketValueTotal: number = 0; 
  NettPayableTotal: number = 0;
  BarCode: number = 0;
  RoutedPartySno: number = 0;

  ngOnInit(){
    this.route.paramMap.subscribe(params => {
      const partysno = params.get('partysno'); 
      this.RoutedPartySno = +partysno!;      
    });

    this.AsOnDate = this.globals.DateToInt( new Date());
    let pty = new ClsParties(this.dataService);
    
    pty.getParties(0,this.globals.PartyTypCustomers,0,0,0).subscribe(data=> {
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{
        this.CustomersList = JSON.parse (data.apiData);   
        if (this.RoutedPartySno !== 0){
          this.SelectedCustomer = this.CustomersList.find(cust=>{ return cust.PartySno == this.RoutedPartySno})!;
          this.LoadDetails();
        }
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  
  LoadDetails(){
    let rep = new ClsReports(this.dataService);
    rep.getCustomerDetailed(this.SelectedCustomer.PartySno).subscribe(data =>{
            
      this.CustomerDetails = JSON.parse (data.apiData)[0];                
       
      this.LoanData = JSON.parse(this.CustomerDetails.Loans_Json!);   

      this.PrincipalTotal  = 0;
      this.MarketValueTotal = 0;
      this.NettPayableTotal = 0;

      this.LoanData.forEach(ln => {
        this.PrincipalTotal += +ln.Principal,
        this.MarketValueTotal += +ln.Market_Value;

        if (ln.Loan_Status == this.globals.LoanStatusOpen || ln.Loan_Status == this.globals.LoanStatusMatured) {
          this.NettPayableTotal += (+ln.Interest_Balance + +ln.Principal_Balance);         
        }
      });

    })
  }

  onSearchByBarCode(event: Event): void { 
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(+input.value);
  }

  getCustomer($event: TypeParties){      
    this.SelectedCustomer = $event;   
    this.SelectedLoan = null!;
    this.LoadDetails();  
  }
 

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  GetStatusColor(ln: TypeLoan){
    return ln.Loan_Status == this.globals.LoanStatusOpen ? 'green' :  ln.Loan_Status == this.globals.LoanStatusClosed ? '#6e6c6c' : ln.Loan_Status == this.globals.LoanStatusMatured ? 'red' : 'black';
  }

  GoBack(){ 
    this.location.back();
  }

  printTable() {
    let printContents = ' <div style="text-align:center" > <h3> Customer History of '+ this.SelectedCustomer.Party_Name + 'As on ' + this.globals.IntToDateString (this.AsOnDate) + ' </h3>  </div>';
    printContents += this.historyTable.nativeElement.innerHTML;
    let popupWin;    
        popupWin = window.open();
        popupWin!.document.open();
        popupWin!.document.write(`
           <html> 
                  <head>
                    <style> 
                    
                        @media print {
                            .pagebreak { page-break-before: always; } /* page-break-after works, as well */
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid black; padding: 8px; text-align: left; }
                            th { background-color: #f4f4f4; }
                        }

                    </style>
                  </head>
                  <body onload="window.print();window.close()">${printContents}</body>
                </html>`
          );
          popupWin!.document.close();        
    // const printWindow = window.open('', '', 'height=600,width=800');
    
    // if (printWindow) {
    //   printWindow.document.write('<html><head><title>Print Table</title>');
    //   printWindow.document.write('<style>');
    //   printWindow.document.write(`
    //     body { font-family: Arial, sans-serif; }
    //     table { width: 100%; border-collapse: collapse; }
    //     th, td { border: 1px solid black; padding: 8px; text-align: left; }
    //     th { background-color: #f4f4f4; }
    //   `);
    //   printWindow.document.write('</style></head><body>');
    //   printWindow.document.write(printContents);
    //   printWindow.document.write('</body></html>');
    //   printWindow.document.close();
    //   printWindow.print();
    // }
  }
}
