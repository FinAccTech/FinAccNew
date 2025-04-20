import { Component, Input } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-intstatement-view',
  templateUrl: './intstatement-view.component.html',
  styleUrls: ['./intstatement-view.component.scss']
})

@AutoUnsubscribe 
export class IntstatementViewComponent {
  @Input() InterestStructure!: any[];
  @Input() EmiTable: boolean = false;
  
}
 