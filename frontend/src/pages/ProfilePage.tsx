import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { parseJwt } from '../lib/auth';
import { profileSchema, type ProfileFormValues } from '../lib/schemas';
import { useLoansQuery, useMeQuery, useUpdateMeMutation } from '../features/preferences/hooks';
import { useReturnBookMutation } from '../features/catalog/hooks';

const avatarUrls = [
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9d9.svg',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9d1-200d-1f4bb.svg',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f468-200d-1f393.svg',
];

export function ProfilePage() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const payload = parseJwt(accessToken);
  const currentUserId = payload?.uid ?? null;
  const roles = payload?.roles ?? [];
  const isAdmin = roles.includes('ROLE_ADMIN');

  const [selectedUserId, setSelectedUserId] = useState<number | null>(currentUserId);

  const meQuery = useMeQuery(Boolean(currentUserId));
  const updateMeMutation = useUpdateMeMutation();
  const loansQuery = useLoansQuery(selectedUserId);
  const returnMutation = useReturnBookMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: meQuery.data?.fullName ?? '',
      email: meQuery.data?.email ?? '',
      firstName: meQuery.data?.firstName ?? '',
      lastName: meQuery.data?.lastName ?? '',
      birthDate: meQuery.data?.birthDate ?? '',
      country: meQuery.data?.country ?? '',
      city: meQuery.data?.city ?? '',
      postalCode: meQuery.data?.postalCode ?? '',
      street: meQuery.data?.street ?? '',
      houseNumber: meQuery.data?.houseNumber ?? '',
      phoneNumber: meQuery.data?.phoneNumber ?? '',
    },
  });

  const onSubmit = (values: ProfileFormValues) => updateMeMutation.mutate(values);

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Profile & Loan History</h2>

      <div className="mb-4 flex gap-3">
        {avatarUrls.map((url) => (
          <img key={url} src={url} alt="cartoon avatar" className="h-12 w-12 rounded-full bg-slate-100 p-2" />
        ))}
      </div>

      <form className="mb-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <label className="grid gap-1 text-sm font-medium">
          Full name
          <input className="rounded-md border border-slate-300 px-3 py-2" {...register('fullName')} />
          {errors.fullName && <span className="text-sm text-red-700">{errors.fullName.message}</span>}
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Email
          <input className="rounded-md border border-slate-300 px-3 py-2" {...register('email')} />
          {errors.email && <span className="text-sm text-red-700">{errors.email.message}</span>}
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Имя
          <input className="rounded-md border border-slate-300 px-3 py-2" {...register('firstName')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Фамилия
          <input className="rounded-md border border-slate-300 px-3 py-2" {...register('lastName')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Дата рождения
          <input className="rounded-md border border-slate-300 px-3 py-2" type="date" {...register('birthDate')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Страна проживания
          <input className="rounded-md border border-slate-300 px-3 py-2" {...register('country')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Город
          <input className="rounded-md border border-slate-300 px-3 py-2" {...register('city')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Почтовый индекс
          <input className="rounded-md border border-slate-300 px-3 py-2" {...register('postalCode')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Улица
          <input className="rounded-md border border-slate-300 px-3 py-2" {...register('street')} />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Номер дома
          <input className="rounded-md border border-slate-300 px-3 py-2" {...register('houseNumber')} />
        </label>

        <label className="grid gap-1 text-sm font-medium md:col-span-2">
          Контактный телефон
          <input className="rounded-md border border-slate-300 px-3 py-2" {...register('phoneNumber')} />
          {errors.phoneNumber && <span className="text-sm text-red-700">{errors.phoneNumber.message}</span>}
        </label>

        <button className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-white" type="submit">
          Save profile
        </button>
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
      {loansQuery.error && <p className="text-sm text-red-700">Ошибка загрузки займов.</p>}

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
                      onClick={() => returnMutation.mutate(loan.id)}
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
