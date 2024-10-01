import { Injectable } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeAuctionEntry } from 'src/app/Dashboard/Classes/ClsAuctionEntries';


@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class AuctionService {
  CurrentAuction!: TypeAuctionEntry;
  
  constructor() { }

  setAuction(Auction: TypeAuctionEntry){
    this.CurrentAuction = Auction;
  }

  getAuction(){
    return this.CurrentAuction;
  }
  
}
