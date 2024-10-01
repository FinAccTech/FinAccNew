import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/Services/data.service';
import { ClsParties } from '../../Classes/ClsParties';
import { PartiesComponent } from '../../Components/Masters/parties/parties.component';
import { ClsItems } from '../../Classes/ClsItems';
import { ItemComponent } from '../../Components/Masters/items/item/item.component';
import { PartyComponent } from '../../Components/Masters/parties/party/party.component';
import { ClsPurities } from '../../Classes/ClsPurities';
import { PurityComponent } from '../../Components/Masters/purities/purity/purity.component';
import { ClsSchemes } from '../../Classes/ClsSchemes';
import { SchemeComponent } from '../../Components/Masters/schemes/scheme/scheme.component';
import { ClsLocations } from '../../Classes/ClsLocations';
import { LocationComponent } from '../../Components/Masters/locations/location/location.component';
import { ClsItemGroups } from '../../Classes/ClsItemGroups';
import { ItemgroupComponent } from '../../Components/Masters/itemgroups/itemgroup/itemgroup.component';
import { ClsAreas } from '../../Classes/ClsAreas';
import { AreaComponent } from '../../Components/Masters/areas/area/area.component';
import { ClsVoucherSeries } from '../../Classes/ClsVoucherSeries';
import { VoucherseriesComponent } from '../../Components/Settings/voucherserieslist/voucherseries/voucherseries.component';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-selectionlist',
  templateUrl: './selectionlist.component.html',
  styleUrls: ['./selectionlist.component.scss']
})

@AutoUnsubscribe 
export class SelectionlistComponent implements OnInit {
focus() {
//throw new Error('Method not implemented.');
} 
constructor(private dialog: MatDialog, private dataService: DataService){}
  
  showList: boolean     = false;
  SelectionList: any [] = [];
  FilteredData: any []  = [];  
  activeIndex: number   = 0; 
  
  focused: boolean = false;
  @ViewChild('InputBox') InputBox!: ElementRef;
    
  @Input() Caption!: string; // decorate the property with @Input()
  @Input() DataSource: any[] = []; // decorate the property with @Input()
  @Input() SelectedItem!: any; 
  @Output() newItemEvent = new EventEmitter<any>();
  @Output() newMasterEmit = new EventEmitter<any>();   
  @Input() MasterComponentId!: number;
  

  ngAfterViewInit(){
    
  }
  ngOnInit(): void { 
    
  }

