import { Component, Input } from '@angular/core';
import { TypeParties } from '../../Classes/ClsParties';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.scss']
})
@AutoUnsubscribe
export class CustomerdetailsComponent {
  @Input() Customer!: TypeParties;
}
 