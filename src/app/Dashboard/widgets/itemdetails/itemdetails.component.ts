import { ChangeDetectionStrategy, Component, EventEmitter, Input, IterableDiffer, IterableDiffers, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImagesComponent } from '../images/images.component';
import { TypeItemGroup } from '../../Classes/ClsItemGroups';
import { TypeGridItem } from '../../Types/TypeGridItem';
import { FileHandle } from '../../Types/file-handle';
import { TypeLoanGridTotals } from '../../Types/TypeLoanGridTotals';
import { ClsItems, TypeItem } from '../../Classes/ClsItems';
import { ClsPurities, TypePurity } from '../../Classes/ClsPurities';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { TypeScheme } from '../../Classes/ClsSchemes';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-itemdetails',
  templateUrl: './itemdetails.component.html',
  styleUrls: ['./itemdetails.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush ,
  changeDetection: ChangeDetectionStrategy.OnPush
}) 

@AutoUnsubscribe
export class ItemdetailsComponent implements OnInit  {
  
  @Input() Group!: TypeItemGroup;
  @Input() Scheme!: TypeScheme;
  
  @Input() GridDataSource: TypeGridItem[] = []; // Input GridList as Input Param
  @Output() newGridEvent = new EventEmitter<any>(); // Output New GridList as Output Param

  @Input() TransImages: FileHandle[] = []; // Input Item Images as Input Param
  @Output() newTransImages = new EventEmitter<any>(); // Output New Imgages as Output Param

  @Input() GridTotals!: TypeLoanGridTotals;
  @Output() newGridTotal = new EventEmitter<any>(); // Output New Imgages as Output Param

  SchemeMaxper!: number;
  LoanPerGram!: number;
  MarketValueReadonly: boolean = false;
  GridList: TypeGridItem[] = [];  
  ItemsList!: TypeItem[];
  SelectedItem: TypeItem[] = [];
  PurityList!: TypePurity[];
  SelectedPurity: TypePurity[] = [];

  //Validate Inputs
  ItemNameValid: boolean = true;
  QtyValid: boolean = true;
  GrossWtValid: boolean = true;
  NettWtValid: boolean = true;
  PurityValid: boolean = true;
  ValueValid: boolean = true;

  iterableDiffer: IterableDiffer<TypeGridItem> | null;

  errorItem: boolean[] = [];
  errorQty: boolean[] = [];
  errorGrossWt: boolean[] = [];
  errorNettWt: boolean[] = [];
  errorPurity: boolean[] = [];
  errorValue: boolean[] = [];

  constructor(private dataService: DataService, private globals: GlobalsService, private dialog: MatDialog, private iterableDiffers: IterableDiffers){
    this.iterableDiffer = iterableDiffers.find([]).create();
  }

  ngDoCheck() {
    // let changes = this.iterableDiffer!.diff(this.GridList);
    // if (changes) {      
      this.PushGridDetailstoParent();
    // }
}

  ngOnInit(): void {     
    
  }

