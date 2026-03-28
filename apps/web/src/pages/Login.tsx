import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { signin } from '@/features/auth/api';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await signin({ email: data.email, password: data.password });
      localStorage.setItem('token', res.token);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0f172a] p-4 selection:bg-blue-500/30">
      <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} />
      <div className="mt-8 text-slate-400">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
