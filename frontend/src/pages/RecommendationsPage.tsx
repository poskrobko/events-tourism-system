import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { BookCard } from '../components/BookCard';
import { useRecommendationsQuery, useUpdatePreferencesMutation } from '../features/preferences/hooks';
import { preferencesSchema, type PreferencesFormValues } from '../lib/schemas';
import { parseJwt } from '../lib/auth';
import { useAppSelector } from '../app/hooks';
import { useCatalogMetaQuery } from '../features/catalog/hooks';

export function RecommendationsPage() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const payload = parseJwt(accessToken);
  const userId = payload?.uid ?? null;

  const metaQuery = useCatalogMetaQuery();
  const recommendationsQuery = useRecommendationsQuery(userId);
  const preferencesMutation = useUpdatePreferencesMutation(userId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      genres: [],
      authors: [],
    },
  });

  const onSave = (values: PreferencesFormValues) => {
    preferencesMutation.mutate({
      preferredGenres: values.genres,
      favoriteAuthors: values.authors,
    });
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Recommendations</h2>

      <form className="grid gap-3" onSubmit={handleSubmit(onSave)}>
        <label className="grid gap-1 text-sm font-medium">
          Preferred genres
          <select className="min-h-28 rounded-md border border-slate-300 px-3 py-2" multiple {...register('genres')}>
            {metaQuery.data?.genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          {errors.genres && <span className="text-sm text-red-700">{errors.genres.message}</span>}
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Favorite authors
          <select className="min-h-28 rounded-md border border-slate-300 px-3 py-2" multiple {...register('authors')}>
            {metaQuery.data?.authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
          {errors.authors && <span className="text-sm text-red-700">{errors.authors.message}</span>}
        </label>

        <button className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-white" type="submit">
          Save preferences
        </button>
      </form>

      {preferencesMutation.isSuccess && <p className="mt-3 text-sm text-green-700">Preferences updated.</p>}
      {preferencesMutation.error && <p className="mt-3 text-sm text-red-700">Ошибка обновления предпочтений.</p>}

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {recommendationsQuery.data?.content.map((book) => (
          <BookCard key={book.id} book={book} isRecommended />
        ))}
      </div>
    </section>
  );
}
