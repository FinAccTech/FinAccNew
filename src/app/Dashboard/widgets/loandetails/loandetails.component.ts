import { AfterViewInit, Component, Input, SimpleChanges } from '@angular/core';
import { TypeLoan } from '../../Classes/ClsLoan';
import { ClsReports, TypeInterestDetails } from '../../Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-loandetails',
  templateUrl: './loandetails.component.html',
  styleUrls: ['./loandetails.component.scss']
})

@AutoUnsubscribe
export class LoandetailsComponent {

  constructor(private dataService: DataService, private globals: GlobalsService) {}

  
  @Input() Loan!: TypeLoan;
  @Input() ShowBalInfo: boolean = false;
  @Input() AsOnDate: number = 0;

  InterestDetails!: TypeInterestDetails;
  LoanSno: number = 0

  ngOnInit(){        
  //  this.AsOnDate = this.globals.DateToInt(new Date());    
    this.LoanSno = this.Loan.LoanSno;
    this.LoadInterestDetails();    
  }

  LoadInterestDetails(){
    let rep = new ClsReports(this.dataService);    
    if (this.AsOnDate == 0 ) { return; }
    rep.getLoanDetailed(this.LoanSno, this.AsOnDate).subscribe(data => {                        
      console.log(data.apiData);            
      this.InterestDetails =(JSON.parse(data.apiData)[0]);                    
    })
  } 

  ngOnChanges(changes: SimpleChanges){        
    
    if (changes['Loan']){
      this.LoanSno =  changes['Loan'].currentValue.LoanSno;
      this.LoadInterestDetails()
    }

    if (changes['AsOnDate']){
      this.AsOnDate = changes['AsOnDate'].currentValue;
      this.LoadInterestDetails()
    }
      //if (changes['Loan'].currentValue && changes['Loan'].previousValue && (changes['Loan'].currentValue.LoanSno !== changes['Loan'].previousValue.LoanSno)){
        // this.LoanSno =  changes['Loan'].currentValue.LoanSno;
        // this.AsOnDate = changes['AsOnDate'].currentValue;
        // this.LoadInterestDetails();    
      //}      
    
  }
}
