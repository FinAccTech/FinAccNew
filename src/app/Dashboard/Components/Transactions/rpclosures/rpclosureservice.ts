import { Injectable } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeRpClosure } from 'src/app/Dashboard/Classes/ClsRpClosures';


@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class RpClosureService {
  CurrentRpClosure!: TypeRpClosure;
  
  constructor() { }

  setRpClosure(RpClosure: TypeRpClosure){
    this.CurrentRpClosure = RpClosure;
  }

  getRpClosure(){
    return this.CurrentRpClosure;
  }
  
}
