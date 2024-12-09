import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MovieService } from '../movie.service';
import { Movie } from '../movie';
import { Review } from '../reviews'; // Review interface
import * as bootstrap from 'bootstrap'; // Import Bootstrap JS
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = []; // Correctly typed array of movies
  newMovie: Movie = { title: '', genre: '', releaseDate: '', director: '' }; // Initialize new movie

  genres: string[] = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Horror',
    'Romance',
    'Sci-Fi',
    'Thriller',
    'Family',
    'Fantasy',
    'Documentary',
    'Animation',
  ]; // Add genres array

  isEditing: boolean = false;

  // Material Table properties
  displayedColumns: string[] = [
    'title',
    'genre',
    'releaseDate',
    'director',
    'actions',
  ];
  dataSource!: MatTableDataSource<Movie>;

  searchTerm: string = ''; // This will bind to the input field
  filteredMovies: Movie[] = []; // This will hold the filtered movies

  reviews: Review[] = []; // Array to hold reviews
  newReview: Review = {
    movieId: 0,
    reviewerName: '',
    reviewText: '',
    rating: 1,
  }; // Initialize new review

  selectedMovieId: number = 0; // Default to 0 instead of null
  selectedMovie: Movie | null = null;
  dialogRef: MatDialogRef<any> | null = null;

  showSuccessMessage: boolean = false; // Add this property
  showErrorMessage: boolean = false; // Add this property
  loadingReviews: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('reviewDialog') reviewDialog!: TemplateRef<any>;
  @ViewChild('movieForm') movieForm!: NgForm;

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMovies(); // Fetch the movies when the component is initialized
  }
  loadMovies() {
    this.movieService.getMovies().subscribe((movies) => {
      this.movies = movies; // Keep existing movies array for other features
      this.dataSource = new MatTableDataSource(movies);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Custom filter predicate for searching across multiple columns
      this.dataSource.filterPredicate = (data: Movie, filter: string) => {
        const searchStr = (
          data.title +
          data.genre +
          data.director
        ).toLowerCase();
        return searchStr.indexOf(filter.toLowerCase()) !== -1;
      };

      // Load reviews for each movie
      this.movies.forEach((movie) => {
        if (movie.id) {
          this.movieService.getReviews(movie.id).subscribe(
            (reviews) => (movie.reviews = reviews),
            (error) => console.error('Error fetching reviews:', error)
          );
        }
      });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getMovies(): void {
    this.movieService.getMovies().subscribe(
      (movies) => {
        this.movies = movies; // Update the movie list
        this.filteredMovies = movies; // Initially display all movies

        // For each movie, fetch the reviews
        this.movies.forEach((movie) => {
          if (movie.id) {
            // Check if the movie has a valid ID
            movie.reviews = movie.reviews || []; // Ensure reviews is an empty array if not defined

            this.movieService.getReviews(movie.id).subscribe(
              (reviews) => {
                movie['reviews'] = reviews; // Attach reviews to a temporary property in the movie object
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

  // Method to open the modal
  openAddMovieForm() {
    if (!this.checkAuthentication()) {
      return;
    }
    // Using vanilla JavaScript to open Bootstrap modal
    const modal = document.getElementById('addMovieModal');
    if (modal) {
      // @ts-ignore - Bootstrap types not recognized
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  // Method to submit the movie
  submitMovie(): void {
    if (this.isEditing) {
      this.updateMovie();
    } else {
      this.addMovie();
    }
  }

  addMovie() {
    this.movieService.addMovie(this.newMovie).subscribe({
      next: (addMovie) => {
        this.movies.push(addMovie); // Update the list with the new movie
        this.loadMovies(); // Reload the movies after adding
        this.closeModal(); // Close the modal after adding
        this.resetForm(); // Reset the form after adding
        this.snackBar.open('Movie added successfully!', 'Close', {
          duration: 3000, // Duration in milliseconds
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      },
      error: (err) => {
        console.error('Error adding movie:', err);
      },
    });
  }

  // Add this method to your component class
  closeModal() {
    const modal = document.getElementById('addMovieModal');
    if (modal) {
      // @ts-ignore - Bootstrap types not recognized
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }
  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  // Update delete method
  deleteMovie(id: number): void {
    if (!this.checkAuthentication()) {
      return;
    }
    if (!id) return;

    this.movieService.deleteMovie(id).subscribe(
      () => {
        this.loadMovies(); // Reload both table and movies array
      },
      (error) => console.error('Error deleting movie:', error)
    );
  }

  editMovie(movie: Movie) {
    this.isEditing = true;
    this.newMovie = { ...movie }; // Copy the movie data to the form
    this.openAddMovieForm();
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
        this.loadMovies(); // Reload the movies after updating
        this.closeModal(); // Close the modal after updating
        this.resetForm();
      },
      (error) => {
        console.error('Error updating movie', error);
      }
    );
  }

  resetForm(): void {
    this.newMovie = { title: '', genre: '', releaseDate: '', director: '' }; // Set id to null
    this.isEditing = false; // Reset the editing state
  }

  searchMovies(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredMovies = this.movies;
    } else {
      this.filteredMovies = this.movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          movie.genre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          movie.director.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  getReviews(movieId: number): void {
    this.movieService.getReviews(movieId).subscribe(
      (reviews) => {
        this.reviews = reviews; // Assign the fetched reviews to the reviews array
      },
      (error) => {
        console.error('Error fetching reviews', error);
      }
    );
  }

  // Method to show success message
  showSuccessSnackBar() {
    this.snackBar.open(
      'Your review has been submitted successfully!',
      'Close',
      {
        duration: 3000, // Duration in milliseconds
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      }
    );
  }

  openReviewModal(movie: Movie): void {
    if (!this.checkAuthentication()) {
      return;
    }

    if (!movie || !movie.id) {
      console.error('Invalid movie selected');
      return;
    }

    this.selectedMovie = movie;
    this.selectedMovieId = movie.id;
    this.newReview.movieId = movie.id; // Also set the movieId in newReview

    this.dialogRef = this.dialog.open(this.reviewDialog, {
      width: '500px',
      disableClose: true,
    });
  }

  addReview(): void {
    if (!this.selectedMovie?.id) {
      console.error('No movie selected for review.');
      return;
    }

    // Set the movieId for the review object
    this.newReview.movieId = this.selectedMovie.id;

    this.movieService.addReview(this.newReview).subscribe({
      next: (review) => {
        // Fetch updated reviews for the selected movie
        this.movieService.getReviews(this.selectedMovie!.id!).subscribe({
          next: (reviews) => {
            if (this.selectedMovie) {
              this.selectedMovie.reviews = reviews;
            }

            // Show success message
            this.showSuccessSnackBar();

            // Reset the form
            this.newReview = {
              movieId: this.selectedMovie!.id!,
              reviewerName: '',
              reviewText: '',
              rating: 1,
            };

            // Close the dialog
            if (this.dialogRef) {
              this.dialogRef.close();
            }
          },
          error: (err) => {
            console.error('Error fetching updated reviews', err);
          },
        });
      },
      error: (err) => {
        console.error('Error adding review', err);
      },
    });
  }

  // Function to close the review modal and reset form state
  closeReviewModal(): void {
    this.selectedMovie = null;

    // Reset the form
    this.newReview = {
      movieId: 0,
      reviewerName: '',
      reviewText: '',
      rating: 1,
    };
    this.showSuccessMessage = false;
  }

  selectMovie(movieId: number | null | undefined): void {
    if (typeof movieId !== 'number') {
      console.error('Movie ID is invalid');
      return;
    }

    this.selectedMovieId = movieId;
    this.getReviews(movieId); // Fetch reviews for the selected movie
  }

  viewMovieDetails(movieId: number): void {
    this.movieService.getMovie(movieId).subscribe({
      next: (movie) => {
        console.log('Movie details:', movie);
      },
      error: (err) => {
        console.error('Error fetching movie details', err);
      },
    });

    this.router.navigate(['/movie', movieId]);
  }

  checkAuthentication(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open(
        'You must be logged in to perform this action.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        }
      );
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
