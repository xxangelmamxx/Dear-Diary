import { useState, useContext, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';

export default function CommentItem({ comment, onDelete }) {
  const { currentUser } = useContext(AuthContext);
  const isOwner = comment.user_id === currentUser.id;

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const menuRef = useRef();

  // close menu if clicking outside
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOptionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async () => {
    await supabase.from('comments').delete().eq('id', comment.id);
    onDelete();
  };

  const handleSave = async () => {
    await supabase
      .from('comments')
      .update({ content: editedContent })
      .eq('id', comment.id);
    setIsEditing(false);
    onDelete(); // trigger reload
  };

  return (
    <div className="comment" ref={menuRef}>
      {isOwner && (
        <button
          className="comment-options-icon"
          onClick={() => setOptionsOpen(o => !o)}
          aria-label="Comment options"
        >
          {/* simple pencil SVG */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41 6.34a1.25 1.25 0 000-1.77l-2-2a1.25 1.25 0 00-1.77 0l-1.83 1.83 3.75 3.75 1.85-1.81z"/>
          </svg>
        </button>
      )}

      {optionsOpen && (
        <div className="comment-options-menu">
          <button onClick={() => { setIsEditing(true); setOptionsOpen(false); }}>
            Edit
          </button>
          <button onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}

      <small>{new Date(comment.created_at).toLocaleString()}</small>

      {isEditing ? (
        <>
          <textarea
            className="comment-edit-textarea"
            value={editedContent}
            onChange={e => setEditedContent(e.target.value)}
          />
          <div className="comment-edit-actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <p>{comment.content}</p>
      )}
    </div>
  );
}
