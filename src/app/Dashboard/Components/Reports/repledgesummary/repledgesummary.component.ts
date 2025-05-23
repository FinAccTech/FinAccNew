import { Component } from '@angular/core';
import { Location,} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClsRepledges, TypeRepledge } from 'src/app/Dashboard/Classes/ClsRepledges';
import { ClsReports, TypeInterestDetails, TypeInterestStructure, TypeLoanStatement } from 'src/app/Dashboard/Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-repledgesummary',  
  templateUrl: './repledgesummary.component.html',
  styleUrl: './repledgesummary.component.scss'
})
export class RepledgesummaryComponent {

  constructor(private globals: GlobalsService, private dataService: DataService, private route: ActivatedRoute, private location: Location,){
  
  }

  AsOnDate: number = 0;
  RepledgesList!:       TypeRepledge[];
  SelectedRepledge!:    TypeRepledge; 
  
  InterestDetails!: TypeInterestDetails; 
  InterestStructure: TypeInterestStructure[] = [];
  Statement: TypeLoanStatement[] = [];

  BarCode: number = 0;
  RoutedRepledgeSno: number = 0;

  ngOnInit(){ 
    this.route.paramMap.subscribe(params => {
      const repledegesno = params.get('repledgesno'); 
      this.RoutedRepledgeSno = +repledegesno!;      
    });

    this.AsOnDate = this.globals.DateToInt( new Date());
    let ln = new ClsRepledges(this.dataService);
    
    ln.getRepledges(0,0,0, this.globals.RepledgeStatusAll, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).subscribe(data=> {
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{
        this.RepledgesList = JSON.parse (data.apiData);
        console.log(this.RepledgesList);
        
        if (this.RoutedRepledgeSno !== 0){
          this.SelectedRepledge = this.RepledgesList.find(rp=>{ return rp.RepledgeSno == this.RoutedRepledgeSno})!;
          console.log(this.SelectedRepledge);
          
          this.LoadDetails();
        }
        
        this.RepledgesList.map(Repledge => {        
        return    Repledge.Supplier   =   JSON.parse (Repledge.Party_Json)[0], 
                  Repledge.fileSource =   Repledge.Images_Json ? JSON.parse (Repledge.Images_Json) : '';
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
    rep.getRepledgeDetailed(this.SelectedRepledge.RepledgeSno, this.AsOnDate).subscribe(data => {
      
      this.InterestDetails    = JSON.parse (data.apiData)[0];      
              
      this.InterestStructure  = JSON.parse (this.InterestDetails.Struc_Json);    
      this.Statement          = JSON.parse (this.InterestDetails.Statement_Json);     
    })
  }

  
  getRepledge($event: TypeRepledge){      
    this.SelectedRepledge = $event;   
    this.LoadDetails();  
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  GoBack(){
    this.location.back();
  }
}
