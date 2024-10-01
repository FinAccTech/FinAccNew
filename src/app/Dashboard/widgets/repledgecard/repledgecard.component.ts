import { Component, Input, SimpleChanges } from '@angular/core';
import { TypeRepledge } from '../../Classes/ClsRepledges';
import { ClsReports, TypeInterestDetails } from '../../Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';

@Component({
  selector: 'app-repledgecard',
  templateUrl: './repledgecard.component.html',
  styleUrls: ['./repledgecard.component.scss']
}) 

export class RepledgecardComponent {

  constructor(private dataService: DataService){}

  @Input() Repledge!:TypeRepledge; 
  @Input() AsOnDate: number = 0;
  LoansList: any[] = [];
  StrLoansList: string = "";
  InterestDetails!: TypeInterestDetails;

  LoadInterestDetails(){
    
    
    this.LoansList = JSON.parse(this.Repledge.RepledgeLoans_Json);
    this.LoansList.forEach(ln=>{
      this.StrLoansList += ln.Loan_No + ", ";
    })
    let rep = new ClsReports(this.dataService);    
    if (this.AsOnDate == 0 ) { return; }
    rep.getRepledgeDetailed(this.Repledge.RepledgeSno, this.AsOnDate).subscribe(data => {                        
      //console.log(data);            
      this.InterestDetails =(JSON.parse(data.apiData)[0]);                    
    })
  } 

  ngOnChanges(changes: SimpleChanges){        
    
    if (changes['Repledge']){
      this.Repledge =  changes['Repledge'].currentValue;
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
