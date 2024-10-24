export interface Review {
    id?: number;
    movieId: number;
    reviewerName: string;
    reviewText: string;
    rating: number;  // Rating can be from 1 to 5
  }
  