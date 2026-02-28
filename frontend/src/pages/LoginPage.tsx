import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/libraryApi';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setTokens } from '../features/auth/authSlice';
import { authSchema, type AuthFormValues } from '../lib/schemas';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: 'anna.reader@library.local',
      password: 'secret123',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: AuthFormValues) => login(payload.email, payload.password),
    onSuccess: (data) => {
      dispatch(setTokens(data));
      navigate('/catalog', { replace: true });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: AuthFormValues) => register(payload.email, payload.password),
    onSuccess: (data) => {
      dispatch(setTokens(data));
      navigate('/catalog', { replace: true });
    },
  });

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Authentication</h2>
      <form className="grid gap-3">
        <label className="grid gap-1 text-sm font-medium">
          Email
          <input className="rounded-md border border-slate-300 px-3 py-2" type="email" {...registerField('email')} />
          {errors.email && <span className="text-sm text-red-700">{errors.email.message}</span>}
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Password
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            type="password"
            {...registerField('password')}
          />
          {errors.password && <span className="text-sm text-red-700">{errors.password.message}</span>}
        </label>

        <div className="mt-2 flex gap-2">
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
            disabled={loginMutation.isPending}
            onClick={handleSubmit((values) => loginMutation.mutate(values))}
            type="button"
          >
            Login
          </button>

          <button
            className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={registerMutation.isPending}
            onClick={handleSubmit((values) => registerMutation.mutate(values))}
            type="button"
          >
            Register
          </button>
        </div>
      </form>

      {accessToken && <p className="mt-3 text-sm text-green-700">Успешная авторизация.</p>}
      {loginMutation.error && <p className="mt-2 text-sm text-red-700">Ошибка входа.</p>}
      {registerMutation.error && <p className="mt-2 text-sm text-red-700">Ошибка регистрации.</p>}
    </section>
  );
}
