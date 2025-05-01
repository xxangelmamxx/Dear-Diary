// src/components/EditPost.jsx
import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from '../context/AuthContext'

export default function EditPost() {
  const { currentUser } = useContext(AuthContext)
  const { id } = useParams()
  const navigate = useNavigate()

  const [post, setPost]         = useState(null)
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    ;(async () => {
      const { data: p, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error || !p) {
        navigate('/')
        return
      }
      if (p.user_id !== currentUser.id) {
        navigate(`/posts/${id}`)
        return
      }

      setPost(p)
      setTitle(p.title)
      setContent(p.content)
    })()
  }, [currentUser, id, navigate])

  if (!post) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')

    const { error } = await supabase
      .from('posts')
      .update({ title, content })
      .eq('id', id)

    setSaving(false)

    if (error) {
      console.error('Update error:', error.message)
      setErrorMsg('Failed to update post.')
    } else {
      navigate(`/posts/${id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold">Edit Post</h2>

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
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
