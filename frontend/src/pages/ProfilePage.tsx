import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '../app/hooks';
import { useReturnBookWithFeedbackMutation } from '../features/catalog/hooks';
import { useLoansQuery, useMeQuery, useUpdateMeMutation } from '../features/preferences/hooks';
import { parseJwt } from '../lib/auth';
import { profileSchema, type ProfileFormValues } from '../lib/schemas';

const avatarOptions = [
  { label: 'Mage', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9d9.svg' },
  { label: 'Developer', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9d1-200d-1f4bb.svg' },
  { label: 'Graduate', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f468-200d-1f393.svg' },
];

function extractApiError(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string; error?: string; details?: string }>;
  return axiosError.response?.data?.message ?? axiosError.response?.data?.details ?? axiosError.response?.data?.error ?? fallback;
}

export function ProfilePage() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const payload = parseJwt(accessToken);
  const currentUserId = payload?.uid ?? null;
  const roles = payload?.roles ?? [];
  const isAdmin = roles.includes('ROLE_ADMIN');

  const [selectedUserId, setSelectedUserId] = useState<number | null>(currentUserId);
  const [isEditMode, setIsEditMode] = useState(false);

  const meQuery = useMeQuery(Boolean(currentUserId));
  const updateMeMutation = useUpdateMeMutation();
  const loansQuery = useLoansQuery(isAdmin ? selectedUserId : null);
  const returnMutation = useReturnBookWithFeedbackMutation();

  const [ratingLoanId, setRatingLoanId] = useState<number | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingReview, setRatingReview] = useState('');

  const defaultAvatar = avatarOptions[0].url;
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: '',
      avatarUrl: '',
      email: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      country: '',
      city: '',
      postalCode: '',
      street: '',
      houseNumber: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    if (!meQuery.data) return;
    const avatarUrl = meQuery.data.avatarUrl || defaultAvatar;
    setSelectedAvatar(avatarUrl);
    reset({
      nickname: meQuery.data.nickname ?? '',
      avatarUrl,
      email: meQuery.data.email ?? '',
      firstName: meQuery.data.firstName ?? '',
      lastName: meQuery.data.lastName ?? '',
      birthDate: meQuery.data.birthDate ?? '',
      country: meQuery.data.country ?? '',
      city: meQuery.data.city ?? '',
      postalCode: meQuery.data.postalCode ?? '',
      street: meQuery.data.street ?? '',
      houseNumber: meQuery.data.houseNumber ?? '',
      phoneNumber: meQuery.data.phoneNumber ?? '',
    });
  }, [defaultAvatar, meQuery.data, reset]);

  const onSubmit = (values: ProfileFormValues) => {
    updateMeMutation.mutate(
      {
        ...values,
        avatarUrl: selectedAvatar,
      },
      {
        onSuccess: () => setIsEditMode(false),
      },
    );
  };

  const submitReturnWithFeedback = (loanId: number, bookId: number) => {
    if (!currentUserId) return;
    returnMutation.mutate(
      {
        loanId,
        bookId,
        userId: currentUserId,
        score: ratingScore,
        reviewText: ratingReview,
      },
      {
        onSuccess: () => {
          setRatingLoanId(null);
          setRatingScore(5);
          setRatingReview('');
        },
      },
    );
  };

  const currentAvatarLabel = useMemo(
    () => avatarOptions.find((option) => option.url === selectedAvatar)?.label ?? 'Custom avatar',
    [selectedAvatar],
  );

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Profile & Loan History</h2>
        <button
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
          onClick={() => setIsEditMode((prev) => !prev)}
          type="button"
        >
          ✏️ {isEditMode ? 'Cancel edit' : 'Edit'}
        </button>
      </div>

      {meQuery.error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{extractApiError(meQuery.error, 'Не удалось загрузить профиль.')}</p>}
      {updateMeMutation.error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{extractApiError(updateMeMutation.error, 'Не удалось сохранить профиль.')}</p>}
      {updateMeMutation.isSuccess && <p className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Профиль успешно обновлён.</p>}

      <div className="mb-4 rounded-xl border border-slate-200 p-4">
        <div className="mb-2 flex items-center gap-3">
          <img src={selectedAvatar} alt="selected avatar" className="h-14 w-14 rounded-full bg-slate-100 p-2" />
          <div>
            <p className="text-sm font-medium text-slate-700">Selected avatar</p>
            <p className="text-sm text-slate-500">{currentAvatarLabel}</p>
          </div>
        </div>

        {isEditMode && (
          <label className="grid gap-1 text-sm font-medium">
            Choose avatar icon
            <select
              className="rounded-md border border-slate-300 bg-slate-900 px-3 py-2 text-white"
              value={selectedAvatar}
              onChange={(event) => setSelectedAvatar(event.target.value)}
            >
              {avatarOptions.map((option) => (
                <option key={option.url} value={option.url}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <form className="mb-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <label className="grid gap-1 text-sm font-medium">
          Nickname
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} {...register('nickname')} />
          {errors.nickname && <span className="text-sm text-red-700">{errors.nickname.message}</span>}
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Email
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} {...register('email')} />
          {errors.email && <span className="text-sm text-red-700">{errors.email.message}</span>}
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Имя
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} {...register('firstName')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Фамилия
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} {...register('lastName')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Дата рождения
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} type="date" {...register('birthDate')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Страна проживания
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} {...register('country')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Город
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} {...register('city')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Почтовый индекс
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} {...register('postalCode')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Улица
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} {...register('street')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Номер дома
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} {...register('houseNumber')} />
        </label>

        <label className="grid gap-1 text-sm font-medium md:col-span-2">
          Контактный телефон
          <input className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={!isEditMode} {...register('phoneNumber')} />
          {errors.phoneNumber && <span className="text-sm text-red-700">{errors.phoneNumber.message}</span>}
        </label>

        {isEditMode && (
          <button className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-white" type="submit">
            Save profile
          </button>
        )}
      </form>

      {isAdmin && (
        <div className="mb-4 max-w-xs">
          <label className="grid gap-1 text-sm font-medium">
            User ID (admin only)
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              type="number"
              value={selectedUserId ?? ''}
              onChange={(event) => setSelectedUserId(Number(event.target.value) || null)}
            />
          </label>
        </div>
      )}

      {loansQuery.isLoading && <p className="text-sm text-slate-600">Loading loans...</p>}
      {loansQuery.error && <p className="text-sm text-red-700">{extractApiError(loansQuery.error, 'Ошибка загрузки займов.')}</p>}
      {returnMutation.error && <p className="text-sm text-red-700">{extractApiError(returnMutation.error, 'Не удалось вернуть книгу и сохранить отзыв.')}</p>}
      {returnMutation.isSuccess && <p className="text-sm text-green-700">Книга возвращена, оценка сохранена.</p>}

      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="p-2">Loan ID</th>
              <th className="p-2">Book ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Borrowed</th>
              <th className="p-2">Due</th>
              <th className="p-2">Returned</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loansQuery.data?.map((loan) => (
              <tr className="border-b border-slate-100" key={loan.id}>
                <td className="p-2">{loan.id}</td>
                <td className="p-2">{loan.bookId}</td>
                <td className="p-2">{loan.status}</td>
                <td className="p-2">{loan.borrowedAt}</td>
                <td className="p-2">{loan.dueDate}</td>
                <td className="p-2">{loan.returnedAt || '—'}</td>
                <td className="p-2">
                  {loan.status === 'ACTIVE' && (
                    <button
                      className="rounded-md bg-slate-900 px-3 py-1 text-xs text-white"
                      onClick={() => setRatingLoanId(loan.id)}
                      type="button"
                    >
                      Return & rate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ratingLoanId && (
        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <h3 className="mb-2 text-sm font-semibold">Оцените книгу при возврате</h3>
          <label className="mb-2 block text-sm">
            Оценка
            <select className="ml-2 rounded-md border border-slate-300 px-2 py-1" value={ratingScore} onChange={(e) => setRatingScore(Number(e.target.value))}>
              <option value={5}>★★★★★ (5)</option>
              <option value={4}>★★★★☆ (4)</option>
              <option value={3}>★★★☆☆ (3)</option>
              <option value={2}>★★☆☆☆ (2)</option>
              <option value={1}>★☆☆☆☆ (1)</option>
            </select>
          </label>
          <label className="mb-3 block text-sm">
            Отзыв (необязательно)
            <textarea className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" rows={3} value={ratingReview} onChange={(e) => setRatingReview(e.target.value)} />
          </label>
          <div className="flex gap-2">
            <button
              className="rounded-md bg-indigo-600 px-3 py-2 text-xs text-white"
              type="button"
              onClick={() => {
                const loan = loansQuery.data?.find((item) => item.id === ratingLoanId);
                if (!loan) return;
                submitReturnWithFeedback(loan.id, loan.bookId);
              }}
            >
              Confirm return
            </button>
            <button className="rounded-md border border-slate-300 px-3 py-2 text-xs" type="button" onClick={() => setRatingLoanId(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
