// src/components/MyPosts.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';

export default function MyPosts() {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    supabase
      .from('posts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setPosts(data || []));
  }, [currentUser]);

  return (
    <div>
      <h1>My Posts</h1>
      {posts.length === 0 && <p>You haven’t posted anything yet.</p>}
      {posts.map(post => (
        <Link
          to={`/posts/${post.id}`}
          key={post.id}
          className="post-card"
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <h3>{post.title}</h3>
          <small>{new Date(post.created_at).toLocaleString()}</small>
        </Link>
      ))}
    </div>
  );
}
