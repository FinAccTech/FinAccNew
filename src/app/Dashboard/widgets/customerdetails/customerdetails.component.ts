import { Component, Input } from '@angular/core';
import { TypeParties } from '../../Classes/ClsParties';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.scss']
})
@AutoUnsubscribe
export class CustomerdetailsComponent {

  constructor(private router: Router) {}
  @Input() Customer!: TypeParties; 

 
  
  OpenHistory(){
    this.router.navigate(['dashboard/customerhistory/'+this.Customer.PartySno]);
  }

  
}
 