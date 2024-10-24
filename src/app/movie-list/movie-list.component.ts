import { Component, numberAttribute, OnInit } from '@angular/core';
import { MovieService } from '../movie.service';
import { Movie } from '../movie';
import { Review } from '../reviews';  // Review interface
import * as bootstrap from 'bootstrap';  // Import Bootstrap JS
import { Modal } from 'bootstrap';  // Import Bootstrap Modal directly
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss']
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];  // Correctly typed array of movies
  newMovie: Movie = {  title: '', genre: '', releaseDate: '', director: '' };
  isEditing: boolean = false;

  searchTerm: string = ''; // This will bind to the input field
  filteredMovies: Movie[] = []; // This will hold the filtered movies

  reviews: Review[] = [];  // Array to hold reviews
  newReview: Review = { movieId: 0, reviewerName: '', reviewText: '', rating: 1 }; // Initialize new review

  selectedMovieId: number = 0; // Default to 0 instead of null
  selectedMovie: Movie | null = null;


  showSuccessMessage: boolean = false;  // Add this property
  showErrorMessage: boolean = false;  // Add this property
  loadingReviews: any;

  constructor(private movieService: MovieService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.getMovies();  // Fetch the movies when the component is initialized
  }

  getMovies(): void {
    this.movieService.getMovies().subscribe(
      (movies) => {
        this.movies = movies;  // Update the movie list
        this.filteredMovies = movies;  // Initially display all movies
  
        // For each movie, fetch the reviews
        this.movies.forEach((movie) => {
          if (movie.id) {  // Check if the movie has a valid ID
            movie.reviews = movie.reviews || []; // Ensure reviews is an empty array if not defined

            this.movieService.getReviews(movie.id).subscribe(
              (reviews) => {
                movie['reviews'] = reviews;  // Attach reviews to a temporary property in the movie object
              },
              (error) => {
                console.error('Error fetching reviews for movie', error);
              }
            );
          }
        });
  
        console.log('Movies list after update:', this.movies);
      },
      (error) => {
        console.error('Error fetching movies', error);
      }
    );
  }
  
  
  
  addMovie() {
    this.movieService.addMovie(this.newMovie).subscribe((movie) => {
      this.movies.push(movie);  // Update the list with the new movie
    });
  }

  deleteMovie(id: number): void {
    if (!id) {
      console.error('Movie ID is required for deletion');
      return;
    }
  
    this.movieService.deleteMovie(id).subscribe(
      () => {
        console.log('Movie deleted successfully');
  
  
        // Update the movie list after deletion
        this.getMovies();
        // Optionally log the new movie list after deletion
        console.log('Updated movie list:', this.movies);
      },
      (error) => {
        console.error('Error deleting movie', error);
      }
    );
  }
  
  

  editMovie(movie: Movie): void {

    this.newMovie = { ...movie }; // Populate the form with the movie details
    console.log('Editing movie:', this.newMovie); // Log the movie details including id

    this.isEditing = true; // Set a flag to indicate we are editing
  }
  
  updateMovie(): void {
    if (!this.newMovie.id) {
      console.error('Movie ID is required for updating');
      return;
    }
  
    console.log('Updating movie:', this.newMovie);
  
    this.movieService.updateMovie(this.newMovie).subscribe(
      (updatedMovie) => {
        console.log('Updated movie from API:', updatedMovie);
        this.getMovies(); // Simply refetch the movie list instead of manually updating it
        this.resetForm();
      },
      (error) => {
        console.error('Error updating movie', error);
      }
    );
  }
  
  resetForm(): void {
    this.newMovie = { id: null, title: '', genre: '', releaseDate: '', director: '' };  // Set id to null
    this.isEditing = false; // Reset the editing state

  }

  searchMovies(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredMovies = this.movies;
    } else {
      this.filteredMovies = this.movies.filter((movie) =>
        movie.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        movie.genre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        movie.director.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  getReviews(movieId: number): void {
    this.movieService.getReviews(movieId).subscribe(
      (reviews) => {
        this.reviews = reviews;  // Assign the fetched reviews to the reviews array
      },
      (error) => {
        console.error('Error fetching reviews', error);
      }
    );
  }

  openReviewModal(movie: Movie): void {
    this.selectedMovie = movie;  // Set the selected movie to be reviewed
    this.selectedMovieId = movie.id || 0;  // Set the selected movie ID

    // Use a setTimeout to delay the modal initialization slightly
    setTimeout(() => {
  
    // Ensure modal element exists before showing
    const modalElement = document.getElementById('reviewModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Modal element not found');
    }
    
  }, 0);


  }

  addReview(): void {
    if (!this.selectedMovieId) {
      console.error('No movie selected for review.');
      return;
    }
    
    // Set the movieId for the review object
    this.newReview.movieId = this.selectedMovieId;
    
    this.movieService.addReview(this.newReview).subscribe({
      next: (review) => {
        // Fetch updated reviews for the selected movie
        this.movieService.getReviews(this.selectedMovieId).subscribe({
          next: (reviews) => {
            const movie = this.movies.find(m => m.id === this.selectedMovieId);
            if (movie) {
              movie.reviews = reviews; // Update the reviews list
            }
          },
          error: (err) => {
            console.error('Error fetching updated reviews', err);
          }
        });
        
        // Reset the form
        this.newReview = { movieId: this.selectedMovieId, reviewerName: '', reviewText: '', rating: 1 };
        this.showSuccessMessage = true;
        setTimeout(() => this.showSuccessMessage = false, 3000);
        
        // Close the modal
        const modalElement = document.getElementById('reviewModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }
      },
      error: (err) => {
        console.error('Error adding review', err);
      }
    });
  }

// Function to close the review modal and reset form state
closeReviewModal(): void {
  this.selectedMovie = null;

  // Reset the form
  this.newReview = { movieId: 0, reviewerName: '', reviewText: '', rating: 1 };
  this.showSuccessMessage = false;

}


selectMovie(movieId: number | null | undefined): void {
  if (!movieId) {
    console.error('Movie ID is invalid');
    return;
  }

  this.selectedMovieId = movieId;
  this.getReviews(movieId);  // Fetch reviews for the selected movie
}

viewMovieDetails(movieId: number): void {
  this.movieService.getMovie(movieId).subscribe({
    next: (movie) => {
      console.log('Movie details:', movie);
    },
    error: (err) => {
      console.error('Error fetching movie details', err);
    }
  });

  this.router.navigate(['/movie', movieId]);

}



}
