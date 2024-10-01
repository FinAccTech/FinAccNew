import { Component } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsParties, TypeParties } from 'src/app/Dashboard/Classes/ClsParties';
import { ClsReports, TypeCustomerDetailed } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-customerhistory',
  templateUrl: './customerhistory.component.html',
  styleUrls: ['./customerhistory.component.scss']
})
@AutoUnsubscribe
export class CustomerhistoryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}
 
  AsOnDate: number = 0;
  CustomersList!:       TypeParties[];
  SelectedCustomer!:    TypeParties;
  SelectedLoan!: TypeLoan;
  
  CustomerDetails!: TypeCustomerDetailed;
  LoanData: any[] = [];
  PrincipalTotal: number = 0;
  MarketValueTotal: number = 0;
  
  ngOnInit(){
    this.AsOnDate = this.globals.DateToInt( new Date());
    let pty = new ClsParties(this.dataService);
    
    pty.getParties(0,this.globals.PartyTypCustomers,0,0,0).subscribe(data=> {
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{
        this.CustomersList = JSON.parse (data.apiData);        
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

      this.LoanData.forEach(ln => {
        this.PrincipalTotal += +ln.Principal,
        this.MarketValueTotal += +ln.Market_Value;
        
      });
    })
  }

  getCsutomer($event: TypeParties){      
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
}
