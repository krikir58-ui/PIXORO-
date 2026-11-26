
/* =====================================================
   PIXORO REELS V1021
   Separate File Connection
   Like / Comments / Follow / Save / Share
   ===================================================== */

(function () {
  "use strict";

  let loading = false;
  let reelObserver = null;

  function getClient() {
    return window.getSupa
      ? window.getSupa()
      : window.supa || window.supabaseClient || null;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }

  function safeURL(value) {
    try {
      const url = new URL(value, location.href);

      return ["https:", "http:"].includes(url.protocol)
        ? escapeHTML(url.href)
        : "";
    } catch (e) {
      return "";
    }
  }

  // VIDEO DETECTION
  function isVideo(post) {
    if (String(post.media_type || "").toLowerCase() === "video") {
      return true;
    }

    if (post.is_reel === true) return true;

    if (post.video_url) return true;

    const media = String(post.media_url || "").trim();

    if (!media) return false;

    try {
      const url = new URL(media, location.href);
      const path = url.pathname.toLowerCase();

      return /\.(mp4|mov|webm|m4v|ogv)$/i.test(path);
    } catch (e) {
      return /\.(mp4|mov|webm|m4v|ogv)(\?|#|$)/i.test(media);
    }
  }

  // SHEETS
  window.closeSheet = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("open", "show");
  };

  window.openSheet = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("open", "show");
  };

  // MUTE ALL REELS
  window.toggleMuteAll = function () {
    window._MUTED = !window._MUTED;

    document.querySelectorAll(".reel-main").forEach(video => {
      video.muted = !!window._MUTED;
    });
  };

  // LOAD REELS
  async function loadReels() {
    const wrap = document.getElementById("reelWrap");

    if (!wrap || loading) return;

    const supa = getClient();

    if (!supa) {
      wrap.innerHTML =
        '<div style="color:white;text-align:center;padding-top:40vh">Database not ready</div>';
      return;
    }

    loading = true;

    try {
      // CURRENT USER
      let MY_ID = "";

      try {
        const session = await supa.auth.getSession();
        MY_ID = session.data?.session?.user?.id || "";
      } catch (e) {
        console.warn("Session error:", e);
      }

      // LOAD POSTS
      const postResult = await supa
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (postResult.error) throw postResult.error;

      let posts = Array.isArray(postResult.data)
        ? [...postResult.data]
        : [];

      // LOAD REELS TABLE
      try {
        const reelResult = await supa
          .from("reels")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!reelResult.error && Array.isArray(reelResult.data)) {
          const existing = new Set(
            posts.map(p =>
              String(p.video_url || p.media_url || "")
            ).filter(Boolean)
          );

          reelResult.data.forEach(r => {
            const media = r.video_url || r.media_url || "";

            if (!media || existing.has(String(media))) return;

            posts.push({
              id: "reel-" + r.id,
              user_id: r.user_id,
              username: r.username,
              avatar_url: r.avatar_url,
              caption: r.caption,
              video_url: media,
              media_url: media,
              media_type: "video",
              created_at: r.created_at,
              likes_count: r.likes_count || 0,
              comments_count: r.comments_count || 0
            });

            existing.add(String(media));
          });
        }
      } catch (e) {
        console.warn("Reels table unavailable:", e);
      }

      // ONLY VIDEOS
      const videos = posts
        .filter(isVideo)
        .filter(p => p.video_url || p.media_url)
        .sort((a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );

      if (!videos.length) {
        wrap.innerHTML = `
          <div style="color:white;text-align:center;padding-top:40vh">
            Innum Reels Illa da 😅
            <br>Post la Video Upload Pannu da
          </div>`;
        return;
      }

      // LOAD PROFILES
      const userIds = [
        ...new Set(videos.map(p => p.user_id).filter(Boolean))
      ];

      const profileMap = {};

      if (userIds.length) {
        const profileResult = await supa
          .from("profiles")
          .select("id,username,avatar_url")
          .in("id", userIds);

        if (!profileResult.error) {
          (profileResult.data || []).forEach(profile => {
            profileMap[String(profile.id)] = profile;
          });
        }
      }

      // MY PROFILE PHOTO
      if (MY_ID && profileMap[MY_ID]?.avatar_url) {
        window.MY_PFP = profileMap[MY_ID].avatar_url;

        document.querySelectorAll("#navPfp,.navPfp").forEach(img => {
          img.src = window.MY_PFP;
        });
      }

      // REMOVE OLD OBSERVER
      if (reelObserver) {
        reelObserver.disconnect();
        reelObserver = null;
      }

      // RENDER REELS
      wrap.innerHTML = videos.map(post => {
        const id = escapeHTML(post.id);
        const owner = escapeHTML(post.user_id || "");

        const profile = profileMap[String(post.user_id)] || {};

        const username = escapeHTML(
          profile.username || post.username || "Pixoro User"
        );

        const caption = escapeHTML(post.caption || "");

        const avatar = safeURL(
          profile.avatar_url || post.avatar_url || ""
        );

        const media = safeURL(
          post.video_url || post.media_url || ""
        );

        if (!media) return "";

        const letter = username.charAt(0).toUpperCase();

        return `
        <div class="reel"
             data-id="${id}"
             data-owner="${owner}">

          <video
            class="reel-main"
            src="${media}"
            loop
            playsinline
            muted
            preload="metadata">
          </video>

          <div class="progress"></div>

          <div class="centerCtrl">
            <div class="centerIcon">
              <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>

          <div class="heartBurst"></div>

          <div class="btm">

            <div style="display:flex;align-items:center;gap:10px">

              <div class="reel-pfp-wrap"
                   data-profile="${username}">
                ${
                  avatar
                    ? `<img src="${avatar}" onerror="this.remove()">`
                    : `<div style="width:100%;height:100%;background:#FF4D8D;display:flex;align-items:center;justify-content:center;font-weight:800">${letter}</div>`
                }
              </div>

              <span class="reel-username"
                    data-profile="${username}">
                @${username}
              </span>

              <button class="followBtnPerusa"
                      data-action="follow">
                Follow
              </button>

            </div>

            <div class="reel-caption">
              <b>@${username}</b> ${caption}
            </div>

          </div>

          <div class="vBar">

            <div class="vBtn" data-action="like">
              <span class="vIcon">
                <svg viewBox="0 0 24 24"
                     fill="none"
                     stroke="#fff"
                     stroke-width="1.8">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
                </svg>
              </span>
              <span class="rCount">${Number(post.likes_count) || 0}</span>
            </div>

            <div class="vBtn" data-action="comments">
              <svg viewBox="0 0 24 24"
                   fill="none"
                   stroke="#fff"
                   stroke-width="1.8">
                <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5h.5a8.5 8.5 0 0 1 8 8z"/>
              </svg>
              <span>${Number(post.comments_count) || 0}</span>
            </div>

            <div class="vBtn" data-action="share">
              <svg viewBox="0 0 24 24"
                   fill="none"
                   stroke="#fff"
                   stroke-width="1.8">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>
              </svg>
              <span>Share</span>
            </div>

            <div class="vBtn" data-action="save">
              <svg viewBox="0 0 24 24"
                   fill="none"
                   stroke="#fff"
                   stroke-width="1.8">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Save</span>
            </div>

            <div class="vBtn tildeBtn" data-action="more">
              <span>⋯</span>
            </div>

            <div class="audioWrap">
              <div class="audioDiscInBar">
                ${
                  avatar
                    ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover">`
                    : letter
                }
              </div>
            </div>

          </div>
        </div>`;
      }).join("");

      // OBSERVER
      reelObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const video = entry.target.querySelector("video");

          if (!video) return;

          if (entry.isIntersecting) {
            video.muted = !!window._MUTED;
            window._CUR = entry.target.dataset.id;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.6 });

      // REEL EVENTS
      wrap.querySelectorAll(".reel").forEach(item => {
        const video = item.querySelector("video");
        const center = item.querySelector(".centerCtrl");

        reelObserver.observe(item);

        // VIDEO PLAY / PAUSE
        video.addEventListener("click", () => {
          if (video.paused) {
            video.play().catch(() => {});
            center?.classList.remove("show");
          } else {
            video.pause();
            center?.classList.add("show");
          }
        });

        // DOUBLE TAP LIKE
        let lastTap = 0;

        item.addEventListener("touchend", e => {
          if (e.target.closest(
            ".vBar,.followBtnPerusa,.reel-pfp-wrap,.reel-username"
          )) return;

          const now = Date.now();

          if (now - lastTap < 320) {
            const heart = item.querySelector(".heartBurst");

            heart.innerHTML = `
              <svg viewBox="0 0 24 24"
                   fill="#ff3040"
                   stroke="#fff"
                   stroke-width="1.5">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
              </svg>`;

            heart.classList.remove("show");
            void heart.offsetWidth;
            heart.classList.add("show");

            const likeBtn = item.querySelector('[data-action="like"]');

            if (likeBtn && window.likeReel) {
              window.likeReel(item.dataset.id, likeBtn, null);
            }
          }

          lastTap = now;
        }, { passive: true });
      });

      // SEPARATE FILE CONNECTION
      wrap.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", e => {
          e.stopPropagation();

          const reel = btn.closest(".reel");
          const id = reel?.dataset.id;

          switch (btn.dataset.action) {

            case "like":
              if (window.likeReel) {
                window.likeReel(id, btn, e);
              }
              break;

            case "comments":
              if (window.openComments) {
                window.openComments(id);
              }
              break;

            case "share":
              if (window.openShare) {
                window.openShare(id);
              }
              break;

            case "save":
              if (window.saveReel) {
                window.saveReel(id, btn);
              }
              break;

            case "follow":
              if (window.toggleFollow) {
                window.toggleFollow(btn);
              }
              break;

            case "more":
              window._CUR = id;
              window.openSheet("viewerSheet");
              break;
          }
        });
      });

      // PROFILE CLICK
      wrap.querySelectorAll("[data-profile]").forEach(el => {
        el.addEventListener("click", () => {
          window.openFriendProfile(el.dataset.profile);
        });
      });

      window.dispatchEvent(
        new Event("pixoro-reels-rendered")
      );

      if (window.pixoroLoadAvatars) {
        window.pixoroLoadAvatars();
      }

    } catch (error) {
      console.error("PIXORO REELS ERROR:", error);

      wrap.innerHTML = `
        <div style="color:#ff5ea8;text-align:center;padding-top:40vh">
          Reels load failed
          <br>${escapeHTML(error.message || "Database error")}
        </div>`;
    }

    finally {
      loading = false;
    }
  }

  // FOLLOW UI ONLY
  // Database follow action should be handled by follow.js
  window.toggleFollow = function(btn) {
    if (!btn) return;

    btn.classList.toggle("following");

    btn.textContent =
      btn.classList.contains("following")
        ? "Following"
        : "Follow";
  };

  // PROFILE
  window.openFriendProfile = function(username) {
    if (!username) return;

    location.href =
      "profile.html?user=" + encodeURIComponent(username);
  };

  // SHEET ACTIONS
  window.editReel = () => window.closeSheet("ownerSheet");

  window.shareQR = () => {
    if (window.copyLinkSafe) {
      window.copyLinkSafe();
    } else {
      window.closeSheet("ownerSheet");
    }
  };

  window.deleteSafe = () => window.closeSheet("ownerSheet");
  window.notInterestedSafe = () => window.closeSheet("viewerSheet");
  window.hideReelSafe = () => window.closeSheet("viewerSheet");
  window.reportSafe = () => window.closeSheet("viewerSheet");

  // RELOAD FUNCTION
  window.loadPixoroReels = loadReels;

  // INITIAL LOAD
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadReels, { once: true });
  } else {
    loadReels();
  }

})();
