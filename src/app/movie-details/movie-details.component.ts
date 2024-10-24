import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../movie.service';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss']
})
export class MovieDetailsComponent implements OnInit {
  movie: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inject the router here
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.fetchMovieDetails(parseInt(movieId, 10));
      console.log('Fetched movie:', this.movie);  // Debugging line
    }
  }

  fetchMovieDetails(id: number): void {
    this.movieService.getMovie(id).subscribe(
      (movie) => this.movie = movie,
      (error) => console.error('Error fetching movie details:', error)
    );
  }

  // Method to navigate back to the home page
  goBack(): void {
    this.router.navigate(['/movies']);
  }
}
