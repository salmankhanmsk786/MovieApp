import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component'; 
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app.routes';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { AboutComponent } from './about/about.component';


@NgModule({
  declarations: [
    AppComponent,
    MovieListComponent,
    MovieDetailsComponent,
    
    

  ],
  imports: [
    BrowserModule,
    CommonModule,
    NavbarComponent, // <-- Add NavbarComponent to imports
    FormsModule, // <-- Add FormsModule to imports
    AppRoutingModule,
    RouterModule,
    

  ],
  providers: [
    provideHttpClient() // Updated way to provide HTTP client
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
