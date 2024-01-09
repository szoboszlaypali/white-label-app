import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, forkJoin, map, of, retry, shareReplay, switchMap, take, tap } from 'rxjs';
import { ApiDefinition } from '../models/api';
import jsonpath from 'jsonpath';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public currentPage: any;
  private urlParams$ = of(1).pipe(
    map(_ => {
      const url = this.router.url;
      const replaceWhat = this.availablePageNames.find(path => url.includes(path));
      const params = replaceWhat ? url.replace(`/${replaceWhat}`, '').replace(/^\//, '').split('/') : [];
      return params;
    })
  )

  public state: { [key: string]: { [key: string]: any } } = {
    api: {},
    data: {},
    route: {
      params: this.urlParams$
    }
  }
  public availablePaths: string[] = ["data", "route.params"];


  public rerender$ = new BehaviorSubject(0);
  private availablePageNames: string[] = [];

  constructor(private http: HttpClient, private router: Router) {
  }

  public registerDataPoints(apiDefinitions: ApiDefinition[], pageNames: string[], data: any): void {
    this.availablePageNames = pageNames;
    this.state["data"] = of(data ?? {});

    apiDefinitions.forEach(definition => {
      Object.keys(definition.endpoints).forEach(endpointName => {
        const endpointDefinition = definition.endpoints[endpointName];
        this.state["api"][definition.name] = this.state["api"][definition.name] ?? {};

        this.availablePaths = [...new Set([`api.${definition.name}.${endpointName}`, ...this.availablePaths])];
        this.state["api"][definition.name][endpointName] = this.createReplaceStream(
          of(`${definition.baseUrl}${endpointDefinition.url}`)
        ).pipe(
          switchMap(url => this.http.request<any>(endpointDefinition.method, url).pipe(
            // retry(3),
            // catchError(err => of(null)),
            // map(data => data?.body),
            tap(e => console.log('http called', e)),
            filter((data: any) => !!data),
          )
          ),
          shareReplay(1)
        )
      });
    });
  }

  public createReplaceStream(text: Observable<string>, stringify = false): Observable<any> {
    let textString: string;
    return text.pipe(
      take(1),
      tap(txt => textString = txt),
      switchMap(txt => {
        const matches = [...txt.matchAll(/{{(?<={{)(?:[^{}]+?)(?=}})}}/g)]
          .map(match => match[0]);

        if (!matches.length) {
          return of(txt);
        } else {
          // TODO error handling
          return forkJoin(
            matches.map(match => {
              const path = match.replaceAll('{', '').replaceAll('}', '');
              const stateObservablePath = this.availablePaths.find(p => path.includes(p)) ?? '';

              const stateObservable: Observable<any> = jsonpath.query(
                this.state,
                stateObservablePath ?? ''
              )?.[0] ?? of({});

              return stateObservable.pipe(
                map(resolvedData => {
                  const resolvedText = jsonpath.query(resolvedData, path
                    .replace(stateObservablePath, '')
                    .replace('$..', '$.')
                    .replace('.[', '['))
                  return {
                    what: match,
                    with: resolvedText
                  }
                })
              );
            })
          ).pipe(
            switchMap(replaceActions => {
              let newText = textString;
              replaceActions.forEach(action => newText = newText.replaceAll(
                action.what,
                stringify ? JSON.stringify(action.with) : action.with?.[0] ?? '')
              )
              return this.createReplaceStream(of(newText));
            })
          );
        }
      })
    )
  }
}
