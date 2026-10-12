// Pixoro - Girls Safety Chat Settings - chat-settings.js
// Author: Giri

const PixoroChatSettings = {
  // Default settings
  safetyCheck: true,
  filterOffensive: true,
  blurSensitive: true,
  readReceipts: true,
  showOnlineStatus: false,
  disappearingMessages: false,

  // Save to Supabase
  async save(chatId) {
    try {
      const { data, error } = await supabase
       .from('chat_settings')
       .upsert({
          chat_id: chatId,
          user_id: (await supabase.auth.getUser()).data.user.id,
          safety_check: this.safetyCheck,
          filter_offensive: this.filterOffensive,
          blur_sensitive: this.blurSensitive,
          read_receipts: this.readReceipts,
          show_online: this.showOnlineStatus,
          disappearing: this.disappearingMessages,
          updated_at: new Date()
        });
      if(error) throw error;
      console.log("✅ Chat settings saved!");
      return true;
    } catch(err) {
      console.error("Save error:", err);
      // Fallback to localStorage
      localStorage.setItem(`pixoro_chat_${chatId}`, JSON.stringify(this));
    }
  },

  // Load settings
  async load(chatId) {
    try {
      const { data } = await supabase
       .from('chat_settings')
       .select('*')
       .eq('chat_id', chatId)
       .single();
      if(data) {
        this.safetyCheck = data.safety_check;
        this.filterOffensive = data.filter_offensive;
        this.blurSensitive = data.blur_sensitive;
        this.readReceipts = data.read_receipts;
        this.showOnlineStatus = data.show_online;
        this.disappearingMessages = data.disappearing;
      }
    } catch(e) {
      const saved = localStorage.getItem(`pixoro_chat_${chatId}`);
      if(saved) Object.assign(this, JSON.parse(saved));
    }
    this.updateUI();
  },

  // Update toggles in UI
  updateUI() {
    document.getElementById('safetyCheck')?.setAttribute('checked', this.safetyCheck);
    document.getElementById('filterOffensive')?.setAttribute('checked', this.filterOffensive);
    document.getElementById('blurSensitive')?.setAttribute('checked', this.blurSensitive);
  },

  // Girls safety - Danger word detection
  checkMessage(text) {
    if(!this.safetyCheck) return false;
    const dangerWords = ["alone ah", "photo anuppu", "varava", "address sollu", "meet pannalam"];
    const found = dangerWords.some(w => text.toLowerCase().includes(w));
    if(found) {
      if(this.filterOffensive) {
        alert("⚠️ Pixoro Safety: Suspicious message detected! Be careful da!");
      }
      // Log for evidence mode
      supabase.from('safety_logs').insert({
        type: 'suspicious_message',
        content: text,
        timestamp: new Date()
      });
      return true;
    }
    return false;
  }
};

// Toggle listeners
document.addEventListener('DOMContentLoaded', () => {
  ['safetyCheck','filterOffensive','blurSensitive','readReceipts','showOnlineStatus'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', (e) => {
      PixoroChatSettings[id] = e.target.checked;
      const chatId = new URLSearchParams(window.location.search).get('chatId') || 'default';
      PixoroChatSettings.save(chatId);
    });
  });
});

// Export for other js files
window.PixoroChatSettings = PixoroChatSettings;
