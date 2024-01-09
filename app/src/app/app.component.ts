import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ConfigService } from '../core/services/config.service';
import { Observable, filter, map, tap } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { StateService } from '../core/services/state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  providers: [ConfigService, StateService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  public config$: Observable<any>;

  constructor(private configService: ConfigService, private doms: DomSanitizer, 
    private router: Router, private stateService: StateService) {
      this.config$ = this.setConfig$();
  }

  private setConfig$() {
    let _config: any;
    let _isNotFoundPage: boolean;
    
    return this.configService.config$.pipe(
      map(config => {
        _config = config;
        const url = this.router.url;
        const routeName = url.replace(/^\//, '').split('/')?.[0] ?? '';
        return {
          config: config,
          routeName: routeName,
          page: null
        }
      }),
      map(result => {
        if (!result.routeName && result.config?.rootPage) {
          this.router.navigate([result.config.rootPage]);
          result.routeName = result.config.rootPage;
        }

        if (result.routeName === 'notfound') {
          _isNotFoundPage = true;
          return;
        }

        if (!result.routeName) {
          this.router.navigate(['notfound']);
          return;
        }

        const page = result.config?.pages?.find((page: any) => page.name === result.routeName);

        if (!page) {
          this.router.navigate(['notfound']);
        }

        result.page = page;

        return result;
      }),
      filter(res => !!res),
      tap(result => {
        if (_isNotFoundPage) return;

        this.stateService.registerDataPoints(
          result?.config?.apis ?? [], 
          result?.config?.pages?.filter((p: any) => !!p?.name)?.map((p: any) => p.name) ?? [],
          result?.config?.data
        );
        this.stateService.currentPage = result?.page;
        this.stateService.rerender$.next(this.stateService.rerender$.value+1);
      }),
      map(_ => _config)
    );
  }

  public trustUrl(url: string) {
    return this.doms.bypassSecurityTrustResourceUrl(url);
  }
}
