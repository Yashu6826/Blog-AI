import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Layout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import AddBlog from './pages/admin/AddBlog';
import ListBlog from './pages/admin/ListBlog';
import Comments from './pages/admin/Comments';
import Login from './components/admin/Login';
import 'quill/dist/quill.snow.css';
import { Toaster } from 'react-hot-toast';
import { useAppContext } from './context/AppContext';

// PrivateRoute component: protects specific routes
const PrivateRoute = ({ children }) => {
  const { token } = useAppContext();
  return token ? children : <Navigate to="/admin/login" replace />;
};

const App = () => {
  return (
    <div>
      <Toaster />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<Blog />} />

        {/* Login page */}
        <Route path="/admin/login" element={<Login />} />

        {/* All admin routes use the same Layout (with Sidebar always visible) */}
        <Route path="/admin" element={<Layout />}>
          {/* Public route - anyone can access */}
          <Route path="addBlog" element={<AddBlog />} />

          {/* Protected routes - require login */}
          <Route
            index
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="listBlog"
            element={
              <PrivateRoute>
                <ListBlog />
              </PrivateRoute>
            }
          />
          <Route
            path="comments"
            element={
              <PrivateRoute>
                <Comments />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Optional: Catch-all redirect for unknown admin routes */}
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
};

export default App;