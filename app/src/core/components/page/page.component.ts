import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StateService } from '../../services/state.service';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../services/config.service';
import { filter, map } from 'rxjs';
import { DynamicComponent } from '../dynamic-outlet/dynamic-outlet.component';


@Component({
  selector: 'app-page',
  standalone: true,
  imports: [CommonModule, DynamicComponent],
  template: `
  @if (template$ | async; as templates) {
    @if (templates.header; as template) {
      <app-dynamic-outlet [template]="template"></app-dynamic-outlet>
    }
    @if (templates.content; as template) {
      <app-dynamic-outlet [template]="template"></app-dynamic-outlet>
    }
    @if (templates.footer; as template) {
      <app-dynamic-outlet [template]="template"></app-dynamic-outlet>
    }
  }
  `,
  styles: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageComponent {
  public template$ = this.stateService.rerender$.pipe(
    filter(d => !!d),
    map(_ => {
      const header = this.generateTemplate("header");
      const content = this.generateTemplate("content");
      const footer = this.generateTemplate("footer");
      return {
        header: header,
        content: content,
        footer: footer
      }
    })
  )

  constructor(private stateService: StateService, private configService: ConfigService) {
  }

  private generateTemplate(section: "content" | "header" | "footer"): string {
    const page = this.stateService.currentPage;
    const contentTemplates = page.template.sections[section]
      ?.map((name: string) => this.configService.config?.templates?.[name])
      ?.filter((input: any) => !!input);

    if (!contentTemplates?.length) return "";

    const containers = contentTemplates.map((template: any) => {
      const container = document.createElement('div');

      this.addElements(container, template.items);

      return container;
    });

    return containers.map((c: any) => c.innerHTML).join('');
  }

  private toAsyncTemplate(text: string, withBraces = true, stringify = false): string {
    if (!text) return text;
    const wrapperStart = withBraces ? "{{" : "";
    const wrapperEnd = withBraces ? "}}" : "";
    return `${wrapperStart}resolveObservable('${text.replaceAll('<', '&#60;')}', ${stringify}) | async${wrapperEnd}`;
  }

  private addElements(container: HTMLDivElement, items: any[]) {
    items?.forEach((item: any) => {
      if (item.type === 'grid') {
          const gridContainer = document.createElement('div');

          item?.classNames?.forEach((name: string) => gridContainer.classList.add(name));

          const itemsWrapper = document.createElement('div');
          const items = JSON.parse(JSON.stringify(item.items).replaceAll("$index", `' + index + '`).replaceAll("$forValue", `' + item + '`));

          this.addElements(itemsWrapper, items);

          gridContainer.innerHTML = `
            @if (${this.toAsyncTemplate(item.for, false, true)}; as items) {
              @for (item of parseJson(items); track item; let index = $index) {
                <div>${itemsWrapper.innerHTML}</div>
              }
            }`;

          container.appendChild(gridContainer);
      } else {
        try {
          const element = document.createElement(item.type);

          item?.text ? element.innerHTML = this.toAsyncTemplate(item.text) : null;
          if (item.type === 'a') {
            element.href = this.toAsyncTemplate(item.href);
          }

          if (item.type === 'img') {
            element.src = this.toAsyncTemplate(item.src);
          }

          if (item?.items) {
            this.addElements(element, item.items);
          }

          item?.classNames?.forEach((name: string) => element.classList.add(name));
          
          container.appendChild(element);
        } catch(err) {
          console.log(err);
          container.appendChild(document.createElement('div'));
        }
      }
    });
  }

}
