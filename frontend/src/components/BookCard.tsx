import { Link } from 'react-router-dom';
import { getBookCoverUrl, getBookDownloadUrl } from '../api/libraryApi';
import type { Book } from '../types/api';

type BookCardProps = {
  book: Book;
  onOrder?: (bookId: number) => void;
  isRecommended?: boolean;
  recommendationTags?: Array<'SYSTEM' | 'USER'>;
};

function compactDescription(description?: string | null): string | null {
  if (!description?.trim()) return null;
  return description.length > 140 ? `${description.slice(0, 137).trimEnd()}...` : description;
}

export function BookCard({ book, onBorrow, isRecommended, recommendationTags }: BookCardProps) {
  const summary = compactDescription(book.description);
  const meta = [book.publisher, book.language, book.pageCount ? `${book.pageCount} pp.` : null].filter(Boolean).join(' • ');

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <img className="h-52 w-full object-cover" src={getBookCoverUrl(book.id)} alt={`Обложка: ${book.title}`} />
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold">
          <Link className="hover:text-indigo-700 hover:underline" to={`/books/${book.id}`}>{book.title}</Link>
          {isRecommended && (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              рекомендация
            </span>
          )}
        </h3>
        {!!recommendationTags?.length && (
          <div className="mb-2 flex flex-wrap gap-2">
            {recommendationTags.includes('USER') && (
              <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold uppercase text-indigo-700">пользовательская</span>
            )}
            {recommendationTags.includes('SYSTEM') && (
              <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold uppercase text-sky-700">системная</span>
            )}
          </div>
        )}
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Author:</span> {book.author}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Year:</span> {book.publicationYear}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Genres:</span> {book.genres.join(', ')}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">ISBN:</span> {book.isbn}
        </p>
        {meta && <p className="mt-1 text-sm text-slate-600">{meta}</p>}
        {summary && <p className="mt-2 text-sm leading-6 text-slate-600">{summary}</p>}
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-semibold">Available:</span> {book.availableCopies}/{book.totalCopies}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {onOrder && (
            <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => onOrder(book.id)}>
              Order
            </button>
          )}
          {book.hasFile && (
            <a
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              href={getBookDownloadUrl(book.id)}
              rel="noreferrer"
              target="_blank"
            >
              Download
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
