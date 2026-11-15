import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Icon } from '../components/icons.jsx';

const DEMO_ACCOUNTS = [
  { role: 'Quản trị viên', username: 'admin', password: 'Admin@123' },
  { role: 'Quản lý KTX', username: 'quanly', password: 'QuanLy@123' },
  { role: 'Sinh viên', username: 'sv01', password: 'SinhVien@123' },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-logo"><Icon name="home" size={24} /></div>
          <div>
            <h1>QLKTX</h1>
            <p>Hệ thống Quản lý Ký túc xá · Nhóm 10 · IT3180</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Tên đăng nhập</span>
            <input
              className="input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin / quanly / sv01"
              autoComplete="username"
              autoFocus
            />
          </label>

          <label className="field">
            <span className="field-label">Mật khẩu</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error ? (
            <div className="alert alert-error">
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="demo-accounts">
          <h4>Tài khoản demo</h4>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.username}
              type="button"
              className="demo-account"
              onClick={() => fillDemo(account)}
            >
              <strong>{account.role}</strong>
              <span>
                {account.username} / {account.password}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
