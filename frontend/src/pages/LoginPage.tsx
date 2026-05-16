import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IMEInput } from '../components/Common/IMEInput';

export default function LoginPage() {
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError('两次密码不一致');
          return;
        }
        if (password.length < 3) {
          setError('密码至少3位');
          return;
        }
        await register(username, password);
      } else {
        await login(username, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      setError(msg || (isRegister ? '注册失败' : '用户名或密码错误'));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>简历制作</h1>
        <p className="auth-subtitle">{isRegister ? '创建新账户' : '登录你的账户'}</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <IMEInput
            type="text" placeholder="用户名"
            value={username} onChange={setUsername}
            required autoFocus
          />
          <IMEInput
            type="password" placeholder="密码"
            value={password} onChange={setPassword}
            required
          />
          {isRegister && (
            <IMEInput
              type="password" placeholder="确认密码"
              value={confirmPassword} onChange={setConfirmPassword}
              required
            />
          )}
          <button type="submit" className="btn-primary">
            {isRegister ? '注册' : '登录'}
          </button>
        </form>
        <p className="auth-link">
          {isRegister ? (
            <>已有账户？<Link to="/login">登录</Link></>
          ) : (
            <>还没有账户？<Link to="/register">注册</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
