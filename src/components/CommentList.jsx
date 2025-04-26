import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import CommentItem from './CommentItem';

export default function CommentList({ postId, trigger, onDelete }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setComments(data || []));
  }, [postId, trigger]);

  return (
    <>
      {comments.map(c => (
        <CommentItem
          key={c.id}
          comment={c}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
