import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './auth/auth.guard';


const routes: Routes = [
  { path: '', redirectTo: '/movies', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'movies', component: MovieListComponent },
  { path: 'movie/:id', component: MovieDetailsComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
