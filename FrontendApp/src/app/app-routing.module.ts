import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BirdListComponent } from './pages/birds/bird-list/bird-list.component';
import { BirdDetailsComponent } from './pages/birds/bird-details/bird-details.component';

const routes: Routes = [
  { path: '', redirectTo: '/birds', pathMatch: 'full' },
  { path: 'birds', component: BirdListComponent },
  { path: 'birds/:id', component: BirdDetailsComponent },
  { path: '**', redirectTo: '/birds' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 