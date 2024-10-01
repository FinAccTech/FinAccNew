import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClsParties, TypeParties } from '../../Classes/ClsParties';
import { DataService } from 'src/app/Services/data.service';
import { PartyComponent } from '../../Components/Masters/parties/party/party.component';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';


@Component({
  selector: 'app-partyselection',
  templateUrl: './partyselection.component.html',  
  styleUrls: ['./partyselection.component.scss']
})

@AutoUnsubscribe
export class PartyselectionComponent implements OnInit {  
  
  showList: boolean = false;
  PartiesList: TypeParties [] = [];
  FilteredData: TypeParties [] = [];
  // SelectedParty!: TypeParties; 
  activeIndex: number = 0;
 
  focused: boolean = false;
  @ViewChild('InputBox') InputBox!: ElementRef;
  
  @Input() Party_Cat!: number; // decorate the property with @Input()
  @Input() parties: TypeParties[] = []; // decorate the property with @Input()
  @Input() SelectedParty!: TypeParties;
  @Output() newPartyEvent = new EventEmitter<TypeParties>(); 

  constructor(private dialog: MatDialog, private dataService: DataService){
   
  }

  ngOnChanges(changes: SimpleChanges){
    if (!this.parties) {
      this.PartiesList = [];
    }
    else{
      this.PartiesList = this.parties;
    }    
    this.FilteredData = this.parties;        
  }

  ngOnInit(): void {    
    
  } 
 
  OpenPartyMaster(){
    let pty = new ClsParties(this.dataService);
    let newpty = pty.Initialize();
    newpty.Party_Cat = this.Party_Cat;

    const dialogRef = this.dialog.open(PartyComponent, 
      {
        width:"45vw",
        height:"100vh",
        position:{"right":"0","top":"0" },
        data: newpty,
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {                
        
        if (result) 
        { 
          this.PartiesList.push(result);
          this.SelectedParty = result;    
          this.newPartyEvent.emit(this.SelectedParty);
        }        
      });   
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
      this.SelectParty(this.activeIndex);
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
          this.FilteredData = this.PartiesList;  
        }
        else
        {
          this.FilteredData = this.PartiesList.filter((cat) => cat.Party_Name!.toLowerCase().includes(filterValue) || cat.Party_Code?.toLowerCase().includes(filterValue) || cat.Mobile?.toLowerCase().includes(filterValue) );           
          this.activeIndex = 0;
        }
    }
  }

  SelectParty(ind: number){    
    this.SelectedParty = this.FilteredData[ind];    
    this.newPartyEvent.emit(this.SelectedParty);
  }

  ClearParty(){
    this.SelectedParty = {} as TypeParties;    
    this.activeIndex = 0;
    this.FilteredData = this.PartiesList;  
    this.newPartyEvent.emit();
    this.HideList();
  }

  clickedOutside(){
    let boxvalue = (this.InputBox.nativeElement.value.trim()).toLowerCase();
    if (boxvalue == '')
    {
      this.ClearParty();
      this.showList = false;  
      this.activeIndex = 0;   
      return;
    }

    if (boxvalue !== '')
    {      
      this.FilteredData = this.PartiesList.filter((cat) => cat.Party_Name!.toLowerCase() === boxvalue );      
      if ( this.FilteredData.length == 0 )
      {
        this.ClearParty();
        this.InputBox.nativeElement.value = "";
      }
    }
  }
}