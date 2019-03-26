import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgIsomapViewerComponent } from 'projects/ng-isomap-viewer/src/public_api';


const routes: Routes = [
 {path: 'module', component: NgIsomapViewerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
