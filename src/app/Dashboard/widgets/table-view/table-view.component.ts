import { Component, Input } from '@angular/core';
import { TypeInterestStructure } from '../../Classes/ClsReports';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss']
})

@AutoUnsubscribe
export class TableViewComponent {
  @Input() InterestStructure!: TypeInterestStructure[];
  
}
 