import { Directive, HostListener, HostBinding, Input, ElementRef, OnInit, OnChanges, SimpleChange, AfterViewInit } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';


@Directive({
  selector: '[NumberInput]',
  exportAs: 'numberInput'
})

@AutoUnsubscribe
export class NumberInputDirective {
  private _isFocus = false;

  // @Input('NumberInput') srcEvent: any;
  @Input('MaxValue') MaxValue!: any;
  @Input('Decimals') Decimals!: any;
  @Input('CurrConvert') CurrConvert!: any;
  @Input('LockedInput') LockedInput!: any;

  @HostBinding('class.is-focus')
  get isFocus() {
    return this._isFocus;
  }
  constructor(private eleRef: ElementRef) { }
 
  @HostListener('ngModelChange', ['$event']) onChange(event: any) {
    // "event" will be the value of the input
    
}

@HostListener('input')
onInput() {            
  if (this.LockedInput == "true"){
  this.eleRef.nativeElement.value ='';      
  }
}
 

  @HostListener('focus')
  onFocus() {            
    if (this.eleRef.nativeElement.value == 0)
    {
        this.eleRef.nativeElement.value = '';
    }    
  }

  @HostListener('keyup')
  onKeyUp() {            
    if (this.MaxValue == 0) return;    
    if (+this.eleRef.nativeElement.value > +this.MaxValue)
    {
        this.eleRef.nativeElement.value = '';
    }    
  }

  @HostListener('blur')  
  onBlur() {
    if (this.eleRef.nativeElement.value == '')
    {
        this.eleRef.nativeElement.value = 0;
    }
    else{        
        if (this.Decimals){
            let numValue = parseFloat (this.eleRef.nativeElement.value);        
            this.eleRef.nativeElement.value = numValue.toFixed(this.Decimals);
        }        
    }

    if (this.CurrConvert == "1"){
      const value = this.eleRef.nativeElement.value;
      this.eleRef.nativeElement.value = this.numberWithCommas(value);      
    }
  }
  

   numberWithCommas(x: number) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

  // @HostListener('keydown', ['$event'])
  // onKeyDown(e: any) {        
  //   if (e.key === "Enter")
  //   {
  //     const ele = e.srcElement.nextElementSibling;   
  //     if (ele == null) {
  //       return;
  //     } else {
  //       ele.focus();
  //     }
  //   }    
  // }

}