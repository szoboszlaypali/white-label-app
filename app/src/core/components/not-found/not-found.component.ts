import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  template: 'Page not found',
  styles: "",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {

}