  ngOnChanges(changes: SimpleChanges) {    
    this.SelectionList = this.DataSource;
    this.FilteredData = this.DataSource;         
}

OpenMaster()
{
  switch (this.MasterComponentId) {
    case 1:
      let pty = new ClsParties(this.dataService);                
      const dialogRef = this.dialog.open(PartyComponent, 
        {
          width:"45vw",
          height:"100vh",
          position:{"right":"0","top":"0" },
          data: pty.Initialize(),
        });      
        //dialogRef.disableClose = true; 
        dialogRef.afterClosed().subscribe(result => {                  
          if (result) 
          {             
              this.newMasterEmit.emit(result);            
          }        
        });
      break;    
    case 2:
        let it = new ClsItems(this.dataService);                
        const dialogRef1 = this.dialog.open(ItemComponent, 
          {            
            data: it.Initialize(),
          });      
          //dialogRef.disableClose = true; 
          dialogRef1.afterClosed().subscribe(result => {                    
            if (result) 
            {             
                this.newMasterEmit.emit(result);            
            }        
          });
        break;      
         
    case 3:
    let um = new ClsPurities(this.dataService);                
    const dialogRef3 = this.dialog.open(PurityComponent, 
      {            
        data: um.Initialize(),
      });      
      //dialogRef.disableClose = true; 
      dialogRef3.afterClosed().subscribe(result => {                     
        if (result) 
        {    
            this.newMasterEmit.emit(result);            
        }        
      });
    break; 
 
    case 4:
    let bnk = new ClsSchemes(this.dataService);                
    const dialogRef4 = this.dialog.open(SchemeComponent, 
      {            
        data: bnk.Initialize(),
      });      
      
      //dialogRef.disableClose = true; 
      dialogRef4.afterClosed().subscribe(result => {                    
        if (result) 
        {             
            this.newMasterEmit.emit(result);            
        }        
      });
    break; 

    case 5:
    let loc = new ClsLocations(this.dataService);                
    const dialogRef5 = this.dialog.open(LocationComponent, 
      {            
        data: loc.Initialize(),
      });      
      //dialogRef.disableClose = true; 
      dialogRef5.afterClosed().subscribe(result => {                    
        if (result) 
        {             
            this.newMasterEmit.emit(result);            
        }        
      });
    break; 
    
    case 6:
    let grp = new ClsItemGroups(this.dataService);                
    const dialogRef6 = this.dialog.open(ItemgroupComponent, 
      {            
        data: grp.Initialize(),
      });      
      //dialogRef.disableClose = true; 
      dialogRef6.afterClosed().subscribe(result => {                    
        if (result) 
        {             
            this.newMasterEmit.emit(result);            
        }        
      });
    break; 

    case 7:
      let ar = new ClsAreas(this.dataService);                
      const dialogRef7 = this.dialog.open(AreaComponent, 
        {            
          data: ar.Initialize(),
        });      
        //dialogRef.disableClose = true; 
        dialogRef7.afterClosed().subscribe(result => {                    
          if (result) 
          {             
              this.newMasterEmit.emit(result);            
          }        
        });
      break; 

    case 8:
      let ser = new ClsVoucherSeries(this.dataService);                
      const dialogRef8 = this.dialog.open(VoucherseriesComponent, 
        {            
          data: ser.Initialize(),
        });      
        //dialogRef.disableClose = true; 
        dialogRef8.afterClosed().subscribe(result => {                    
          if (result) 
          {             
              this.newMasterEmit.emit(result);            
          }        
        });
      break; 

  }
    
}

  DisplayList()
  {    
    this.showList = true;         
  }

  HideList()
  {   
    setTimeout(() => {
      this.showList = false;  
      this.activeIndex = 0;
    }, 200);    
  
  }

  FilterList($event: any)
  {    
    if ($event.key == "Escape") {
      this.HideList();
      return;
    }
    
    if ($event.key == "Enter")
    {
      this.SelectItem(this.activeIndex);
      this.HideList();
      return;
    }

    if ($event.key == "ArrowDown")
    { 
      this.DisplayList();
       if (this.activeIndex !=0) {document.getElementsByClassName('listItems')[this.activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });}
      if (this.activeIndex < this.FilteredData.length-1) {this.activeIndex++;} 
    }
    else if ($event.key == "ArrowUp")
    {      
      this.DisplayList();      
      if (this.activeIndex !=0) {this.activeIndex--;}
      document.getElementsByClassName('listItems')[this.activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      
    }
    else
    {
      this.DisplayList();
        let filterValue = ($event.target.value).toLowerCase();
        if (filterValue.trim() == "")
        {
          this.FilteredData = this.SelectionList;  
        }
        else
        {
          this.FilteredData = this.SelectionList.filter((cat) => cat.Name.toLowerCase().includes(filterValue) || cat.Details.toLowerCase().includes(filterValue) );
          this.activeIndex = 0;
        }
    }
  } 

  SelectItem(ind: number){    
    this.SelectedItem = this.FilteredData[ind];    
    this.newItemEvent.emit(this.SelectedItem);
  }

  ClearItem(){            
    //this.SelectedItem = {} as any;        
    this.SelectedItem = undefined;
    this.activeIndex = 0;    
    this.FilteredData = this.SelectionList;  
    this.newItemEvent.emit(this.SelectedItem);
    this.HideList(); 
  }
  
  clickedOutside(){
    let boxvalue = (this.InputBox.nativeElement.value.trim()).toLowerCase();
    if (boxvalue == '')
    {
      this.ClearItem();
      this.showList = false;  
      this.activeIndex = 0;   
      return;
    }

    if (boxvalue !== '')
    {
      
      this.FilteredData = this.SelectionList.filter((cat) => cat.Name.toLowerCase() === boxvalue );      
      if ( this.FilteredData.length == 0 )
      {
        this.ClearItem();
        this.InputBox.nativeElement.value = "";
      }
    }
  }
}
