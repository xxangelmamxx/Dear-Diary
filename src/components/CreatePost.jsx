import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';

export default function CreatePost() {
  const { currentUser } = useContext(AuthContext);
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    await supabase
      .from('posts')
      .insert({
        user_id: currentUser.id,
        title,
        content,
        image_url: imageUrl,
        upvotes: 0
      });
    nav('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>New Post</h2>
      <input
        required placeholder="Title"
        value={title} onChange={e => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Content (optional)"
        value={content} onChange={e => setContent(e.target.value)}
      />
      <input
        placeholder="Image URL (optional)"
        value={imageUrl} onChange={e => setImageUrl(e.target.value)}
      />
      <button type="submit">Create</button>
    </form>
  );
}
