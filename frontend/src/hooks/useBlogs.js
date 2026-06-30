import { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export function useBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchBlogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/blogs', { params });
      setBlogs(data.blogs);
      setPagination(data.pagination);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch blogs';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBlog = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/blogs/${slug}`);
      setBlog(data.blog);
      return data.blog;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch blog';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBlog = useCallback(async (blogData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/blogs', blogData);
      toast.success('Blog created successfully!');
      return data.blog;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create blog';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlog = useCallback(async (id, blogData) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/blogs/${id}`, blogData);
      toast.success('Blog updated successfully!');
      return data.blog;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update blog';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBlog = useCallback(async (id) => {
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      toast.success('Blog deleted successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete blog';
      toast.error(msg);
      throw err;
    }
  }, []);

  const likeBlog = useCallback(async (id) => {
    try {
      const { data } = await api.post(`/blogs/${id}/like`);
      setBlogs((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, likesCount: data.likesCount, liked: data.liked } : b
        )
      );
      if (blog && blog._id === id) {
        setBlog((prev) => ({ ...prev, likesCount: data.likesCount, liked: data.liked }));
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to like blog';
      toast.error(msg);
      throw err;
    }
  }, [blog]);

  return {
    blogs,
    blog,
    loading,
    error,
    pagination,
    fetchBlogs,
    fetchBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    setBlogs,
    setBlog,
  };
}
