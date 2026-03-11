import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setFilters } from '../features/books/booksSlice';
import { BookCard } from '../components/BookCard';
import {
  advancedCatalogSearchSchema,
  createBookSchema,
  simpleCatalogSearchSchema,
  type AdvancedCatalogSearchValues,
  type CreateBookFormValues,
  type SimpleCatalogSearchValues,
} from '../lib/schemas';
import { useBooksQuery, useBorrowBookMutation, useCatalogMetaQuery, useCreateBookMutation } from '../features/catalog/hooks';
import { parseJwt } from '../lib/auth';
import { useRecommendationsQuery } from '../features/preferences/hooks';

function parseYear(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export function CatalogPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const filters = useAppSelector((state) => state.booksFilters);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const payload = parseJwt(accessToken);
  const currentUserId = payload?.uid ?? null;
  const roles = payload?.roles ?? [];
  const canManageBooks = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_LIBRARIAN');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [page] = useState(0);
  const [size] = useState(12);

  const params = useMemo(() => {
    const query = filters.searchIn === 'all' ? filters.query || undefined : undefined;
    const title = (filters.title || (filters.searchIn === 'title' ? filters.query : '')).trim() || undefined;
    const author = (filters.author || (filters.searchIn === 'author' ? filters.query : '')).trim() || undefined;
    const genre = (filters.genre || (filters.searchIn === 'genre' ? filters.query : '')).trim() || undefined;

    return {
      page,
      size,
      query,
      title,
      author,
      genre,
      yearFrom: parseYear(filters.yearFrom),
      yearTo: parseYear(filters.yearTo),
      availability: filters.availability,
    };
  }, [filters, page, size]);

  const booksQuery = useBooksQuery(params);
  const metaQuery = useCatalogMetaQuery();
  const recommendationsQuery = useRecommendationsQuery(currentUserId);
  const recommendedIds = new Set(recommendationsQuery.data?.content.map((book) => book.id) ?? []);
  const borrowMutation = useBorrowBookMutation(params);
  const createBookMutation = useCreateBookMutation(params);

  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const simpleForm = useForm<SimpleCatalogSearchValues>({
    resolver: zodResolver(simpleCatalogSearchSchema),
    defaultValues: {
      searchText: filters.query,
      searchIn: filters.searchIn,
      availability: filters.availability,
    },
  });

  const advancedForm = useForm<AdvancedCatalogSearchValues>({
    resolver: zodResolver(advancedCatalogSearchSchema),
    defaultValues: {
      title: filters.title,
      author: filters.author,
      genre: filters.genre,
      keyword: filters.query,
      yearFrom: filters.yearFrom,
      yearTo: filters.yearTo,
      availability: filters.availability,
    },
  });

  const createBookForm = useForm<CreateBookFormValues>({
    resolver: zodResolver(createBookSchema),
    defaultValues: {
      title: '',
      author: '',
      publicationYear: new Date().getFullYear(),
      copies: 1,
      genresCsv: '',
      isbn: '',
      publisher: '',
      language: '',
      description: '',
    },
  });

  const submitSimple = (values: SimpleCatalogSearchValues) => {
    dispatch(
      setFilters({
        query: values.searchText ?? '',
        searchIn: values.searchIn,
        title: '',
        author: '',
        genre: '',
        yearFrom: '',
        yearTo: '',
        availability: values.availability,
      }),
    );
  };

  const submitAdvanced = (values: AdvancedCatalogSearchValues) => {
    dispatch(
      setFilters({
        query: values.keyword ?? '',
        searchIn: 'all',
        title: values.title ?? '',
        author: values.author ?? '',
        genre: values.genre ?? '',
        yearFrom: values.yearFrom ?? '',
        yearTo: values.yearTo ?? '',
        availability: values.availability,
      }),
    );
  };

  const submitCreateBook = (values: CreateBookFormValues) => {
    createBookMutation.mutate({
      title: values.title,
      author: values.author,
      publicationYear: values.publicationYear,
      copies: values.copies,
      genres: values.genresCsv.split(',').map((g) => g.trim()).filter(Boolean),
      isbn: values.isbn,
      publisher: values.publisher,
      language: values.language,
      pageCount: values.pageCount,
      description: values.description,
      file: bookFile,
      cover: coverFile,
    });
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
      <h2 className="mb-4 text-xl font-bold">Catalog Search</h2>

      <form className="mb-3 grid gap-3 md:grid-cols-4" onSubmit={simpleForm.handleSubmit(submitSimple)}>
        <label className="grid gap-1 text-sm font-medium md:col-span-2">
          Найти
          <input className="rounded-md border border-slate-300 px-3 py-2" {...simpleForm.register('searchText')} placeholder="Например: Пушкин" />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Искать в
          <select className="rounded-md border border-slate-300 px-3 py-2" {...simpleForm.register('searchIn')}>
            <option value="all">Везде (ключевые слова)</option>
            <option value="title">Заглавие</option>
            <option value="author">Автор</option>
            <option value="genre">Тема / Жанр</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Наличие
          <select className="rounded-md border border-slate-300 px-3 py-2" {...simpleForm.register('availability')}>
            <option value="all">Все</option>
            <option value="available">Только в наличии</option>
            <option value="unavailable">Только выданные</option>
          </select>
        </label>

        <div className="md:col-span-4 flex flex-wrap items-center gap-3">
          <button className="rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">
            Искать
          </button>
          <button className="text-sm font-medium text-indigo-700 underline" type="button" onClick={() => setAdvancedOpen((prev) => !prev)}>
            {advancedOpen ? 'Скрыть расширенный поиск' : 'Расширенный поиск'}
          </button>
        </div>
      </form>

      {advancedOpen && (
        <form className="mb-5 grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-3" onSubmit={advancedForm.handleSubmit(submitAdvanced)}>
          <h3 className="md:col-span-3 text-lg font-semibold">Расширенный поиск</h3>

          <label className="grid gap-1 text-sm font-medium">
            Заглавие
            <input className="rounded-md border border-slate-300 px-3 py-2" {...advancedForm.register('title')} />
          </label>

          <label className="grid gap-1 text-sm font-medium">
            Автор
            <select className="rounded-md border border-slate-300 px-3 py-2" {...advancedForm.register('author')}>
              <option value="">Любой</option>
              {metaQuery.data?.authors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-medium">
            Тема / Жанр
            <select className="rounded-md border border-slate-300 px-3 py-2" {...advancedForm.register('genre')}>
              <option value="">Любой</option>
              {metaQuery.data?.genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-medium">
            Ключевые слова
            <input className="rounded-md border border-slate-300 px-3 py-2" {...advancedForm.register('keyword')} placeholder="Слова из описания, автора или жанра" />
          </label>

          <label className="grid gap-1 text-sm font-medium">
            Год издания: от
            <input className="rounded-md border border-slate-300 px-3 py-2" {...advancedForm.register('yearFrom')} placeholder="Например: 1950" />
          </label>

          <label className="grid gap-1 text-sm font-medium">
            Год издания: до
            <input className="rounded-md border border-slate-300 px-3 py-2" {...advancedForm.register('yearTo')} placeholder="Например: 2024" />
          </label>

          <label className="grid gap-1 text-sm font-medium">
            Наличие
            <select className="rounded-md border border-slate-300 px-3 py-2" {...advancedForm.register('availability')}>
              <option value="all">Все</option>
              <option value="available">Только в наличии</option>
              <option value="unavailable">Только выданные</option>
            </select>
          </label>

          <div className="md:col-span-2" />

          <button className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-white" type="submit">
            Применить расширенный поиск
          </button>
        </form>
      )}

      {canManageBooks && (
        <form className="mb-6 grid gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 md:grid-cols-3" onSubmit={createBookForm.handleSubmit(submitCreateBook)}>
          <h3 className="md:col-span-3 text-lg font-semibold text-slate-900">Добавить новую книгу (библиотекарь/админ)</h3>

          <label className="grid gap-1 text-sm font-medium">
            Название
            <input className="rounded-md border border-slate-300 px-3 py-2" {...createBookForm.register('title')} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Автор
            <input className="rounded-md border border-slate-300 px-3 py-2" {...createBookForm.register('author')} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Год издания
            <input className="rounded-md border border-slate-300 px-3 py-2" type="number" {...createBookForm.register('publicationYear')} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Кол-во копий
            <input className="rounded-md border border-slate-300 px-3 py-2" type="number" {...createBookForm.register('copies')} />
          </label>
          <label className="grid gap-1 text-sm font-medium md:col-span-2">
            Жанры (через запятую)
            <input className="rounded-md border border-slate-300 px-3 py-2" {...createBookForm.register('genresCsv')} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            ISBN
            <input className="rounded-md border border-slate-300 px-3 py-2" {...createBookForm.register('isbn')} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Издательство
            <input className="rounded-md border border-slate-300 px-3 py-2" {...createBookForm.register('publisher')} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Язык
            <input className="rounded-md border border-slate-300 px-3 py-2" {...createBookForm.register('language')} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Страниц
            <input className="rounded-md border border-slate-300 px-3 py-2" type="number" {...createBookForm.register('pageCount')} />
          </label>
          <label className="grid gap-1 text-sm font-medium md:col-span-2">
            Описание
            <textarea className="rounded-md border border-slate-300 px-3 py-2" rows={3} {...createBookForm.register('description')} />
          </label>

          <label className="grid gap-1 text-sm font-medium">
            Файл книги (PDF)
            <input className="rounded-md border border-slate-300 px-3 py-2" type="file" accept="application/pdf" onChange={(e) => setBookFile(e.target.files?.[0] ?? null)} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Превью обложки (необязательно)
            <input className="rounded-md border border-slate-300 px-3 py-2" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
          </label>

          <div className="md:col-span-3">
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-white" type="submit">
              Добавить книгу
            </button>
            {createBookMutation.isSuccess && <p className="mt-2 text-sm text-green-700">Книга добавлена.</p>}
            {createBookMutation.error && <p className="mt-2 text-sm text-red-700">Не удалось добавить книгу.</p>}
          </div>
        </form>
      )}

      {!accessToken && (
        <p className="mb-3 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-800">
          Гость может только просматривать каталог. Чтобы брать книги, выполните вход.
        </p>
      )}

      {booksQuery.isLoading && <p className="text-sm text-slate-600">Loading books...</p>}
      {booksQuery.error && <p className="text-sm text-red-700">Ошибка загрузки каталога.</p>}

      <div className="mb-3 text-sm text-slate-600">Найдено записей: {booksQuery.data?.totalElements ?? 0}</div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {booksQuery.data?.content.map((book) => (
          <BookCard key={book.id} book={book} onBorrow={onBorrow} isRecommended={recommendedIds.has(book.id)} />
        ))}
      </div>

      {borrowMutation.isSuccess && <p className="mt-3 text-sm text-green-700">Книга успешно выдана.</p>}
      {borrowMutation.error && <p className="mt-3 text-sm text-red-700">Не удалось выдать книгу.</p>}
    </section>
  );
}
