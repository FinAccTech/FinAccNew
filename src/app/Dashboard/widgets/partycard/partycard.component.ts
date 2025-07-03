import { AfterViewInit, Component, Input, } from '@angular/core';
import { TypeCustomerDetailed } from '../../Classes/ClsReports';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { GlobalsService } from 'src/app/Services/globals.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-partycard',  
  templateUrl: './partycard.component.html',
  styleUrls: ['./partycard.component.scss']
})

@AutoUnsubscribe 
export class PartycardComponent implements AfterViewInit {

  constructor(private globals: GlobalsService, private router: Router) {}

  @Input() Party!:TypeCustomerDetailed; 
  @Input() LoanData!:any; 
  @Input() HideStatusCount:boolean = false; 

  OpenLoans: number = 0 
  ClosedLoans: number = 0 
  MaturedLoans: number = 0
  AuctionedLoans: number = 0
  
  ngAfterViewInit(){         
    if(this.LoanData){          
      this.OpenLoans = this.LoanData.filter((ln: any) =>{
        return  (ln.Approval_Status == this.globals.ApprovalStatusApproved) 
                && 
                (ln.Cancel_Status == this.globals.CancelStatusNotCancelled) 
                && 
                ((ln.Loan_Status == this.globals.LoanStatusOpen));
      }).length;

      this.ClosedLoans = this.LoanData.filter((ln: any) =>{
        return  (ln.Approval_Status == this.globals.ApprovalStatusApproved) 
                && 
                (ln.Cancel_Status == this.globals.CancelStatusNotCancelled) 
                && 
                ((ln.Loan_Status == this.globals.LoanStatusClosed));
      }).length;

      this.MaturedLoans = this.LoanData.filter((ln: any) =>{
        return  (ln.Approval_Status == this.globals.ApprovalStatusApproved) 
                && 
                (ln.Cancel_Status == this.globals.CancelStatusNotCancelled) 
                && 
                ((ln.Loan_Status == this.globals.LoanStatusMatured));
      }).length;

      this.AuctionedLoans = this.LoanData.filter((ln: any) =>{
        return  (ln.Approval_Status == this.globals.ApprovalStatusApproved) 
                && 
                (ln.Cancel_Status == this.globals.CancelStatusNotCancelled) 
                && 
                ((ln.Loan_Status == this.globals.LoanStatusAuctioned));
      }).length;
    }
  }

  OpenHistory(){
    this.router.navigate(['dashboard/customerhistory/'+ this.Party.PartySno]);
  }
}
