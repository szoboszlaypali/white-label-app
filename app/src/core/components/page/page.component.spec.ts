import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageComponent } from './page.component';
import { ConfigService } from '../../services/config.service';
import { StateService } from '../../services/state.service';
import { BehaviorSubject, of } from 'rxjs';

jasmine.getEnv().allowRespy(true);

describe('PageComponent', () => {
  let component: PageComponent;
  let fixture: ComponentFixture<PageComponent>;
  let configService: ConfigService;
  let stateService: StateService;

  beforeEach(async () => {
    configService = jasmine.createSpyObj<ConfigService>('configService', [], {
      'config': config
    });
    
    stateService = jasmine.createSpyObj<StateService>('stateService', ['registerDataPoints'], {
      currentPage: null, 
      rerender$: new BehaviorSubject(0)
    });
    
    await TestBed.configureTestingModule({
      imports: [PageComponent]
    })
    .compileComponents();

    TestBed.overrideComponent(PageComponent, {
      set: {
        providers: [
          {
            provide: ConfigService,
            useValue: configService
          },
          {
            provide: StateService,
            useValue: stateService
          }
        ]
      }
    })
    
    fixture = TestBed.createComponent(PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Given an application page and template config, the expected template should be generated', () => {
    it('state1', () => {
      const dataIndex = 0;
      spyOnProperty(stateService, 'currentPage').and.returnValue(currentPages[dataIndex]);

      component.template$.subscribe({
        next: data => {
          expect([data.header, data.content, data.footer].join('').replaceAll('\n', '').replaceAll(/\s\s+/g, ' ')).toEqual(expectedTemplates[dataIndex])
        }
      })

      stateService.rerender$.next(1);
    });

    it('state2', () => {
      const dataIndex = 1;
      spyOnProperty(stateService, 'currentPage').and.returnValue(currentPages[dataIndex]);

      component.template$.subscribe({
        next: data => {
          expect([data.header, data.content, data.footer].join('').replaceAll('\n', '').replaceAll(/\s\s+/g, ' ')).toEqual(expectedTemplates[dataIndex])
        }
      })

      stateService.rerender$.next(1);
    });
  });
});

const currentPages = [
  { "name": "homepage", "template": { "sections": { "header": [ "navBar" ], "content": [ "dashboard" ], "footer": null } } },
  { "name": "cocktails", "template": { "sections": { "header": [ "navBar" ], "content": [ "cocktail" ], "footer": null } } }
];

const expectedTemplates = [
  `<div class="navbar"><a href="{{resolveObservable('/', false) | async}}">{{resolveObservable('{{$.data.brandName}}', false) | async}}</a></div><div class="dashboard"> @if (resolveObservable('{{$.api.thecocktaildb.cocktails.drinks[:2]}}', true) | async; as items) { @for (item of parseJson(items); track item; let index = $index) { <div><a href="{{resolveObservable('cocktails/{{$.api.thecocktaildb.cocktails.drinks[' + index + '].idDrink}}', false) | async}}"><img src="{{resolveObservable('{{$.api.thecocktaildb.cocktails.drinks[' + index + '].strDrinkThumb}}/preview', false) | async}}"></a><span>{{resolveObservable('{{$.api.thecocktaildb.cocktails.drinks[' + index + '].strDrink}}', false) | async}}</span></div> } }</div>`,
  `<div class="navbar"><a href="{{resolveObservable('/', false) | async}}">{{resolveObservable('{{$.data.brandName}}', false) | async}}</a></div><div class="cocktaildetails"><div><h3>{{resolveObservable('{{$.api.thecocktaildb.cocktaildetails.drinks[0].strDrink}}', false) | async}}</h3><img src="{{resolveObservable('{{$.api.thecocktaildb.cocktaildetails.drinks[0].strDrinkThumb}}', false) | async}}"></div><div class="ingredients"><h4>{{resolveObservable('{{$.data.ingredientsLabel{{$.data.localization}}}}', false) | async}}</h4><div> @if (resolveObservable('{{$.data.ingredients[*]}}', true) | async; as items) { @for (item of parseJson(items); track item; let index = $index) { <div><span>{{resolveObservable('{{$.api.thecocktaildb.cocktaildetails.drinks[0].strMeasure' + item + '}}{{$.api.thecocktaildb.cocktaildetails.drinks[0].strIngredient' + item + '}}', false) | async}}</span></div> } }</div></div></div><div class="instructions"><h4>{{resolveObservable('{{$.data.instructionsLabel{{$.data.localization}}}}', false) | async}}</h4><p>{{resolveObservable('{{$.api.thecocktaildb.cocktaildetails.drinks[0].strInstructions{{$.data.localization}}}}', false) | async}}</p></div>`
];

const config = {
    "templates": { 
      "navBar": {
          "items": [
              {
                  "type": "div",
                  "classNames": ["navbar"],
                  "items": [
                      {
                          "type": "a",
                          "href": "/",
                          "text": "{{$.data.brandName}}"
                      }
                  ]
              }
          ]
      },
      "dashboard": {
          "items": [
              {
                  "type": "grid",
                  "for": "{{$.api.thecocktaildb.cocktails.drinks[:2]}}",
                  "classNames": ["dashboard"],
                  "items": [
                      {
                          "type": "a",
                          "href": "cocktails/{{$.api.thecocktaildb.cocktails.drinks[$index].idDrink}}",
                          "items": [
                              {
                                  "type": "img",
                                  "src": "{{$.api.thecocktaildb.cocktails.drinks[$index].strDrinkThumb}}/preview"
                              }
                          ]
                      },
                      {
                          "type": "span",
                          "text": "{{$.api.thecocktaildb.cocktails.drinks[$index].strDrink}}"
                      }
                  ]
              }
          ]
      },
      "cocktail": {
          "items": [
              {
                  "type": "div",
                  "classNames": ["cocktaildetails"],
                  "items": [
                      {
                          "type": "div",
                          "items": [
                              {
                                  "type": "h3",
                                  "text": "{{$.api.thecocktaildb.cocktaildetails.drinks[0].strDrink}}"
                              },
                              {
                                  "type": "img",
                                  "src": "{{$.api.thecocktaildb.cocktaildetails.drinks[0].strDrinkThumb}}"
                              }
                          ]
                      },
                      {
                          "type": "div",
                          "classNames": ["ingredients"],
                          "items": [
                              {
                                  "type": "h4",
                                  "text": "{{$.data.ingredientsLabel{{$.data.localization}}}}"
                              },
                              {
                                  "type": "grid",
                                  "for": "{{$.data.ingredients[*]}}",
                                  "items": [
                                      {
                                          "type": "span",
                                          "text": "{{$.api.thecocktaildb.cocktaildetails.drinks[0].strMeasure$forValue}}{{$.api.thecocktaildb.cocktaildetails.drinks[0].strIngredient$forValue}}"
                                      }
                                  ]
                              }
                          ]
                      }
                  ]
              },
              {
                  "type": "div",
                  "classNames": ["instructions"],
                  "items": [
                      {
                          "type": "h4",
                          "text": "{{$.data.instructionsLabel{{$.data.localization}}}}"
                      },
                      {
                          "type": "p",
                          "text": "{{$.api.thecocktaildb.cocktaildetails.drinks[0].strInstructions{{$.data.localization}}}}"
                      }
                  ]
              }
          ]
      }
  }
};