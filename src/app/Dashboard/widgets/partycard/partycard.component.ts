import { Component, Input, SimpleChanges } from '@angular/core';
import { TypeParties } from '../../Classes/ClsParties';
import { ClsReports, TypeCustomerDetailed } from '../../Classes/ClsReports';
import { DataService } from 'src/app/Services/data.service';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-partycard',
  templateUrl: './partycard.component.html',
  styleUrls: ['./partycard.component.scss']
})

@AutoUnsubscribe 
export class PartycardComponent {

  constructor(private dataService: DataService) {}

  @Input() Party!:TypeCustomerDetailed; 
 
  //PartyData: TypeCustomerDetailed[] = [];
  LoanData!: any;

  ngOnInit(){        
    
  }

  // ngOnChanges(changes: SimpleChanges){
  //   if (this.Party){
  //     let rep = new ClsReports(this.dataService);
  //     rep.getCustomerDetailed(this.Party.PartySno).subscribe(data =>{        
  //       this.PartyData = JSON.parse (data.apiData);
                        
  //       this.LoanData = JSON.parse(this.PartyData[0].Loans_Json!);
                
  //     })
  //   }

  // }
}
