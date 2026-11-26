
/* =====================================================
   PIXORO FOLLOW SYSTEM — FIXED
   Follow • Following • Requested • Unfollow
   Supabase Database
===================================================== */

(function () {
  "use strict";

  window.allFollows = window.allFollows || [];
  window.allFollowRequests = window.allFollowRequests || [];

  function getSupa() {
    return window.getSupa
      ? window.getSupa()
      : window.supa || null;
  }

  function getMyId() {
    return window.ME_ID ||
      window.currentUser?.id ||
      window.currentProfile?.id ||
      null;
  }

  function notify(message) {
    if (typeof window.showToast === "function") {
      window.showToast(message);
    } else {
      console.log("PIXORO:", message);
    }
  }

  function syncButtons(targetId, state) {
    document.querySelectorAll("[data-follow-user]").forEach(btn => {
      if (String(btn.dataset.followUser) !== String(targetId)) return;

      btn.dataset.followState = state;
      btn.disabled = false;

      btn.textContent =
        state === "following" ? "Following" :
        state === "requested" ? "Requested" :
        "Follow";

      btn.classList.toggle("is-following", state === "following");
      btn.classList.toggle("is-requested", state === "requested");
    });
  }

  function broadcastFollow(targetId, state) {
    syncButtons(targetId, state);

    try {
      localStorage.setItem("pixoro_follow_sync", JSON.stringify({
        targetId,
        state,
        time: Date.now()
      }));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent("pixoro:follow", {
      detail: { targetId, state }
    }));
  }

  function getFollowState(targetId) {
    const id = String(targetId || "");

    if (window.allFollows.some(f =>
      String(f.following_id) === id
    )) return "following";

    if (window.allFollowRequests.some(r =>
      String(r.to_id) === id
    )) return "requested";

    return "follow";
  }

  async function resolveUserId(rawId) {
    if (!rawId) return null;

    const value = String(rawId).trim();

    // UUID
    if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value)) {
      return value;
    }

    const supa = getSupa();
    if (!supa) return null;

    const username = value.replace(/^@/, "").toLowerCase();

    const { data, error } = await supa
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .maybeSingle();

    if (error || !data) return null;

    return data.id;
  }

  async function loadFollowing() {
    const supa = getSupa();
    const myId = getMyId();

    if (!supa || !myId) return false;

    const { data, error } = await supa
      .from("follows")
      .select("following_id")
      .eq("follower_id", myId);

    if (error) {
      console.error("PIXORO load follows:", error);
      return false;
    }

    window.allFollows = data || [];

    const { data: requests, error: requestError } = await supa
      .from("follow_requests")
      .select("to_id")
      .eq("from_id", myId)
      .eq("status", "pending");

    if (!requestError) {
      window.allFollowRequests = requests || [];
    }

    return true;
  }

  async function followUser(myId, targetId) {
    const supa = getSupa();

    const { data: profile, error: profileError } = await supa
      .from("profiles")
      .select("is_private_account")
      .eq("id", targetId)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    if (profile.is_private_account === true) {
      const { error } = await supa
        .from("follow_requests")
        .insert({
          from_id: myId,
          to_id: targetId,
          status: "pending"
        });

      if (error) throw error;

      window.allFollowRequests.push({ to_id: targetId });
      broadcastFollow(targetId, "requested");

      return { status: "requested" };
    }

    const { error } = await supa
      .from("follows")
      .insert({
        follower_id: myId,
        following_id: targetId
      });

    if (error) throw error;

    window.allFollows.push({ following_id: targetId });
    broadcastFollow(targetId, "following");

    return { status: "following" };
  }

  async function pixoroToggleFollow(rawId, btn) {
    const supa = getSupa();
    const myId = getMyId();

    if (!supa || !myId) {
      notify("Please login first");
      return { status: "error" };
    }

    const targetId = await resolveUserId(rawId);

    if (!targetId) {
      notify("User not found");
      return { status: "error" };
    }

    if (String(myId) === String(targetId)) {
      return { status: "self" };
    }

    if (btn) btn.disabled = true;

    try {
      const state = getFollowState(targetId);

      if (state === "following") {
        const { error } = await supa
          .from("follows")
          .delete()
          .eq("follower_id", myId)
          .eq("following_id", targetId);

        if (error) throw error;

        window.allFollows = window.allFollows.filter(
          f => String(f.following_id) !== String(targetId)
        );

        broadcastFollow(targetId, "follow");

        notify("Unfollowed");
        return { status: "follow" };
      }

      if (state === "requested") {
        const { error } = await supa
          .from("follow_requests")
          .delete()
          .eq("from_id", myId)
          .eq("to_id", targetId)
          .eq("status", "pending");

        if (error) throw error;

        window.allFollowRequests = window.allFollowRequests.filter(
          r => String(r.to_id) !== String(targetId)
        );

        broadcastFollow(targetId, "follow");

        notify("Request cancelled");
        return { status: "follow" };
      }

      const result = await followUser(myId, targetId);

      notify(
        result.status === "requested"
          ? "Follow request sent"
          : "Following"
      );

      return result;

    } catch (error) {
      console.error("PIXORO follow error:", error);
      notify(error.message || "Follow failed");
      return { status: "error", error };

    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function handleFollowRequest(requestId, action) {
    const supa = getSupa();
    const myId = getMyId();

    if (!supa || !myId) return false;

    if (!["accept", "decline"].includes(action)) return false;

    const { data: request, error: requestError } = await supa
      .from("follow_requests")
      .select("id,from_id,to_id,status")
      .eq("id", requestId)
      .eq("to_id", myId)
      .eq("status", "pending")
      .maybeSingle();

    if (requestError || !request) {
      notify("Request not found");
      return false;
    }

    if (action === "accept") {
      const { error: followError } = await supa
        .from("follows")
        .insert({
          follower_id: request.from_id,
          following_id: myId
        });

      if (followError) {
        console.error(followError);
        notify("Could not accept request");
        return false;
      }
    }

    const { error } = await supa
      .from("follow_requests")
      .delete()
      .eq("id", requestId)
      .eq("to_id", myId);

    if (error) {
      console.error(error);
      return false;
    }

    notify(action === "accept" ? "Request accepted" : "Request declined");

    return true;
  }

  // Cross-tab sync
  window.addEventListener("storage", event => {
    if (event.key !== "pixoro_follow_sync" || !event.newValue) return;

    try {
      const item = JSON.parse(event.newValue);
      if (item.targetId && item.state) {
        syncButtons(item.targetId, item.state);
      }
    } catch (e) {}
  });

  // Public functions
  window.pixoroToggleFollow = pixoroToggleFollow;
  window.toggleFollow = function (targetId, btn) {
    return pixoroToggleFollow(targetId, btn);
  };

  window.followUser = followUser;
  window.handleFollowRequest = handleFollowRequest;
  window.pixoroLoadFollowing = loadFollowing;
  window.pixoroGetFollowState = getFollowState;
  window.pixoroResolveFollowUserId = resolveUserId;
  window.pixoroSyncFollowButtons = syncButtons;

})();
