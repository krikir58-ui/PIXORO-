// PIXORO V1 - FEED + INSTA STYLE AD SYSTEM - CORRECT CODE DA GIRI

async function loadFeed() {
    const feedContainer = document.getElementById('feed') || document.getElementById('posts-container');
    if (!feedContainer) return;
    
    feedContainer.innerHTML = '<p style="color:white; text-align:center;">Loading PIXORO Feed... 🔥</p>';

    // Supabase la irunthu posts edukkum code (unoda code)
    const { data: posts, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    
    if (error) {
        feedContainer.innerHTML = '<p style="color:red;">Error loading posts</p>';
        return;
    }

    feedContainer.innerHTML = '';
    let postCount = 0;

    posts.forEach((post) => {
        postCount++;

        // --- 1. NORMAL POST ---
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        postDiv.innerHTML = `
            <div style="background:#1a1a1a; border:1px solid #333; border-radius:15px; padding:12px; margin-bottom:15px;">
                <div style="display:flex; gap:10px; align-items:center;">
                    <img src="${post.user_avatar || 'https://i.pravatar.cc/100'}" style="width:38px; height:38px; border-radius:50%; border:2px solid #FFD700;">
                    <b style="color:white;">@${post.username || 'pixoro_user'}</b>
                </div>
                <p style="color:white; margin:10px 0;">${post.caption || post.content || ''}</p>
                ${post.image_url ? `<img src="${post.image_url}" style="width:100%; border-radius:12px; margin-top:8px;">` : ''}
                <div style="display:flex; gap:15px; margin-top:10px; color:#aaa;">
                    <span>❤️ ${post.likes || 0}</span><span>💬 Comment</span><span>↗️ Share</span>
                </div>
            </div>
        `;
        feedContainer.appendChild(postDiv);

        // --- 2. 3 POST KU 1 AD - INSTA STYLE ---
        if (postCount % 3 === 0) {
            const adDiv = document.createElement('div');
            adDiv.className = 'pixoro-ad-card';
            adDiv.innerHTML = `
                <div style="background:#000; border:1.5px solid #FFD700; border-radius:15px; padding:15px; margin-bottom:15px; text-align:center;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span style="background:#FFD700; color:black; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:10px;">SPONSORED</span>
                        <span style="color:#666; font-size:10px;">PIXORO ADS • Ad</span>
                    </div>
                    <h3 style="color:#FFD700; margin:5px 0;">💰 Watch Ad & Earn ₹5</h3>
                    <p style="color:#ccc; font-size:12px;">Premium Blue Tick ku 1 Ad paaru da Giri!</p>
                    <div style="background:#222; border-radius:10px; height:140px; display:flex; align-items:center; justify-content:center; margin:10px 0; color:#FFD700; font-weight:bold;">PIXORO AD SPACE 🔥</div>
                    <button onclick="alert('Ad Watched da Giri! ₹5 Added to Wallet! 🎉'); this.innerText='✅ ₹5 Earned!';" style="background:#FFD700; color:black; border:none; padding:10px 20px; border-radius:20px; font-weight:bold; width:90%;">Watch Ad Now</button>
                </div>
            `;
            feedContainer.appendChild(adDiv);
        }
    });
}

// Page load aana aprom feed load aagum
loadFeed();
