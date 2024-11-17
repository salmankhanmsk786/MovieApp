import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from './movie';  // You’ll create this Movie model later
import { Review } from './reviews';  // Review interface

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'https://localhost:7297/api/movies';  // Your API URL

  constructor(private http: HttpClient) { }

  // Fetch all movies from the API
  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.apiUrl);
  }

  // Add a new movie
  addMovie(movie: Movie): Observable<Movie> {
    return this.http.post<Movie>(this.apiUrl, movie);
  }
  // Delete a movie
  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  // Update a movie
  updateMovie(movie: Movie): Observable<Movie> {
    return this.http.put<Movie>(`${this.apiUrl}/${movie.id}`, movie);
  }
  // Fetch reviews for a movie
  getReviews(movieId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${movieId}/reviews`);
  }
  // Add a review for a movie
  addReview(review: Review): Observable<Review> {
    
    return this.http.post<Review>(`${this.apiUrl}/${review.movieId}/reviews`, review);
  }

  // Fetch a single movie by ID
  getMovie(movieId: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/${movieId}`);
  }
  
}
