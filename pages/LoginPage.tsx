
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { APP_NAME, APP_ROUTES } from '../constants';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Password not used by mockLogin but good for UI
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username) {
        setError('Username is required.');
        return;
    }
    try {
      await login(username, password);
      navigate(APP_ROUTES.DASHBOARD);
    } catch (err) {
      setError('Login failed. Please check your username or role selection.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-base-100)] p-4">
      <Card title={`Login to ${APP_NAME}`} className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username (Type 'admin', 'hr', 'manager', or 'employee')"
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={loading}
          />
          <Input
            label="Password (mock)"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter any password"
            disabled={loading}
          />
          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
          <Button type="submit" variant="primary" isLoading={loading} fullWidth>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="mt-4 text-xs text-center text-[var(--color-base-content)] opacity-70">
          This is a mock login. Enter a username to simulate a role.
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
