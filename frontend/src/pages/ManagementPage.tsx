import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { Pagination } from '../components/Pagination';
import { useDeleteAdminBookMutation, useDeleteAdminUserMutation, useAdminBooksQuery, useAdminLoansQuery, useAdminUsersQuery, useInviteLibrarianMutation, useLibrarianLoansQuery, useUpdateAdminUserMutation } from '../features/admin/hooks';
import { parseJwt } from '../lib/auth';
import { useAppSelector } from '../app/hooks';

export function ManagementPage() {
  const navigate = useNavigate();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const payload = parseJwt(accessToken);
  const roles = payload?.roles ?? [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isLibrarian = roles.includes('ROLE_LIBRARIAN');

  const [tab, setTab] = useState<'users' | 'books' | 'loans'>(isAdmin ? 'users' : 'loans');

  const [userPage, setUserPage] = useState(0);
  const [userSize] = useState(20);
  const [userQuery, setUserQuery] = useState('');
  const [userRole, setUserRole] = useState('');

  const [bookPage, setBookPage] = useState(0);
  const [bookSize] = useState(20);
  const [bookQuery, setBookQuery] = useState('');

  const [loanPage, setLoanPage] = useState(0);
  const [loanSize] = useState(20);
  const [loanUserQuery, setLoanUserQuery] = useState('');
  const [loanBookQuery, setLoanBookQuery] = useState('');
  const [loanStatus, setLoanStatus] = useState('');

  const [confirmUserId, setConfirmUserId] = useState<number | null>(null);
  const [confirmBookId, setConfirmBookId] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNickname, setInviteNickname] = useState('');

  const usersQuery = useAdminUsersQuery({ page: userPage, size: userSize, query: userQuery || undefined, role: userRole || undefined }, isAdmin);
  const booksQuery = useAdminBooksQuery({ page: bookPage, size: bookSize, query: bookQuery || undefined, availability: 'all' }, isAdmin);
  const adminLoansQuery = useAdminLoansQuery(
    { page: loanPage, size: loanSize, userQuery: loanUserQuery || undefined, bookQuery: loanBookQuery || undefined, status: loanStatus || undefined },
    isAdmin,
  );
  const librarianLoansQuery = useLibrarianLoansQuery(
    { page: loanPage, size: loanSize, userQuery: loanUserQuery || undefined, bookQuery: loanBookQuery || undefined, status: loanStatus || undefined },
    isLibrarian && !isAdmin,
  );

  const loansQuery = useMemo(() => (isAdmin ? adminLoansQuery : librarianLoansQuery), [adminLoansQuery, librarianLoansQuery, isAdmin]);

  const updateUserMutation = useUpdateAdminUserMutation();
  const deleteUserMutation = useDeleteAdminUserMutation();
  const deleteBookMutation = useDeleteAdminBookMutation();
  const inviteMutation = useInviteLibrarianMutation();

  const applyUserRole = (id: number, role: string) => {
    updateUserMutation.mutate({ id, payload: { roles: [role] } });
  };

  const editUser = (id: number, email: string, nickname: string | null) => {
    const nextEmail = window.prompt('User email', email)?.trim();
    if (!nextEmail) return;
    const nextNickname = window.prompt('User nickname', nickname || '')?.trim();
    updateUserMutation.mutate({ id, payload: { email: nextEmail, nickname: nextNickname || undefined } });
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
        },
      },
    );
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Management</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        {isAdmin && (
          <>
            <button className={`rounded-md px-3 py-2 text-sm ${tab === 'users' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`} onClick={() => setTab('users')} type="button">Users</button>
            <button className={`rounded-md px-3 py-2 text-sm ${tab === 'books' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`} onClick={() => setTab('books')} type="button">Books</button>
          </>
        )}
        <button className={`rounded-md px-3 py-2 text-sm ${tab === 'loans' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`} onClick={() => setTab('loans')} type="button">Loans</button>
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
                      <select className="rounded-md border border-slate-300 px-2 py-1 text-xs" value={user.roles[0] ?? 'ROLE_USER'} onChange={(e) => applyUserRole(user.id, e.target.value)}>
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

      {tab === 'loans' && (
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="User email" value={loanUserQuery} onChange={(e) => { setLoanUserQuery(e.target.value); setLoanPage(0); }} />
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Book title" value={loanBookQuery} onChange={(e) => { setLoanBookQuery(e.target.value); setLoanPage(0); }} />
            <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={loanStatus} onChange={(e) => { setLoanStatus(e.target.value); setLoanPage(0); }}>
              <option value="">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="RETURNED">RETURNED</option>
            </select>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead><tr className="border-b border-slate-200"><th className="p-2 text-left">ID</th><th className="p-2 text-left">User</th><th className="p-2 text-left">Book</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Borrowed</th><th className="p-2 text-left">Returned</th></tr></thead>
              <tbody>
                {loansQuery.data?.content.map((loan) => (
                  <tr className="border-b border-slate-100" key={loan.id}>
                    <td className="p-2">{loan.id}</td>
                    <td className="p-2">{loan.userEmail}</td>
                    <td className="p-2">{loan.bookTitle}</td>
                    <td className="p-2">{loan.status}</td>
                    <td className="p-2">{loan.borrowedAt}</td>
                    <td className="p-2">{loan.returnedAt || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={loansQuery.data?.number ?? loanPage} totalPages={loansQuery.data?.totalPages ?? 0} onPageChange={setLoanPage} />
        </div>
      )}

      <ConfirmModal
        open={confirmUserId !== null}
        title="Delete user"
        description="This action will permanently remove the user account."
        onCancel={() => setConfirmUserId(null)}
        onConfirm={() => {
          if (confirmUserId !== null) {
            deleteUserMutation.mutate(confirmUserId, { onSuccess: () => setConfirmUserId(null) });
          }
        }}
      />

      <ConfirmModal
        open={confirmBookId !== null}
        title="Delete book"
        description="This action will permanently remove the book from catalog."
        onCancel={() => setConfirmBookId(null)}
        onConfirm={() => {
          if (confirmBookId !== null) {
            deleteBookMutation.mutate(confirmBookId, { onSuccess: () => setConfirmBookId(null) });
          }
        }}
      />
    </section>
  );
}
