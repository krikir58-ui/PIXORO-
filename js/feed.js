// 🔵 PIXORO SMART FEED ALGORITHM - Instagram maari da Giri!

async function loadFeed() {
  // Supabase la irunthu data edukkrom
  const { data: posts } = await supabase.from('posts').select('*')
  const { data: likes } = await supabase.from('likes').select('*')
  const { data: comments } = await supabase.from('comments').select('*')
  const { data: follows } = await supabase.from('follows').select('*').eq('follower', 'Giri')

  if (!posts || posts.length === 0) {
    document.getElementById('feed').innerHTML = '<p style="text-align:center;padding:30px">No posts yet da Giri! First post podu! 🔵</p>'
    return
  }

  // 🔥 ALGORITHM START - Ithu thaan Instagram secret da!
  let rankedPosts = posts.map(p => {
    const lCount = likes ? likes.filter(l => l.post_id == p.id).length : 0
    const cCount = comments ? comments.filter(c => c.post_id == p.id).length : 0
    const hoursAgo = (new Date() - new Date(p.created_at)) / (1000 * 60 * 60)

    let score = 0
    score += lCount * 2        // Like ku 2 point
    score += cCount * 3        // Comment ku 3 point
    if (follows && follows.some(f => f.following == p.username)) score += 10 // Follow panravanga +10
    if (p.username == 'Giri') score += 5 // Un post ku bonus
    score -= hoursAgo * 0.5    // Palasa post ku minus
    if (p.caption && p.caption.includes('#')) score += 8 // Hashtag ku +8

    return { ...p, score, lCount, cCount }
  })

  // Score padi sort - Perusa irukka mela varum!
  rankedPosts.sort((a, b) => b.score - a.score)

  // HTML Build
  let html = ''
  for (let p of rankedPosts) {
    const isLiked = likes ? likes.some(l => l.post_id == p.id && l.username == 'Giri') : false
    const pCmts = comments ? comments.filter(c => c.post_id == p.id) : []
    const badge = p.score > 10 ? '🔥 TRENDING' : ''

    html += `
    <div class="post">
      <div class="postTop"><b>@${p.username} ${p.username=='Giri'?'✔️':''} ${badge}</b>
      <button onclick="followUser('${p.username}')">Follow</button></div>
      <img class="main" src="${p.image_url}" ondblclick="likePost(${p.id})">
      <div class="actions">
        <span onclick="likePost(${p.id})">${isLiked?'❤️':'🤍'}</span>
        <span>💬</span><span>✈️</span>
      </div>
      <div style="padding:0 12px"><b>${p.lCount} likes</b><br>${p.caption||''}</div>
      <div style="padding:5px 12px;font-size:13px;color:#aaa">${pCmts.map(c=>`<div><b>${c.username}</b> ${c.comment}</div>`).join('')}</div>
    </div>`
  }
  document.getElementById('feed').innerHTML = html
}

// Page load aana algorithm run aagum
loadFeed()
