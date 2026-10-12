// 🔵 PIXORO SMART FEED - SPEED VERSION DA GIRI!

let allPostsCache = []; // Cache da

async function loadFeed(search = null) {
  let query = supa.from('posts').select(`
    *,
    likes(count),
    comments(count)
  `).order('created_at', { ascending: false }).limit(20); // 20 mattum edukkrom da - fast ku!

  if(search) query = query.ilike('caption', `%${search}%`);

  const { data: posts, error } = await query;
  
  if (!posts || posts.length === 0) {
    document.getElementById('feed').innerHTML = '<p style="text-align:center;padding:30px">No posts yet da Giri! First post podu! 🔵</p>'
    return
  }

  // Follows mattum than thaniya edukkanum
  const { data: follows } = await supa.from('follows').select('following').eq('follower', ME);
  const { data: myLikes } = await supa.from('likes').select('post_id').eq('username', ME);

  // 🔥 UN ALGORITHM - Same da, aana fast ah!
  let rankedPosts = posts.map(p => {
    const lCount = p.likes?.[0]?.count || 0;
    const cCount = p.comments?.[0]?.count || 0;
    const hoursAgo = (new Date() - new Date(p.created_at)) / (1000 * 60 * 60);

    let score = 0;
    score += lCount * 2;
    score += cCount * 3;
    if (follows && follows.some(f => f.following == p.username)) score += 10;
    if (p.username == ME) score += 5;
    score -= hoursAgo * 0.5;
    if (p.caption && p.caption.includes('#')) score += 8;

    return { ...p, score, lCount, cCount, isLiked: myLikes?.some(l => l.post_id == p.id) };
  });

  rankedPosts.sort((a, b) => b.score - a.score);
  allPostsCache = rankedPosts;
  renderFeedFast(rankedPosts);
}

function renderFeedFast(posts) {
  let html = '';
  for (let p of posts) {
    const badge = p.score > 15 ? '🔥 TRENDING' : p.score > 10 ? '⭐ TOP' : '';
    const isMine = p.username === ME;

    html += `
    <div class="post" id="post-${p.id}">
      <div class="postTop">
        <b>@${p.username} ${isMine?'✔️':''} ${badge}</b>
        <div>
          ${isMine ? `<button onclick="deletePost(${p.id})" style="color:#ff3040">🗑️</button>` : `<button onclick="followUser('${p.username}')">Follow</button>`}
          <button onclick="showPostOptions(${p.id}, '${p.username}')"> •••</button>
        </div>
      </div>
      <img class="main" src="${p.image_url}" ondblclick="doLike('${p.id}')">
      <div class="actions">
        <span data-like-key="${p.id}" onclick="doLike('${p.id}')" style="font-size:22px;cursor:pointer;transition:0.15s">
          ${p.isLiked?'❤️':'🤍'} 
        </span>
        <span onclick="openComments(${p.id})">💬 ${p.cCount}</span>
        <span>✈️</span>
        <span style="float:right">${p.lCount} likes</span>
      </div>
      <div style="padding:0 12px">${p.caption||''}</div>
    </div>`;
  }
  document.getElementById('feed').innerHTML = html;
}

// Image delete + Post options
async function deletePost(postId){
  if(!confirm("Image delete pannidala ma da GIRI?")) return;
  // Instant delete
  document.getElementById(`post-${postId}`)?.remove();
  await supa.from('posts').delete().eq('id', postId);
}

async function showPostOptions(postId, username){
  if(username === ME){
    if(confirm("Delete this post da?")) deletePost(postId);
  } else {
    let choice = prompt("1. Report 🚩\n2. Block 🚫\nType 1 or 2");
    if(choice == '1') alert('Reported @'+username);
    if(choice == '2') blockUser(username);
  }
}

function doLike(postId){
  // Instant like - feed reload panna koodathu da!
  let btn = document.querySelector(`[data-like-key="${postId}"]`);
  let isLiked = btn.innerHTML.includes('❤️');
  
  // UDANE UI MAARUM
  let post = allPostsCache.find(p => p.id == postId);
  if(post){
    post.isLiked = !isLiked;
    post.lCount += isLiked ? -1 : 1;
    btn.innerHTML = `${post.isLiked?'❤️':'🤍'}`;
    btn.style.transform = 'scale(1.4)';
    setTimeout(()=> btn.style.transform = 'scale(1)', 150);
    // Like count update
    btn.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML = `${post.lCount} likes`;
  }
  
  // Aprom DB la save
  if(!isLiked){
    supa.from('likes').insert({post_id: postId, username: ME});
  } else {
    supa.from('likes').delete().eq('post_id', postId).eq('username', ME);
  }
}

loadFeed();
