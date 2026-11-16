// profile-sync.js - SERVER ONLY - LocalStorage illa da
(function() {
  async function getServerPhoto() {
    try {
      if (!window.supabaseClient) return null;
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      if (!user) return null;

      const { data, error } = await window.supabaseClient
        .from('profiles')
        .select('avatar_url, photo_url, profile_photo')
        .eq('id', user.id)
        .single();

      if (error || !data) return null;
      return data.avatar_url || data.photo_url || data.profile_photo || null;
    } catch(e) { return null; }
  }

  async function applyPhoto() {
    const photo = await getServerPhoto();
    if (!photo) return;
    document.querySelectorAll('img[data-avatar], .avatar img, .profile-img, #profilePhoto, #navAvatar').forEach(img => {
      if (img.src !== photo) img.src = photo;
    });
    document.querySelectorAll('.avatar-placeholder, .avatar-letter').forEach(el => {
      if (el.textContent.trim() === 'P') {
        const img = document.createElement('img');
        img.src = photo;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        el.innerHTML = '';
        el.appendChild(img);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', applyPhoto);
  // Server la photo maathina udane ella page layum maarum
  window.addEventListener('focus', applyPhoto);
})();
