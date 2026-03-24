import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import api from '../lib/api';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();

  const handleLogin = async (data: any) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const response = await api.post('/auth/signin', data);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#0f172a] selection:bg-blue-500/30">
      <AuthForm 
        type="login" 
        onSubmit={handleLogin} 
        isLoading={isLoading} 
        error={error} 
      />
      <div className="mt-8 text-slate-400">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
