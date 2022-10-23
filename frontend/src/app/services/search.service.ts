import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
//subscribing to search in the navbar so products service can access the string
export class SearchService {
  searchText: BehaviorSubject<string>;
  searchText$!: Observable<string>;
  isCollapsed = false;

  constructor(){
    this.searchText = new BehaviorSubject('');
    this.searchText$ = this.searchText.asObservable();
  }

  setSearchText(latestValue: string): void{
    this.searchText.next(latestValue);
  }

  getSearchText(): Observable<string> {
    return this.searchText$;
  }
}
