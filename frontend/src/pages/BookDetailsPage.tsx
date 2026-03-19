import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { Pagination } from '../components/Pagination';
import { getBookCoverUrl, getBookDownloadUrl } from '../api/libraryApi';
import { useDeleteBookMutation, useBookDetailsQuery, useBookReviewsQuery, useUpdateBookMutation } from '../features/catalog/hooks';
import { useAppSelector } from '../app/hooks';
import { parseJwt } from '../lib/auth';
import { extractApiError } from '../lib/apiErrors';

const emptyEditForm = {
  title: '',
  author: '',
  publicationYear: '',
  genresCsv: '',
  copies: '',
  isbn: '',
  publisher: '',
  language: '',
  pageCount: '',
  description: '',
};

export function BookDetailsPage() {
  const { id } = useParams();
  const bookId = Number(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const payload = parseJwt(accessToken);
  const roles = payload?.roles ?? [];
  const canManageBooks = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_LIBRARIAN');

  const [reviewsPage, setReviewsPage] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditMode, setIsEditMode] = useState(searchParams.get('edit') === '1');
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const detailsQuery = useBookDetailsQuery(Number.isNaN(bookId) ? null : bookId);
  const reviewsQuery = useBookReviewsQuery(Number.isNaN(bookId) ? null : bookId, reviewsPage, 5);

  const renderStars = (score?: number | null) => (score == null ? '☆☆☆☆☆' : `${'★'.repeat(score)}${'☆'.repeat(5 - score)}`);
  const deleteBookMutation = useDeleteBookMutation();
  const updateBookMutation = useUpdateBookMutation();

  const stars = useMemo(() => {
    const avg = detailsQuery.data?.averageRating ?? 0;
    const rounded = Math.round(avg);
    return '★'.repeat(rounded) + '☆'.repeat(Math.max(0, 5 - rounded));
  }, [detailsQuery.data?.averageRating]);

  useEffect(() => {
    const book = detailsQuery.data?.book;
    if (!book) return;
    setEditForm({
      title: book.title,
      author: book.author,
      publicationYear: String(book.publicationYear),
      genresCsv: book.genres.join(', '),
      copies: String(book.totalCopies),
      isbn: book.isbn ?? '',
      publisher: book.publisher ?? '',
      language: book.language ?? '',
      pageCount: book.pageCount ? String(book.pageCount) : '',
      description: book.description ?? '',
    });
  }, [detailsQuery.data]);

  if (Number.isNaN(bookId)) {
    return <p className="text-sm text-red-700">Invalid book id.</p>;
  }

  if (detailsQuery.isLoading) {
    return <p className="text-sm text-slate-600">Loading book details...</p>;
  }

  if (detailsQuery.error || !detailsQuery.data) {
    return <p className="text-sm text-red-700">Не удалось загрузить детали книги.</p>;
  }

  const { book } = detailsQuery.data;

  const detailItems = [
    ['Author', book.author],
    ['Year', String(book.publicationYear)],
    ['Genres', book.genres.join(', ')],
    ['ISBN', book.isbn],
    ['Publisher', book.publisher],
    ['Language', book.language],
    ['Pages', book.pageCount ? String(book.pageCount) : null],
  ].filter(([, value]) => Boolean(value));

  const saveBook = () => {
    const publicationYear = Number(editForm.publicationYear);
    const copies = Number(editForm.copies);
    const pageCount = editForm.pageCount.trim() ? Number(editForm.pageCount) : null;

    if (!editForm.title.trim() || !editForm.author.trim()) {
      setSaveMessage('Название и автор обязательны.');
      return;
    }
    if (Number.isNaN(publicationYear) || Number.isNaN(copies) || copies < 1) {
      setSaveMessage('Проверьте год публикации и количество копий.');
      return;
    }
    if (pageCount !== null && (Number.isNaN(pageCount) || pageCount < 1)) {
      setSaveMessage('Количество страниц должно быть положительным числом.');
      return;
    }

    setSaveMessage(null);
    updateBookMutation.mutate(
      {
        id: book.id,
        payload: {
          title: editForm.title.trim(),
          author: editForm.author.trim(),
          publicationYear,
          copies,
          genres: editForm.genresCsv.split(',').map((genre) => genre.trim()).filter(Boolean),
          isbn: editForm.isbn.trim() || null,
          publisher: editForm.publisher.trim() || null,
          language: editForm.language.trim() || null,
          pageCount,
          description: editForm.description.trim() || null,
        },
      },
      {
        onSuccess: () => {
          setSaveMessage('Изменения по книге сохранены.');
          setIsEditMode(false);
        },
        onError: (error) => setSaveMessage(extractApiError(error, 'Не удалось сохранить изменения по книге.')),
      },
    );
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <img className="w-full rounded-lg border border-slate-200 object-cover" src={getBookCoverUrl(book.id)} alt={book.title} />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{book.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{book.availableCopies} из {book.totalCopies} экземпляров доступны сейчас.</p>
            </div>
            {canManageBooks && (
              <div className="flex gap-2">
                <button className="rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={() => setIsEditMode((prev) => !prev)} type="button">
                  ✏️ {isEditMode ? 'Cancel edit' : 'Edit'}
                </button>
                <button className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white" onClick={() => setConfirmDelete(true)} type="button">
                  🗑 Delete
                </button>
              </div>
            )}
          </div>

          {saveMessage && (
            <p className={`mt-4 rounded-md px-3 py-2 text-sm ${updateBookMutation.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {saveMessage}
            </p>
          )}

          {isEditMode && canManageBooks ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium">
                Название
                <input className="rounded-md border border-slate-300 px-3 py-2" value={editForm.title} onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Автор
                <input className="rounded-md border border-slate-300 px-3 py-2" value={editForm.author} onChange={(event) => setEditForm((prev) => ({ ...prev, author: event.target.value }))} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Год публикации
                <input className="rounded-md border border-slate-300 px-3 py-2" type="number" value={editForm.publicationYear} onChange={(event) => setEditForm((prev) => ({ ...prev, publicationYear: event.target.value }))} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Кол-во копий
                <input className="rounded-md border border-slate-300 px-3 py-2" type="number" min={1} value={editForm.copies} onChange={(event) => setEditForm((prev) => ({ ...prev, copies: event.target.value }))} />
              </label>
              <label className="grid gap-1 text-sm font-medium md:col-span-2">
                Жанры
                <input className="rounded-md border border-slate-300 px-3 py-2" value={editForm.genresCsv} onChange={(event) => setEditForm((prev) => ({ ...prev, genresCsv: event.target.value }))} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                ISBN
                <input className="rounded-md border border-slate-300 px-3 py-2" value={editForm.isbn} onChange={(event) => setEditForm((prev) => ({ ...prev, isbn: event.target.value }))} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Издательство
                <input className="rounded-md border border-slate-300 px-3 py-2" value={editForm.publisher} onChange={(event) => setEditForm((prev) => ({ ...prev, publisher: event.target.value }))} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Язык
                <input className="rounded-md border border-slate-300 px-3 py-2" value={editForm.language} onChange={(event) => setEditForm((prev) => ({ ...prev, language: event.target.value }))} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Страниц
                <input className="rounded-md border border-slate-300 px-3 py-2" type="number" min={1} value={editForm.pageCount} onChange={(event) => setEditForm((prev) => ({ ...prev, pageCount: event.target.value }))} />
              </label>
              <label className="grid gap-1 text-sm font-medium md:col-span-2">
                Описание
                <textarea className="rounded-md border border-slate-300 px-3 py-2" rows={4} value={editForm.description} onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))} />
              </label>
            </div>
          ) : (
            <>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {detailItems.map(([label, value]) => (
                  <div className="rounded-lg bg-slate-50 px-4 py-3" key={label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="mt-1 text-sm text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>

              {book.description && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{book.description}</p>
                </div>
              )}
            </>
          )}

          <div className="mt-3 flex gap-2">
            {book.hasFile && <a className="rounded-md border border-slate-300 px-3 py-1 text-sm" href={getBookDownloadUrl(book.id)} target="_blank" rel="noreferrer">Download file</a>}
            {canManageBooks && isEditMode && (
              <button className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white" onClick={saveBook} type="button">Save changes</button>
            )}
          </div>

          <div className="mt-4 rounded-lg bg-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-800">Average rating</p>
            <p className="text-lg text-amber-500">{stars}</p>
            <p className="text-sm text-slate-700">{detailsQuery.data.averageRating.toFixed(2)} / 5 ({detailsQuery.data.ratingsCount} ratings)</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold">Comments</h3>
        {reviewsQuery.isLoading && <p className="text-sm text-slate-600">Loading comments...</p>}
        {reviewsQuery.error && <p className="text-sm text-red-700">Не удалось загрузить комментарии.</p>}

        <div className="space-y-3">
          {reviewsQuery.data?.content.map((review) => (
            <article className="rounded-lg border border-slate-200 p-3" key={review.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-amber-500">{renderStars(review.ratingScore)}{review.ratingScore != null ? ` (${review.ratingScore}/5)` : ''}</p>
                <p className="text-xs text-slate-500">User #{review.userId} • {new Date(review.createdAt).toLocaleString()}</p>
              </div>
              <p className="mt-2 text-sm text-slate-800">{review.text}</p>
            </article>
          ))}
        </div>

        <Pagination page={reviewsQuery.data?.number ?? reviewsPage} totalPages={reviewsQuery.data?.totalPages ?? 0} onPageChange={setReviewsPage} />
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete book"
        description="This action will permanently remove the book."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteBookMutation.mutate(book.id, {
            onSuccess: () => {
              setConfirmDelete(false);
              navigate('/catalog');
            },
          });
        }}
      />
    </section>
  );
}
