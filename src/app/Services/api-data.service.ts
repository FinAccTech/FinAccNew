import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DataService } from './data.service';
import { ClsTransactions } from '../Dashboard/Classes/ClsTransactions';
import { GlobalsService } from './globals.service';
import { ClsParties } from '../Dashboard/Classes/ClsParties';

@Injectable({
  providedIn: 'root'
})
export class ApiDataService {

  private cache: Map<string, BehaviorSubject<any | null>> = new Map(); // Cache for multiple URLs

  constructor(private dataService: DataService, private globals: GlobalsService) {}

  // Fetch data for a specific URL and cache it
  fetchData(ObjectId: string): void {
    this.cache.clear();
    if (!this.cache.has(ObjectId)) {
      this.cache.set(ObjectId, new BehaviorSubject<any | null>(null));
    }

    switch (ObjectId) {
      case "1":        
          const subject = this.cache.get(ObjectId)!;
          if (!subject.value) {
            let trans = new ClsTransactions(this.dataService);
            trans.getLoans(0,0,0, this.globals.LoanStatusAll, this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).pipe(
              tap((data) => subject.next(data)) // Cache the response
            ).subscribe();      
          }
        break;
    
      case "2":
          const subject1 = this.cache.get(ObjectId)!;
          if (!subject1.value) {
            let pty = new ClsParties(this.dataService);
            pty.getParties(0,0,0,0,0) .pipe(
              tap((data) => subject.next(data)) // Cache the response
            ).subscribe();      
          }
      break;
    }
    
  }
  
  // Observable to get cached data
  getData(ObjectId: string): Observable<any> {    
    if (!this.cache.has(ObjectId)) {
      this.cache.set(ObjectId, new BehaviorSubject<any | null>(null));
    }
    if (!this.cache.get(ObjectId)){
      this.fetchData(ObjectId);
    }    
    return this.cache.get(ObjectId)!.asObservable();
  }

  // Force refresh for a specific URL
  refreshData(ObjectId: string): void {
    if (this.cache.has(ObjectId)) {
       let trans = new ClsTransactions(this.dataService);
      trans.getLoans(0,0,0, this.globals.LoanStatusAll, this.globals.ApprovalStatusApproved, this.globals.CancelStatusNotCancelled, this.globals.OpenStatusAllLoans).subscribe();
    }
  }

  // Get latest data synchronously
  getCachedData(ObjectId: string): any {    
    return this.cache.get(ObjectId)?.value;
  }
}
