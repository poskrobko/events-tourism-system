import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BookAvailability, BookSearchIn } from '../../types/api';

type CatalogFilterState = {
  query: string;
  searchIn: BookSearchIn;
  title: string;
  author: string;
  genre: string;
  publisher: string;
  language: string;
  isbn: string;
  yearFrom: string;
  yearTo: string;
  availability: BookAvailability;
};

const initialState: CatalogFilterState = {
  query: '',
  searchIn: 'all',
  title: '',
  author: '',
  genre: '',
  publisher: '',
  language: '',
  isbn: '',
  yearFrom: '',
  yearTo: '',
  availability: 'all',
};

const booksSlice = createSlice({
  name: 'booksFilters',
  initialState,
  reducers: {
    setFilters(_state, action: PayloadAction<CatalogFilterState>) {
      return action.payload;
    },
    clearFilters() {
      return initialState;
    },
  },
});

export const { setFilters, clearFilters } = booksSlice.actions;
export default booksSlice.reducer;
