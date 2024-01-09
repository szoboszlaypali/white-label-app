import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ConfigService } from '../core/services/config.service';
import { StateService } from '../core/services/state.service';
import { BehaviorSubject, of } from 'rxjs';

describe('AppComponent', () => {
  let configService;
  let stateService;

  beforeEach(async () => {
    configService = jasmine.createSpyObj<ConfigService>([], {
      'config$': of({})
    });
    stateService = jasmine.createSpyObj<StateService>(['registerDataPoints'], {
      currentPage: null, 
      rerender$: new BehaviorSubject(0)
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    TestBed.overrideComponent(AppComponent, {
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
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
