import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthForm, signup } from '../features/auth';

const SignupPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();

  const handleSignup = async (data: any) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const result: any = await signup(data);
      localStorage.setItem('token', result.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#0f172a] selection:bg-blue-500/30">
      <AuthForm 
        type="signup" 
        onSubmit={handleSignup} 
        isLoading={isLoading} 
        error={error} 
      />
      <div className="mt-8 text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
