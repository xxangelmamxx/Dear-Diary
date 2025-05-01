// src/components/PostItem.jsx
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function PostItem({ post, isCommented }) {
  const { currentUser } = useContext(AuthContext);
  const isOwner = currentUser?.id === post.user_id;

  // Base card class + highlights
  let cls = 'post-card';
  if (isOwner) cls += ' highlight-green';
  else if (isCommented) cls += ' highlight-yellow';

  return (
    <Link to={`/posts/${post.id}`} className={cls}>
      <h3 className="post-title">{post.title}</h3>
      <small className="post-meta">
        {new Date(post.created_at).toLocaleString()} • {post.upvotes ?? 0} upvotes
      </small>
    </Link>
  );
}
