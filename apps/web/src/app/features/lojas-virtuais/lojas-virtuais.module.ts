import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LojasVirtuaisComponent } from './lojas-virtuais.component';

const routes: Routes = [
  {
    path: '',
    component: LojasVirtuaisComponent,
  },
];

@NgModule({
  declarations: [LojasVirtuaisComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class LojasVirtuaisModule {}



