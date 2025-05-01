// src/components/Activity.jsx
import { useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from '../context/AuthContext'
import PostItem from './PostItem'

export default function Activity() {
  const { currentUser } = useContext(AuthContext)
  const [likedPosts, setLikedPosts]         = useState([])
  const [commentedPosts, setCommentedPosts] = useState([])
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    if (!currentUser) return

    const fetchActivity = async () => {
      setLoading(true)

      // 1️⃣ Get all post_ids the user has upvoted
      const { data: upvoteRows, error: upvoteErr } = await supabase
        .from('post_upvotes')            // ← correct table
        .select('post_id')
        .eq('user_id', currentUser.id)
      if (upvoteErr) console.error('Error fetching upvotes:', upvoteErr.message)

      const upvotedIds = upvoteRows?.map(r => r.post_id) || []

      // 2️⃣ Fetch those posts in one go
      let upvoted = []
      if (upvotedIds.length > 0) {
        const { data: postsData, error: postsErr } = await supabase
          .from('posts')
          .select('*')
          .in('id', upvotedIds)
        if (postsErr) console.error('Error fetching upvoted posts:', postsErr.message)
        else upvoted = postsData
      }

      // 3️⃣ Now for comments (table is correct)
      const { data: commentRows, error: commentErr } = await supabase
        .from('comments')
        .select('post_id')
        .eq('user_id', currentUser.id)
      if (commentErr) console.error('Error fetching comments:', commentErr.message)

      const commentIds = commentRows?.map(r => r.post_id) || []

      let commented = []
      if (commentIds.length > 0) {
        const { data: commentPosts, error: commentPostsErr } = await supabase
          .from('posts')
          .select('*')
          .in('id', commentIds)
        if (commentPostsErr) console.error('Error fetching commented posts:', commentPostsErr.message)
        else {
          // dedupe in case you commented multiple times on the same post
          const uniq = []
          commentPosts.forEach(p => {
            if (!uniq.find(x => x.id === p.id)) uniq.push(p)
          })
          commented = uniq
        }
      }

      setLikedPosts(upvoted)
      setCommentedPosts(commented)
      setLoading(false)
    }

    fetchActivity()
  }, [currentUser])

  if (!currentUser) {
    return (
      <p style={{ padding: '1.5rem', textAlign: 'center' }}>
        Please <a href="/login" style={{ color: '#3b82f6', textDecoration: 'underline' }}>log in</a> to view your activity.
      </p>
    )
  }
  if (loading) {
    return <p style={{ padding: '1.5rem', textAlign: 'center' }}>Loading your activity…</p>
  }

  return (
    <div className="activity-page">
      <h1>My Activity</h1>
      <div className="activity-wrapper">
        {/* Upvoted Posts */}
        <section className="activity-section">
          <h2>Posts You’ve Upvoted</h2>
          {likedPosts.length > 0 ? (
            <div className="posts-grid">
              {likedPosts.map(post => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p>You haven’t upvoted any posts yet.</p>
          )}
        </section>

        {/* Commented Posts */}
        <section className="activity-section">
          <h2>Posts You’ve Commented On</h2>
          {commentedPosts.length > 0 ? (
            <div className="posts-grid">
              {commentedPosts.map(post => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p>You haven’t commented on any posts yet.</p>
          )}
        </section>
      </div>
    </div>
  )
}
