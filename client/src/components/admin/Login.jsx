// src/components/admin/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';          // <-- add this
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { axios, setToken } = useAppContext();
  const navigate = useNavigate();                       // <-- hook for redirect

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);       // <-- loading flag

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation (optional but nice)
    if (!email || !password) {
      toast.error('Please fill in both fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/admin/login`,
        { email, password }
      );

      if (data.success) {
        // 1. Store token in context
        setToken(data.token);

        // 2. Persist in localStorage (survives refresh)
        localStorage.setItem('token', data.token);

        // 3. Attach token to every future request
        axios.defaults.headers.common['Authorization'] = data.token;

        toast.success('Login successful!');

        // 4. Redirect to the protected dashboard
        navigate('/admin', { replace: true });
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-sm p-6 max-md:m-6 border border-primary/30 shadow-xl shadow-primary/15 rounded-lg">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full py-6 text-center">
            <h1 className="text-3xl font-bold">
              <span className="text-primary">Admin</span> Login
            </h1>
            <p className="font-light">
              Enter your credentials to access the admin panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 w-full text-gray-600">
            <div className="flex flex-col">
              <label>Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                required
                placeholder="your email id"
                className="border-b-2 border-gray-300 p-2 outline-none mb-6"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col">
              <label>Password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                required
                placeholder="your password"
                className="border-b-2 border-gray-300 p-2 outline-none mb-6"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-3 font-medium text-white rounded cursor-pointer
                transition-all
                ${loading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}
              `}
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;