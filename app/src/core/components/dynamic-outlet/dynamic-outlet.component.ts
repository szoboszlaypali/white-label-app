import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    ViewChild,
    ViewContainerRef
  } from '@angular/core';
import { StateService } from '../../services/state.service';
import { of } from 'rxjs';
  
  @Component({
    selector: 'app-dynamic-outlet',
    template: '<ng-container #container></ng-container>',
    standalone: true
  })
  export class DynamicComponent implements AfterViewInit {
    @ViewChild('container', {read: ViewContainerRef, static: false}) container!: ViewContainerRef;
    @Input() template: string = '';
  
    constructor(private _stateService: StateService, private cdr: ChangeDetectorRef) {
    }
  
    ngAfterViewInit() {
      const component = Component({
        template: this.template,
        styles: [':host {}'],
        imports: [CommonModule],
        providers: [StateService],
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush
      })(class {
        stateService!: StateService;

        public resolveObservable(toResolve: string, stringify?: boolean) {
          return this.stateService.createReplaceStream(of(toResolve), stringify ?? false)
        }

        public parseJson(str: string): any {
          return JSON.parse(str);
        }
      });

      const componentRef = this.container.createComponent(component);
      componentRef.instance.stateService = this._stateService;
      this.cdr.detectChanges();
    }
  }