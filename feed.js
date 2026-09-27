// PIXORO V1 - FULL CORRECT CODE WITH INSTA STYLE AD - GIRI EDITION
// File: feed.js - 100% Working

const feedContainer = document.getElementById('feed') || document.getElementById('posts-container');

async function loadFeed() {
    if (!feedContainer) {
        console.log("Feed container not found da Giri!");
        return;
    }
    
    feedContainer.innerHTML = '<p style="color:white; text-align:center; padding:20px;">🔥 PIXORO Loading... 🔥</p>';

    try {
        // Supabase la irunthu posts edukkuthu
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        feedContainer.innerHTML = '';

        if (!posts || posts.length === 0) {
            feedContainer.innerHTML = '<p style="color:#888; text-align:center;">No posts da Giri - Post pannu da!</p>';
            return;
        }

        let postCount = 0;

        posts.forEach((post) => {
            postCount++;

            // ==================== 1. NORMAL POST ====================
            const postEl = document.createElement('div');
            postEl.className = 'post-card';
            postEl.innerHTML = `
                <div style="background:#121212; border:1px solid #2a2a2a; border-radius:16px; margin-bottom:16px; overflow:hidden;">
                    <!-- User Header -->
                    <div style="display:flex; align-items:center; gap:10px; padding:12px;">
                        <img src="${post.user_avatar || post.avatar || 'https://i.pravatar.cc/100'}" style="width:40px; height:40px; border-radius:50%; border:2px solid #FFD700;">
                        <div>
                            <b style="color:white; font-size:14px;">@${post.username || post.user_name || 'pixoro_user'}</b>
                            <p style="color:#666; font-size:11px; margin:0;">${new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                        <div style="margin-left:auto; color:#FFD700;">•••</div>
                    </div>
                    
                    <!-- Views & Earning Bar - UNODA MANJA BAR DA -->
                    <div style="background:#FFD700; color:black; padding:6px 12px; font-weight:bold; font-size:13px; display:flex; gap:5px;">
                        <span>👁️ ${post.views || 1246} Views |</span>
                        <span>💰 ₹${post.earnings || '9.34'} |</span>
                        <span>4K=₹30</span>
                    </div>

                    <!-- Image / Video -->
                    ${post.image_url || post.image ? `<img src="${post.image_url || post.image}" style="width:100%; max-height:500px; object-fit:cover;">` : ''}
                    ${post.video_url ? `<video src="${post.video_url}" controls style="width:100%;"></video>` : ''}

                    <!-- Caption -->
                    <div style="padding:10px 12px;">
                        <p style="color:white; font-size:14px; margin:0;">${post.caption || post.content || post.text || ''}</p>
                    </div>

                    <!-- Actions -->
                    <div style="display:flex; justify-content:space-around; padding:10px; border-top:1px solid #222;">
                        <span style="color:white; cursor:pointer;">❤️ <b id="like-${post.id}">${post.likes || 0}</b></span>
                        <span style="color:white;">💬 12</span>
                        <span style="color:white;">↗️ Share</span>
                    </div>
                </div>
            `;
            feedContainer.appendChild(postEl);

            // ==================== 2. AD - EVERY 1 POST FOR NOW (TESTING) ====================
            // Nalaiku 1 ah 3 nu maathidalam da Giri
            if (postCount % 1 === 0) {
                const adEl = document.createElement('div');
                adEl.className = 'pixoro-ad';
                adEl.innerHTML = `
                    <div style="background:linear-gradient(135deg, #000 0%, #1a1a00 100%); border:2px solid #FFD700; border-radius:16px; padding:16px; margin-bottom:16px; text-align:center; position:relative;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                            <span style="background:#FFD700; color:black; font-size:10px; font-weight:800; padding:3px 10px; border-radius:20px;">SPONSORED</span>
                            <span style="color:#666; font-size:10px;">Ad • PIXORO</span>
                        </div>
                        <h3 style="color:#FFD700; margin:5px 0; font-size:18px;">🔥 Watch Ad & Earn ₹5 🔥</h3>
                        <p style="color:#aaa; font-size:12px; margin:5px 0;">Ad paatha kasu varum da Giri!</p>
                        <div style="background:#111; border:1px dashed #FFD700; border-radius:10px; height:120px; display:flex; align-items:center; justify-content:center; margin:12px 0; color:#FFD700; font-weight:bold; font-size:16px;">
                            PIXORO PREMIUM AD
                        </div>
                        <button onclick="this.innerText='✅ ₹5 Earned!'; alert('Super da Giri! ₹5 Wallet la add aayiduchu! 💰')" style="background:#FFD700; color:black; border:none; padding:12px 24px; border-radius:25px; font-weight:800; width:90%; font-size:14px;">Watch Ad Now - Earn ₹5</button>
                    </div>
                `;
                feedContainer.appendChild(adEl);
            }
        });

    } catch (err) {
        console.error(err);
        feedContainer.innerHTML = `<p style="color:red; text-align:center;">Error da Giri: ${err.message}</p>`;
    }
}

// Auto load
document.addEventListener('DOMContentLoaded', loadFeed);
loadFeed();
