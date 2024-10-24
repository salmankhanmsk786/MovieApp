import { Review } from "./reviews";

export interface Movie {
  id?: number | null;
  title: string;
  genre: string;
  releaseDate: string;
  director: string;
  reviews?: Review[];  // Optional, list of reviews associated with this movie
}

export interface NewMovie {

  title: string;
  genre: string;
  releaseDate: string;
  director: string;
}
