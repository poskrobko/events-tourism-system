import { getBookCoverUrl, getBookDownloadUrl } from '../api/libraryApi';
import type { Book } from '../types/api';

type BookCardProps = {
  book: Book;
  onBorrow?: (bookId: number) => void;
  isRecommended?: boolean;
};

export function BookCard({ book, onBorrow, isRecommended }: BookCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <img className="h-52 w-full object-cover" src={getBookCoverUrl(book.id)} alt={`Обложка: ${book.title}`} />
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold">
          {book.title}
          {isRecommended && (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              рекомендация
            </span>
          )}
        </h3>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Author:</span> {book.author}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Year:</span> {book.publicationYear}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Genres:</span> {book.genres?.join(', ') || '—'}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">ISBN:</span> {book.isbn || '—'}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Available:</span> {book.availableCopies}/{book.totalCopies}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {onBorrow && (
            <button
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={book.availableCopies < 1}
              onClick={() => onBorrow(book.id)}
            >
              Borrow
            </button>
          )}
          {book.hasFile && (
            <a className="rounded-md border border-indigo-300 px-3 py-2 text-sm font-medium text-indigo-700" href={getBookDownloadUrl(book.id)}>
              Скачать книгу
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
