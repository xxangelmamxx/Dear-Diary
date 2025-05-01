// src/components/CreatePost.jsx
import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from '../context/AuthContext'

export default function CreatePost() {
  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      navigate('/login')
      return
    }

    setSaving(true)
    setErrorMsg('')

    const { error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        user_id: currentUser.id
      })

    setSaving(false)

    if (error) {
      console.error('Insert post error:', error.message)
      setErrorMsg('Failed to create post.')
    } else {
      navigate('/')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold">New Post</h2>

      {errorMsg && <div className="text-red-600">{errorMsg}</div>}

      <input
        type="text"
        placeholder="Title"
        required
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full border rounded p-2"
      />

      <textarea
        placeholder="Content"
        required
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full border rounded p-2 h-32"
      />

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Create Post'}
      </button>
    </form>
  )
}
