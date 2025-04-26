import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';

export default function EditPost() {
  const { session } = useContext(AuthContext);
  const { id } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image_url, setImageUrl] = useState('');

  useEffect(() => {
    if (!session) return nav('/login');
    supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .then(({ data: [p] }) => {
        if (!p || p.user_id !== session.user.id) {
          return nav('/');
        }
        setPost(p);
        setTitle(p.title);
        setContent(p.content);
        setImageUrl(p.image_url);
      });
  }, [session, id]);

  const save = async e => {
    e.preventDefault();
    await supabase
      .from('posts')
      .update({ title, content, image_url })
      .eq('id', id);
    nav(`/posts/${id}`);
  };

  if (!post) return null;
  return (
    <form onSubmit={save}>
      <h2>Edit Post</h2>
      <input value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <input
        value={image_url}
        onChange={e => setImageUrl(e.target.value)}
      />
      <button type="submit">Save Changes</button>
    </form>
  );
}