  LoadItems(GrpSno: number){
    let it = new ClsItems(this.dataService);
      it.getItems(0,GrpSno).subscribe(data=> {        
        if (data.queryStatus == 0){
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{
          this.ItemsList = JSON.parse (data.apiData);   
          
          
          if (!this.ItemsList){
            this.ItemsList = [];
          }        
        }
      },
      error => {
        this.globals.ShowAlert(this.globals.DialogTypeError,error);
        return;             
      });
  }

  ngOnChanges(changes: SimpleChanges) {      

    if (this.Group){      
      this.LoanPerGram = this.Group.Loan_PerGram!;
      this.MarketValueReadonly = this.Group.Restrict_Type==1 ? true : false;
      
      this.LoadItems(this.Group.GrpSno);

      let pur = new ClsPurities(this.dataService);
          pur.getPurities(0,this.Group.GrpSno).subscribe(data=> {
            if (data.queryStatus == 0){
              this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
              return;
            }
            else{
              this.PurityList = JSON.parse (data.apiData);     
              if (!this.PurityList)              {
                this.PurityList = [];
              }
            }
          },
          error => {
            this.globals.ShowAlert(this.globals.DialogTypeError,error);
            return;             
          });        
    }

    this.GridList = this.GridDataSource;        
    if (this.GridList)
    {    
      // console.log(this.GridList);
      
      for (let i=0; i<this.GridList.length;i++)
      {
        this.getItem(this.GridList[i].Item,i);
        this.getPurity(this.GridList[i].Purity,i);
        this.GridList[i].Item_Value = +this.GridList[i].Item_Value.toFixed(2) ;
        // this.SelectedItem[i]=this.GridList[i].Item;
        // this.SelectedPurity[i]=this.GridList[i].Purity;
      }

      if (this.GridList.length == 0){
        this.AddItem();
      } 
    }

    
    if  (this.Scheme){
      this.SchemeMaxper = this.Scheme.Max_MarketValue!;
    }
    
  
  }

  PushGridDetailstoParent(){        
    this.SetTotals();
    this.newGridEvent.emit(this.GridList);
    this.newGridTotal.emit(this.GridTotals);
  }
   
  AddItem()
  {    
    for (let i=0; i<this.GridList.length;i++)
    {      
      if ( Object.keys(this.GridList[i].Item).length == 0 || !this.GridList[i].Item || this.GridList[i].Item.ItemSno == 0  ){                
        this.globals.SnackBar("error","Invalid Item Details...")
        this.errorItem[i]= true;
        return;        
      }
      else{
        this.errorItem[i]= false;
      }

      if ( Object.keys(this.GridList[i].Purity).length == 0 || !this.GridList[i].Purity || this.GridList[i].Purity.PuritySno == 0){        
        this.globals.SnackBar("error","Invalid Purity Details...")
        this.errorPurity[i]= true;
        return;        
      } 
      else{
        this.errorPurity[i]= false;
      }

      if (this.GridList[i].Qty == 0){        
        this.globals.SnackBar("error","Invalid Qty...")
        this.errorQty[i]= true;
        return;        
      }
      else{
        this.errorQty[i]= false;
      }

      if (this.GridList[i].Gross_Wt == 0){        
        this.globals.SnackBar("error","Invalid Gross Wt...")
        this.errorGrossWt[i]= true;
        return;        
      }
      else{
        this.errorGrossWt[i]= false;
      }

      if (this.GridList[i].Nett_Wt == 0){        
        this.globals.SnackBar("error","Invalid Nett Wt...")
        this.errorNettWt[i]= true;
        return;        
      }
      else{
        this.errorNettWt[i]= false;
      }

      if (this.GridList[i].Item_Value == 0){        
        this.globals.SnackBar("error","Invalid Value...")
        this.errorValue[i]= true;
        return;        
      }
      else{
        this.errorValue[i]= false;
      }

    }
 
    let item = { "Item": {"ItemSno":0, "Item_Code": '', "Item_Name": '', "Name" : '' } , "Qty":0, "Stone_Wt": 0, "Gross_Wt": 0, "Nett_Wt": 0, "Purity": { "PuritySno":0, "Purity_Code":"", "Purity_Name":"" }, "Item_Value": 0, "Remarks": "" } ;
    this.GridList.push(item);
    this.errorItem.push(false);
    this.SelectedItem.push(item.Item);
  }

  RemoveItem(index: number){
      this.GridList.splice(index,1);
      this.errorItem.splice(index,1);
      if (this.GridList.length == 0){
        this.AddItem();
      }
  }

  getItems() {     
    //console.log (this.GridList);
  }

  
  OpenImagesCreation(){
    var img = this.TransImages; 
        
    const dialogRef = this.dialog.open(ImagesComponent, 
      {         
        width:'50vw',
        data: {img},
      });
      
      dialogRef.disableClose = true;
  
      dialogRef.afterClosed().subscribe(result => {        
        if (result){
          this.TransImages = result;        
        }
        
      }); 
  }

  SetNettWt($event: any,index: number){
    this.GridList[index].Nett_Wt = $event.target.value;    
    this.CalcMarketValue();
  }

  CalcMarketValue(){        
    if (this.SchemeMaxper){
      for (var i=0; i< this.GridList.length; i++){
        let purewt = (this.GridList[i].Nett_Wt * this.GridList[i].Purity.Purity! / 100);
        let maxwt = purewt * (this.SchemeMaxper / 100);        
        this.GridList[i].Item_Value = +(maxwt * this.LoanPerGram).toFixed(2);
      }    
    }    
  }

  SetTotals() {
    if (this.GridTotals){
      this.GridTotals.TotQty = 0;
      this.GridTotals.TotGrossWt = 0;
      this.GridTotals.TotNettWt = 0;
      this.GridTotals.TotPureWt = 0
      this.GridTotals.TotValue = 0;
    }

    if (this.GridList)
    {
      for (let i=0; i<this.GridList.length; i++){
        this.GridTotals.TotQty +=  (+this.GridList[i].Qty);
        this.GridTotals.TotGrossWt +=  (+this.GridList[i].Gross_Wt);
        this.GridTotals.TotNettWt += (+this.GridList[i].Nett_Wt);
        this.GridTotals.TotPureWt += this.GridTotals.TotNettWt * (this.GridList[i].Purity.Purity! / 100);
        this.GridTotals.TotValue += (+this.GridList[i].Item_Value);
      }
    }

    this.newGridTotal.emit(this.GridTotals);
  }

  ValidateNettWt($event: any, i: number){
    if ($event.target.value > this.GridList[i].Gross_Wt){
      $event.target.value = this.GridList[i].Gross_Wt;
      this.GridList[i].Nett_Wt = this.GridList[i].Gross_Wt;
      this.globals.SnackBar("error","Nett Wt cannot be greate than Gross Wt...")
    }
    else{
      this.CalcMarketValue();
    }
    
  }

  getItem($event: TypeItem, index: number){   
    
            
    this.SelectedItem[index] = $event;    
    this.GridList[index].Item = $event;    
  }

  getPurity($event: TypePurity, index: number){     
    this.SelectedPurity[index]     = $event;
    this.GridList[index].Purity = $event;    
    this.CalcMarketValue();
  } 

  getNewItem($event: TypeItem,i: number){                
      if ($event){
        this.ItemsList.push($event);
        this.getItem($event, i);
      }              
  }

  getNewPurity($event: TypePurity,i: number){                
    if ($event){
      this.PurityList.push($event);
      this.getPurity($event, i);
    }              
}
}
