import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { CatalogPage } from './pages/CatalogPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { parseJwt } from './lib/auth';
import { logout } from './features/auth/authSlice';

const navBase = 'rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200';
const navActive = 'bg-indigo-600 text-white hover:bg-indigo-600';

export function App() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const payload = parseJwt(accessToken);
  const roles = payload?.roles ?? [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isLibrarian = roles.includes('ROLE_LIBRARIAN');

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Library Preferences System</h1>
        <nav className="flex flex-wrap items-center gap-2">
          <NavLink className={({ isActive }) => `${navBase} ${isActive ? navActive : ''}`} to="/catalog">
            Catalog
          </NavLink>
          {accessToken && (
            <>
              <NavLink className={({ isActive }) => `${navBase} ${isActive ? navActive : ''}`} to="/recommendations">
                Recommendations
              </NavLink>
              <NavLink className={({ isActive }) => `${navBase} ${isActive ? navActive : ''}`} to="/profile">
                Profile
              </NavLink>
            </>
          )}
          <span className="ml-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {accessToken ? (isAdmin ? 'ADMIN' : isLibrarian ? 'LIBRARIAN' : 'USER') : 'GUEST'}
          </span>
          {accessToken ? (
            <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => dispatch(logout())}>
              Logout
            </button>
          ) : (
            <NavLink className={({ isActive }) => `${navBase} ${isActive ? navActive : ''}`} to="/login">
              Войти
            </NavLink>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/recommendations" element={accessToken ? <RecommendationsPage /> : <Navigate replace to="/login" />} />
          <Route path="/profile" element={accessToken ? <ProfilePage /> : <Navigate replace to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}
