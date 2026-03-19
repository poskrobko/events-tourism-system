import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { Pagination } from '../components/Pagination';
import {
  useDeleteAdminBookMutation,
  useDeleteAdminUserMutation,
  useAdminBooksQuery,
  useAdminLoansQuery,
  useAdminUsersQuery,
  useInviteLibrarianMutation,
  useIssueLibrarianReservationMutation,
  useLibrarianReservationsQuery,
  useReturnLibrarianReservationMutation,
  useUpdateAdminUserMutation,
} from '../features/admin/hooks';
import { parseJwt } from '../lib/auth';
import { useAppSelector } from '../app/hooks';
import { extractApiError } from '../lib/apiErrors';
import { useCancelReservationMutation } from '../features/preferences/hooks';

export function ManagementPage() {
  const navigate = useNavigate();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const payload = parseJwt(accessToken);
  const roles = payload?.roles ?? [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isLibrarian = roles.includes('ROLE_LIBRARIAN');

  const [tab, setTab] = useState<'users' | 'books' | 'orders'>(isAdmin ? 'users' : 'orders');
  const [screenMessage, setScreenMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [userPage, setUserPage] = useState(0);
  const [userSize] = useState(20);
  const [userQuery, setUserQuery] = useState('');
  const [userRole, setUserRole] = useState('');

  const [bookPage, setBookPage] = useState(0);
  const [bookSize] = useState(20);
  const [bookQuery, setBookQuery] = useState('');

  const [orderPage, setOrderPage] = useState(0);
  const [orderSize] = useState(20);
  const [orderUserQuery, setOrderUserQuery] = useState('');
  const [orderBookQuery, setOrderBookQuery] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  const [confirmUserId, setConfirmUserId] = useState<number | null>(null);
  const [confirmBookId, setConfirmBookId] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNickname, setInviteNickname] = useState('');

  const usersQuery = useAdminUsersQuery({ page: userPage, size: userSize, query: userQuery || undefined, role: userRole || undefined }, isAdmin);
  const booksQuery = useAdminBooksQuery({ page: bookPage, size: bookSize, query: bookQuery || undefined, availability: 'all' }, isAdmin);
  const adminLoansQuery = useAdminLoansQuery(
    { page: orderPage, size: orderSize, userQuery: orderUserQuery || undefined, bookQuery: orderBookQuery || undefined, status: orderStatus || undefined },
    isAdmin,
  );
  const librarianOrdersQuery = useLibrarianReservationsQuery(
    { page: orderPage, size: orderSize, userQuery: orderUserQuery || undefined, bookQuery: orderBookQuery || undefined, status: orderStatus || undefined },
    isLibrarian && !isAdmin,
  );
  const ordersQuery = useMemo(() => (isAdmin ? adminLoansQuery : librarianOrdersQuery), [adminLoansQuery, isAdmin, librarianOrdersQuery]);

  const updateUserMutation = useUpdateAdminUserMutation();
  const deleteUserMutation = useDeleteAdminUserMutation();
  const deleteBookMutation = useDeleteAdminBookMutation();
  const inviteMutation = useInviteLibrarianMutation();
  const issueReservationMutation = useIssueLibrarianReservationMutation();
  const returnReservationMutation = useReturnLibrarianReservationMutation();
  const cancelReservationMutation = useCancelReservationMutation();

  const applyUserRole = (id: number, role: string, email: string) => {
    setScreenMessage(null);
    updateUserMutation.mutate(
      { id, payload: { email, roles: [role] } },
      {
        onSuccess: () => setScreenMessage({ type: 'success', text: 'Роль пользователя обновлена.' }),
        onError: (error) => setScreenMessage({ type: 'error', text: extractApiError(error, 'Не удалось обновить роль пользователя.') }),
      },
    );
  };

  const editUser = (id: number, email: string, nickname: string | null) => {
    const nextEmail = window.prompt('User email', email)?.trim();
    if (!nextEmail) return;
    const nextNickname = window.prompt('User nickname', nickname || '')?.trim();
    updateUserMutation.mutate(
      { id, payload: { email: nextEmail, nickname: nextNickname || undefined } },
      {
        onSuccess: () => setScreenMessage({ type: 'success', text: 'Пользователь обновлён.' }),
        onError: (error) => setScreenMessage({ type: 'error', text: extractApiError(error, 'Не удалось обновить пользователя.') }),
      },
    );
  };

  const submitInvite = (event: FormEvent) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate(
      { email: inviteEmail.trim(), nickname: inviteNickname.trim() || undefined },
      {
        onSuccess: () => {
          setInviteEmail('');
          setInviteNickname('');
          setScreenMessage({ type: 'success', text: 'Приглашение библиотекаря отправлено.' });
        },
        onError: (error) => setScreenMessage({ type: 'error', text: extractApiError(error, 'Не удалось пригласить библиотекаря.') }),
      },
    );
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Management</h2>

      {screenMessage && (
        <p className={`mb-4 rounded-md px-3 py-2 text-sm ${screenMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {screenMessage.text}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {isAdmin && (
          <>
            <button className={`rounded-md px-3 py-2 text-sm ${tab === 'users' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`} onClick={() => setTab('users')} type="button">Users</button>
            <button className={`rounded-md px-3 py-2 text-sm ${tab === 'books' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`} onClick={() => setTab('books')} type="button">Books</button>
          </>
        )}
        <button className={`rounded-md px-3 py-2 text-sm ${tab === 'orders' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`} onClick={() => setTab('orders')} type="button">Orders</button>
      </div>

      {isAdmin && (
        <form className="mb-4 rounded-lg border border-slate-200 p-3" onSubmit={submitInvite}>
          <p className="mb-2 text-sm font-semibold">Invite librarian</p>
          <div className="flex flex-wrap gap-2">
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Nickname (optional)" value={inviteNickname} onChange={(e) => setInviteNickname(e.target.value)} />
            <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white" type="submit">Send invite</button>
          </div>
          {inviteMutation.data && (
            <p className="mt-2 text-xs text-emerald-700">Temporary password for {inviteMutation.data.email}: <span className="font-semibold">{inviteMutation.data.temporaryPassword}</span></p>
          )}
        </form>
      )}

      {tab === 'users' && isAdmin && (
        <div>
          <div className="mb-3 flex gap-2">
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Search email/nickname" value={userQuery} onChange={(e) => { setUserQuery(e.target.value); setUserPage(0); }} />
            <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={userRole} onChange={(e) => { setUserRole(e.target.value); setUserPage(0); }}>
              <option value="">All roles</option>
              <option value="ROLE_USER">ROLE_USER</option>
              <option value="ROLE_LIBRARIAN">ROLE_LIBRARIAN</option>
              <option value="ROLE_ADMIN">ROLE_ADMIN</option>
            </select>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead><tr className="border-b border-slate-200"><th className="p-2 text-left">ID</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Nickname</th><th className="p-2 text-left">Role</th><th className="p-2 text-left">Actions</th></tr></thead>
              <tbody>
                {usersQuery.data?.content.map((user) => (
                  <tr className="border-b border-slate-100" key={user.id}>
                    <td className="p-2">{user.id}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.nickname || '—'}</td>
                    <td className="p-2">
                      <select className="rounded-md border border-slate-300 px-2 py-1 text-xs" value={user.roles[0] ?? 'ROLE_USER'} onChange={(e) => applyUserRole(user.id, e.target.value, user.email)}>
                        <option value="ROLE_USER">ROLE_USER</option>
                        <option value="ROLE_LIBRARIAN">ROLE_LIBRARIAN</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1"><button className="rounded-md border border-slate-300 px-2 py-1 text-xs" onClick={() => editUser(user.id, user.email, user.nickname)} type="button">Edit</button><button className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => setConfirmUserId(user.id)} type="button">Delete</button></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={usersQuery.data?.number ?? userPage} totalPages={usersQuery.data?.totalPages ?? 0} onPageChange={setUserPage} />
        </div>
      )}

      {tab === 'books' && isAdmin && (
        <div>
          <div className="mb-3 flex gap-2">
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Search books" value={bookQuery} onChange={(e) => { setBookQuery(e.target.value); setBookPage(0); }} />
          </div>
          <div className="overflow-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead><tr className="border-b border-slate-200"><th className="p-2 text-left">ID</th><th className="p-2 text-left">Title</th><th className="p-2 text-left">Author</th><th className="p-2 text-left">Available</th><th className="p-2 text-left">Actions</th></tr></thead>
              <tbody>
                {booksQuery.data?.content.map((book) => (
                  <tr className="border-b border-slate-100" key={book.id}>
                    <td className="p-2">{book.id}</td>
                    <td className="p-2">{book.title}</td>
                    <td className="p-2">{book.author}</td>
                    <td className="p-2">{book.availableCopies}/{book.totalCopies}</td>
                    <td className="p-2">
                      <div className="flex gap-1"><button className="rounded-md border border-slate-300 px-2 py-1 text-xs" onClick={() => navigate(`/books/${book.id}?edit=1`)} type="button">Edit</button><button className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => setConfirmBookId(book.id)} type="button">Delete</button></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={booksQuery.data?.number ?? bookPage} totalPages={booksQuery.data?.totalPages ?? 0} onPageChange={setBookPage} />
        </div>
      )}

      {tab === 'orders' && (
        <div>
          <p className="mb-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
            WAITING = пользователь ждёт свободный экземпляр; NOTIFIED = экземпляр появился; FULFILLED = заказ завершён; CANCELLED = заказ был отменён пользователем или сотрудником библиотеки.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="User email" value={orderUserQuery} onChange={(e) => { setOrderUserQuery(e.target.value); setOrderPage(0); }} />
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Book title" value={orderBookQuery} onChange={(e) => { setOrderBookQuery(e.target.value); setOrderPage(0); }} />
            <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={orderStatus} onChange={(e) => { setOrderStatus(e.target.value); setOrderPage(0); }}>
              <option value="">All statuses</option>
              {isAdmin ? (
              <>
                <option value="ISSUED">ISSUED</option>
                <option value="RETURNED">RETURNED</option>
                <option value="OVERDUE">OVERDUE</option>
              </>
            ) : (
              <>
                <option value="WAITING">WAITING</option>
                <option value="NOTIFIED">NOTIFIED</option>
                <option value="FULFILLED">FULFILLED</option>
                <option value="CANCELLED">CANCELLED</option>
              </>
            )}
            </select>
            <button
              className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void ordersQuery.refetch()}
              type="button"
              disabled={ordersQuery.isFetching}
            >
              {ordersQuery.isFetching ? 'Обновление…' : 'Обновить'}
            </button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Book</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Created</th>
                  <th className="p-2 text-left">Issued</th>
                  <th className="p-2 text-left">Returned</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersQuery.data?.content.map((entry) => {
                  if (isAdmin) {
                    return (
                      <tr className="border-b border-slate-100" key={entry.id}>
                        <td className="p-2">{entry.id}</td>
                        <td className="p-2">{entry.userEmail}</td>
                        <td className="p-2">{entry.bookTitle}</td>
                        <td className="p-2">{entry.status}</td>
                        <td className="p-2">{entry.borrowedAt}</td>
                        <td className="p-2">{entry.borrowedAt}</td>
                        <td className="p-2">{entry.returnedAt || '—'}</td>
                        <td className="p-2 text-slate-500">—</td>
                      </tr>
                    );
                  }

                  const reservation = entry as import('../types/api').LibrarianReservation;
                  const canIssue = ['WAITING', 'NOTIFIED'].includes(reservation.status) && !reservation.loanId;
                  const canReturn = ['ISSUED', 'OVERDUE'].includes(reservation.loanStatus ?? '');
                  const canCancel = ['WAITING', 'NOTIFIED'].includes(reservation.status);
                  return (
                    <tr className="border-b border-slate-100" key={reservation.id}>
                      <td className="p-2">{reservation.id}</td>
                      <td className="p-2">{reservation.userEmail}</td>
                      <td className="p-2">{reservation.bookTitle}</td>
                      <td className="p-2">{`${reservation.status}${reservation.loanStatus ? ` / ${reservation.loanStatus}` : ''}`}</td>
                      <td className="p-2">{reservation.createdAt}</td>
                      <td className="p-2">{reservation.borrowedAt || '—'}</td>
                      <td className="p-2">{reservation.returnedAt || '—'}</td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                            disabled={!canIssue || issueReservationMutation.isPending}
                            onClick={() => issueReservationMutation.mutate(reservation.id, {
                              onSuccess: () => setScreenMessage({ type: 'success', text: 'Книга отмечена как выданная.' }),
                              onError: (error) => setScreenMessage({ type: 'error', text: extractApiError(error, 'Не удалось выдать книгу по заказу.') }),
                            })}
                            type="button"
                          >
                            Отметить как выдано
                          </button>
                          <button
                            className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                            disabled={!canReturn || returnReservationMutation.isPending}
                            onClick={() => returnReservationMutation.mutate(reservation.id, {
                              onSuccess: () => setScreenMessage({ type: 'success', text: 'Книга отмечена как возвращённая.' }),
                              onError: (error) => setScreenMessage({ type: 'error', text: extractApiError(error, 'Не удалось отметить возврат.') }),
                            })}
                            type="button"
                          >
                            Отметить как возвращено
                          </button>
                          <button
                            className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-700 disabled:opacity-50"
                            disabled={!canCancel || cancelReservationMutation.isPending}
                            onClick={() => cancelReservationMutation.mutate({ reservationId: reservation.id, userId: reservation.userId }, {
                              onSuccess: () => setScreenMessage({ type: 'success', text: 'Заказ отменён. Пользователь увидит статус CANCELLED.' }),
                              onError: (error) => setScreenMessage({ type: 'error', text: extractApiError(error, 'Не удалось отменить заказ.') }),
                            })}
                            type="button"
                          >
                            Отказать в выдаче
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={ordersQuery.data?.number ?? orderPage} totalPages={ordersQuery.data?.totalPages ?? 0} onPageChange={setOrderPage} />
        </div>
      )}

      <ConfirmModal
        open={confirmUserId !== null}
        title="Delete user"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmUserId(null)}
        onConfirm={() => {
          if (confirmUserId == null) return;
          deleteUserMutation.mutate(confirmUserId, {
            onSuccess: () => {
              setConfirmUserId(null);
              setScreenMessage({ type: 'success', text: 'Пользователь удалён.' });
            },
            onError: (error) => setScreenMessage({ type: 'error', text: extractApiError(error, 'Не удалось удалить пользователя.') }),
          });
        }}
      />

      <ConfirmModal
        open={confirmBookId !== null}
        title="Delete book"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmBookId(null)}
        onConfirm={() => {
          if (confirmBookId == null) return;
          deleteBookMutation.mutate(confirmBookId, {
            onSuccess: () => {
              setConfirmBookId(null);
              setScreenMessage({ type: 'success', text: 'Книга удалена.' });
            },
            onError: (error) => setScreenMessage({ type: 'error', text: extractApiError(error, 'Не удалось удалить книгу.') }),
          });
        }}
      />
    </section>
  );
}
