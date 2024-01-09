import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private configUrl = 'assets/config.json';
  public config: any;
   
  constructor(private http: HttpClient) {
  }

  public config$ = this.http.get<any>(this.configUrl)
    .pipe(
      // catchError(this.handleError) // TODO handle error
      shareReplay(1),
      tap(config => this.config = config)
    );
}
