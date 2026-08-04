import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Layout from './pages/admin/Layout';
import AddBlog from './pages/admin/AddBlog';
import Auth from './pages/Auth';
import MyStories from './pages/admin/MyStories';
import 'quill/dist/quill.snow.css';
import { Toaster } from 'react-hot-toast';
import { useAppContext } from './context/AppContext';
import Loader from './components/Loader';

// PrivateRoute component: protects specific routes
const PrivateRoute = ({ children }) => {
  const { token, authReady } = useAppContext();
  if (!authReady) return <Loader />;
  return token ? children : <Navigate to="/auth?mode=login" replace />;
};

const OwnerRoute = ({ children }) => {
  const { token, authReady, canWrite } = useAppContext();
  if (!authReady) return <Loader />;
  if (!token) return <Navigate to="/auth?mode=login" replace />;
  return canWrite ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <div>
      <Toaster />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/auth" element={<Auth />} />

        <Route path="/admin/login" element={<Navigate to="/auth?mode=login" replace />} />

        <Route path="/admin" element={<Layout />}>
          <Route path="addBlog" element={<OwnerRoute><AddBlog /></OwnerRoute>} />
          <Route index element={<Navigate to="/" replace />} />
          <Route path="stories" element={<OwnerRoute><MyStories /></OwnerRoute>} />
          <Route path="listBlog" element={<OwnerRoute><MyStories /></OwnerRoute>} />
          <Route path="comments" element={<OwnerRoute><Navigate to="/admin/addBlog" replace /></OwnerRoute>} />
        </Route>

        <Route path="/admin/*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
