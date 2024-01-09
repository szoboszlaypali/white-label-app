import { Routes } from '@angular/router';
import { PageComponent } from '../core/components/page/page.component';
import { NotFoundComponent } from '../core/components/not-found/not-found.component';

export const routes: Routes = [
    { path: 'notfound', component: NotFoundComponent },
    { path: '**', component: PageComponent, },
];
