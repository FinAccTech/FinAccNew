import { Component } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsLoans, TypeLoan } from 'src/app/Dashboard/Classes/ClsLoan';
import { ClsReports, TypeInterestDetails, TypeInterestStructure, TypeLoanStatement } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiDataService } from 'src/app/Services/api-data.service';

@Component({
  selector: 'app-loansummary',
  templateUrl: './loansummary.component.html',
  styleUrls: ['./loansummary.component.scss'],  
})

@AutoUnsubscribe
export class LoansummaryComponent {

  private searchSubject = new Subject<number>();
  private searchSubjectLoanNo = new Subject<string>();

  constructor(private globals: GlobalsService, private dataService: DataService, private apidataService: ApiDataService,){
    this.searchSubject
        .pipe(
          debounceTime(300), // Wait 300ms after user stops typing
          distinctUntilChanged() // Only emit if the value is different from the last
        )
        .subscribe((searchText) => {                  
          if (searchText < 1) { this.BarCode= 0; return;}
          let ln = new ClsLoans(this.dataService);  
          ln.getLoanBySno(searchText,0,0,0,0,0,0,).subscribe(data=>{
            if (data.apiData){
              let fLn = JSON.parse(data.apiData)[0];
              fLn.Customer = JSON.parse(fLn.Party_Json)[0];
              if (fLn.Images_Json) {fLn.fileSource =  JSON.parse(fLn.Images_Json);}
              fLn.IGroup = JSON.parse(fLn.Group_Json)[0];
              fLn.Location  = JSON.parse(fLn.Location_Json)[0];          
              fLn.Scheme = JSON.parse(fLn.Scheme_Json)[0];                    
              this.getLoan(fLn);
            }
            else{
              this.getLoan( null!);
              this.BarCode = 0;
              //this.CustomerDetails = null!; 
            }                    
          })
          // Add your search logic here
          this.BarCode = 0;
        });

    this.searchSubjectLoanNo
        .pipe(
          debounceTime(300), // Wait 300ms after user stops typing
          distinctUntilChanged() // Only emit if the value is different from the last
        )
        .subscribe((searchText) => {                  
          if (!searchText || searchText.length < 3) { return;}
          let ln = new ClsLoans(this.dataService);  
          ln.getLoanbySearch(searchText, this.globals.LoanStatusAll,this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).subscribe(data=>{
            if (data.apiData){
              this.LoansList = JSON.parse(data.apiData);
                            
              this.LoansList.map(loan => {        
              return  loan.IGroup       =   JSON.parse (loan.IGroup_Json)[0],  
                        loan.Location   =   JSON.parse (loan.Location_Json)[0],
                        loan.Scheme     =   JSON.parse (loan.Scheme_Json)[0],
                        loan.Customer   =   JSON.parse (loan.Party_Json)[0], 
                        loan.fileSource =   loan.Images_Json ? JSON.parse (loan.Images_Json) : '';
              });
            }                            
          })
        });
  }


  
  AsOnDate: number = 0;
  LoansList!:       TypeLoan[];
  SelectedLoan!:    TypeLoan;
  
  InterestDetails!: TypeInterestDetails; 
  InterestStructure: TypeInterestStructure[] = [];
  Statement: TypeLoanStatement[] = [];
  IsEmiScheme: boolean = false;

  BarCode: number = 0;

  ngOnInit(){
    this.AsOnDate = this.globals.DateToInt( new Date());
      
    // ln.getLoans(0,0,0, this.globals.LoanStatusAll, this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).subscribe(data=> {
    //   if (data.queryStatus == 0){
    //     this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
    //     return;
    //   }
    //   else{
    //     this.LoansList = JSON.parse (data.apiData);
    //     this.LoansList.map(loan => {        
    //     return  loan.IGroup       =   JSON.parse (loan.IGroup_Json)[0],  
    //               loan.Location   =   JSON.parse (loan.Location_Json)[0],
    //               loan.Scheme     =   JSON.parse (loan.Scheme_Json)[0],
    //               loan.Customer   =   JSON.parse (loan.Party_Json)[0], 
    //               loan.fileSource =   loan.Images_Json ? JSON.parse (loan.Images_Json) : '';
    //     })     
    //   }
    // },
    // error => {
    //   this.globals.ShowAlert(this.globals.DialogTypeError,error);
    //   return;             
    // });
  }

  LoadDetails(){
    this.IsEmiScheme = this.SelectedLoan.Scheme.Calc_Method == 3 ? true: false;
    let rep = new ClsReports(this.dataService);    
    rep.getLoanDetailed(this.SelectedLoan.LoanSno, this.AsOnDate).subscribe(data => {
      
      this.InterestDetails    = JSON.parse (data.apiData)[0];        
      this.InterestStructure  = JSON.parse (this.InterestDetails.Struc_Json);  
      this.Statement          = JSON.parse (this.InterestDetails.Statement_Json);     
    })
  }

  SearchbyLoanNo($event: string){
    this.searchSubjectLoanNo.next($event);    
  }

  onSearchByBarCode(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(+input.value);    
  }

  getLoan($event: TypeLoan){      
    this.SelectedLoan = $event;   
    this.LoadDetails();  
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
}
