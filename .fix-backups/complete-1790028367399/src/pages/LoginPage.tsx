import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/lib/auth';

export function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      nav('/dashboard');
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <form onSubmit={onSubmit}>
          <div className="login-field">
            <label className="login-label">البريد الإلكتروني</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@resala-stem.org"
              autoComplete="email"
              required
              dir="ltr"
            />
          </div>

          <div className="login-field">
            <label className="login-label">كلمة المرور</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="........"
              autoComplete="current-password"
              required
              dir="ltr"
            />
          </div>

          {error ? <div className="login-error">{error}</div> : null}

          <button
            type="submit"
            className="login-submit"
            disabled={busy || !email || !password}
          >
            {busy ? '...' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="login-back">
          <Link to="/">العودة للرئيسية</Link>
        </p>
      </div>
    </div>
  );
}

function translateError(err: unknown): string {
  const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
  if (msg.includes('invalid-credential'))
    return 'البريد أو كلمة المرور غير صحيحة';
  if (msg.includes('user-not-found')) return 'لا يوجد حساب بهذا البريد';
  if (msg.includes('wrong-password')) return 'كلمة المرور غير صحيحة';
  if (msg.includes('invalid-email')) return 'البريد الإلكتروني غير صالح';
  if (msg.includes('network-request-failed')) return 'تعذر الاتصال بالشبكة';
  if (msg.includes('too-many-requests')) return 'حاول مجددًا بعد قليل';
  return msg;
}
