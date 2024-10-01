import { Component } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsLoans, TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsReports, TypeInterestDetails, TypeInterestStructure, TypeLoanStatement } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-loansummary',
  templateUrl: './loansummary.component.html',
  styleUrls: ['./loansummary.component.scss'],  
})

@AutoUnsubscribe
export class LoansummaryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService){}

  AsOnDate: number = 0;
  LoansList!:       TypeLoan[];
  SelectedLoan!:    TypeLoan;
  
  InterestDetails!: TypeInterestDetails;
  InterestStructure: TypeInterestStructure[] = [];
  Statement: TypeLoanStatement[] = [];
  ngOnInit(){
    this.AsOnDate = this.globals.DateToInt( new Date());
    let ln = new ClsLoans(this.dataService);
    
    ln.getLoans(0,0,0, this.globals.LoanStatusAll, this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).subscribe(data=> {
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{
        this.LoansList = JSON.parse (data.apiData);
        this.LoansList.map(loan => {        
        return  loan.IGroup       =   JSON.parse (loan.IGroup_Json)[0],  
                  loan.Location   =   JSON.parse (loan.Location_Json)[0],
                  loan.Scheme     =   JSON.parse (loan.Scheme_Json)[0],
                  loan.Customer   =   JSON.parse (loan.Party_Json)[0], 
                  loan.fileSource =   loan.Images_Json ? JSON.parse (loan.Images_Json) : '';
        })     
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  LoadDetails(){
    let rep = new ClsReports(this.dataService);    
    rep.getLoanDetailed(this.SelectedLoan.LoanSno, this.AsOnDate).subscribe(data => {
      console.log(data);
      
      this.InterestDetails = JSON.parse (data.apiData)[0];        
      this.InterestStructure = JSON.parse (this.InterestDetails.Struc_Json);    
      this.Statement = JSON.parse (this.InterestDetails.Statement_Json);     
    })
  }

  getLoan($event: TypeLoan){      
    this.SelectedLoan = $event;   
    this.LoadDetails();  
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
}
