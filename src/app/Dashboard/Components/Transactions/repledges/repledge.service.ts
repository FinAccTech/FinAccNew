import { Injectable } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeRepledge } from 'src/app/Dashboard/Classes/ClsRepledges';

@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class RepledgeService {
  CurrentRepledge!: TypeRepledge;
  LoadedFromDate: number = 0;
  LoadedToDate: number = 0;

  constructor() { }

  setRepledge(Repledge: TypeRepledge){
    this.CurrentRepledge = Repledge;
  }

  getRepledge(){
    return this.CurrentRepledge;
  }
  
}
