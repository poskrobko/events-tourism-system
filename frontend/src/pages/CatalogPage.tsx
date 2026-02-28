import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setFilters } from '../features/books/booksSlice';
import { BookCard } from '../components/BookCard';
import { catalogFilterSchema, type CatalogFilterValues } from '../lib/schemas';
import { useBooksQuery, useBorrowBookMutation, useCatalogMetaQuery } from '../features/catalog/hooks';
import { parseJwt } from '../lib/auth';
import { useRecommendationsQuery } from '../features/preferences/hooks';

export function CatalogPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const filters = useAppSelector((state) => state.booksFilters);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const payload = parseJwt(accessToken);
  const currentUserId = payload?.uid ?? null;

  const [page] = useState(0);
  const [size] = useState(12);
  const params = useMemo(
    () => ({ page, size, genre: filters.genre || undefined, author: filters.author || undefined }),
    [filters.author, filters.genre, page, size],
  );

  const booksQuery = useBooksQuery(params);
  const metaQuery = useCatalogMetaQuery();
  const recommendationsQuery = useRecommendationsQuery(currentUserId);
  const recommendedIds = new Set(recommendationsQuery.data?.content.map((book) => book.id) ?? []);
  const borrowMutation = useBorrowBookMutation(params);

  const { register, handleSubmit } = useForm<CatalogFilterValues>({
    resolver: zodResolver(catalogFilterSchema),
    defaultValues: {
      genre: filters.genre,
      author: filters.author,
    },
  });

  const submitFilters = (values: CatalogFilterValues) => {
    dispatch(setFilters({ genre: values.genre ?? '', author: values.author ?? '' }));
  };

  const onBorrow = (bookId: number) => {
    if (!currentUserId) {
      navigate('/login', { replace: true });
      return;
    }
    borrowMutation.mutate({ userId: currentUserId, bookId });
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Catalog</h2>

      <form className="mb-4 grid gap-3 md:grid-cols-3" onSubmit={handleSubmit(submitFilters)}>
        <label className="grid gap-1 text-sm font-medium">
          Genre
          <select className="rounded-md border border-slate-300 px-3 py-2" {...register('genre')}>
            <option value="">All genres</option>
            {metaQuery.data?.genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Author
          <select className="rounded-md border border-slate-300 px-3 py-2" {...register('author')}>
            <option value="">All authors</option>
            {metaQuery.data?.authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </label>

        <button className="h-fit w-fit self-end rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">
          Apply filters
        </button>
      </form>

      {!accessToken && (
        <p className="mb-3 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-800">
          Гость может только просматривать каталог. Чтобы брать книги, выполните вход.
        </p>
      )}

      {booksQuery.isLoading && <p className="text-sm text-slate-600">Loading books...</p>}
      {booksQuery.error && <p className="text-sm text-red-700">Ошибка загрузки каталога.</p>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {booksQuery.data?.content.map((book) => (
          <BookCard key={book.id} book={book} onBorrow={onBorrow} isRecommended={recommendedIds.has(book.id)} />
        ))}
      </div>

      {borrowMutation.isSuccess && <p className="mt-3 text-sm text-green-700">Книга успешно выдана.</p>}
      {borrowMutation.error && <p className="mt-3 text-sm text-red-700">Не удалось выдать книгу.</p>}
    </section>
  );
}
