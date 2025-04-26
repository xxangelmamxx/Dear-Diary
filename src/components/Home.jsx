// src/components/Home.jsx
import { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import PostItem from './PostItem';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { currentUser } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [orderBy, setOrderBy] = useState('created_at');
  const [search, setSearch] = useState('');
  const [commentedPostIds, setCommentedPostIds] = useState([]);

  // 1) Load posts, sorted by orderBy
  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .order(orderBy, { ascending: false })
      .then(({ data }) => setPosts(data || []));
  }, [orderBy]);

  // 2) Load list of post IDs this user commented on
  useEffect(() => {
    if (!currentUser) return;
    supabase
      .from('comments')
      .select('post_id')
      .eq('user_id', currentUser.id)
      .then(({ data }) => {
        setCommentedPostIds(data ? data.map(c => c.post_id) : []);
      });
  }, [currentUser]);

  // 3) Filter by search term
  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <header className="home-header">
        <h1>Dear Diary...</h1>
        <p>please be kind</p>
      </header>

      {/* Sorting & search controls */}
      <div className="controls">
        <select
          value={orderBy}
          onChange={e => setOrderBy(e.target.value)}
        >
          <option value="created_at">Newest</option>
          <option value="upvotes">Most Upvoted</option>
        </select>

        <input
          type="text"
          placeholder="Search posts…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Post grid with highlight flags */}
      <div className="post-feed">
        {filtered.length > 0 ? (
          filtered.map(post => (
            <PostItem
              key={post.id}
              post={post}
              isCommented={commentedPostIds.includes(post.id)}
            />
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#636e72' }}>
            No posts found.
          </p>
        )}
      </div>
    </div>
  );
}
