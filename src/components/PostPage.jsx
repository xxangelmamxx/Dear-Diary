// src/components/PostPage.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';
import CommentList from './CommentList';

export default function PostPage() {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [trigger, setTrigger] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Load post and upvote state
  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      setPost(p);

      const { data: up } = await supabase
        .from('post_upvotes')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      setHasUpvoted(!!up);
    };
    load();
  }, [id, currentUser.id, trigger]);

  // Toggle upvote on/off
  const toggleUpvote = async () => {
    if (hasUpvoted) {
      await supabase
        .from('post_upvotes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', currentUser.id);
      await supabase
        .from('posts')
        .update({ upvotes: post.upvotes - 1 })
        .eq('id', id);
    } else {
      await supabase
        .from('post_upvotes')
        .insert({ post_id: id, user_id: currentUser.id });
      await supabase
        .from('posts')
        .update({ upvotes: post.upvotes + 1 })
        .eq('id', id);
    }
    setTrigger(t => t + 1);
    setHasUpvoted(v => !v);
  };

  // Add a new comment (with user_id!)
  const addComment = async () => {
    if (!newComment.trim()) return;
    await supabase
      .from('comments')
      .insert({
        post_id: id,
        content: newComment,
        user_id: currentUser.id
      });
    setNewComment('');
    setTrigger(t => t + 1);
  };

  // Delete the post
  const deletePost = async () => {
    await supabase.from('posts').delete().eq('id', id);
    navigate('/');
  };

  if (!post) return <p>Loading...</p>;
  const isOwner = post.user_id === currentUser.id;

  return (
    <div className="post-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <div className="post-header">
        <div>
          <h2>{post.title}</h2>
          <small>{new Date(post.created_at).toLocaleString()}</small>
        </div>
        {isOwner && (
          <div className="post-actions">
            <Link to={`/posts/${id}/edit`}>
              <button className="edit">Edit</button>
            </Link>
            <button className="delete" onClick={deletePost}>
              Delete
            </button>
          </div>
        )}
      </div>

      <p>{post.content}</p>
      {post.image_url && (
        <img className="post-image" src={post.image_url} alt="" />
      )}

      {/* Upvote button */}
      <button
        className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`}
        onClick={toggleUpvote}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 21h4V9H2v12zm20-11h-6.31l.95-4.57.03-.32a1 1 0 0 0-.29-.7l-1-1L14 2 7 9v10h9a2 2 0 0 0 2-1.85l1-9a2 2 0 0 0-2-2.15z" />
        </svg>
        <span>{post.upvotes}</span>
      </button>

      {/* Comments section */}
      <section>
        <h3>Comments</h3>
        <CommentList
          postId={id}
          trigger={trigger}
          onDelete={() => setTrigger(t => t + 1)}
        />
        <textarea
          placeholder="New comment…"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button onClick={addComment}>Post Comment</button>
      </section>
    </div>
  );
}
