import { Component } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsParties, TypeParties } from 'src/app/Dashboard/Classes/ClsParties';
import { TypeRepledge } from 'src/app/Dashboard/Classes/ClsRepledges';
import { ClsReports, TypeCustomerDetailed, TypeSupplierDetailed } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-supplierhistory',
  templateUrl: './supplierhistory.component.html',
  styleUrls: ['./supplierhistory.component.scss']
})
@AutoUnsubscribe
export class SupplierhistoryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}
 
  AsOnDate: number = 0;
  SuppliersList!:       TypeParties[];
  SelectedSupplier!:    TypeParties;
  SelectedRepledge!: TypeRepledge;
  
  SupplierDetails!: TypeSupplierDetailed;
  RepledgeData: any[] = [];
  PrincipalTotal: number = 0;
  MarketValueTotal: number = 0;
  
  ngOnInit(){
    this.AsOnDate = this.globals.DateToInt( new Date());
    let pty = new ClsParties(this.dataService);
    
    pty.getParties(0,this.globals.PartyTypSuppliers,0,0,0).subscribe(data=> {
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{
        this.SuppliersList = JSON.parse (data.apiData);        
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  LoadDetails(){
    let rep = new ClsReports(this.dataService);
    rep.getSupplierDetailed(this.SelectedSupplier.PartySno).subscribe(data =>{
      this.SupplierDetails = JSON.parse (data.apiData)[0];                
      this.RepledgeData = JSON.parse(this.SupplierDetails.RepledgeLoans_Json!);   

      this.PrincipalTotal  = 0;
      this.MarketValueTotal = 0;

      this.RepledgeData.forEach(rp => {
        this.PrincipalTotal += +rp.Principal,
        this.MarketValueTotal += +rp.Market_Value;
        
      });
    })
  }

  getSupplier($event: TypeParties){      
    this.SelectedSupplier = $event;   
    this.SelectedRepledge = null!;
    this.LoadDetails();  
  }
 

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  GetStatusColor(ln: TypeLoan){
    return ln.Loan_Status == this.globals.LoanStatusOpen ? 'green' :  ln.Loan_Status == this.globals.LoanStatusClosed ? '#6e6c6c' : ln.Loan_Status == this.globals.LoanStatusMatured ? 'red' : 'black';
  }
}
