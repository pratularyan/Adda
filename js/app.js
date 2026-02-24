/* =============================
   ADDA — Shared App Logic (app.js)
   ============================= */

// =====================
// CONSTANTS
// =====================
const VIBES = {
  chill:   { emoji: '☕', label: 'Chill' },
  concert: { emoji: '🎵', label: 'Concert' },
  food:    { emoji: '🍕', label: 'Food' },
  study:   { emoji: '📚', label: 'Study' },
  sports:  { emoji: '🏏', label: 'Sports' },
  night:   { emoji: '🌙', label: 'Night Out' },
};

const AVATAR_COLORS = ['#FF6B1A','#0A3D3D','#FF2D6B','#6366f1','#f59e0b','#10b981'];

const COLLEGES = [
  'Hansraj College','Miranda House','SRCC','Hindu College',
  'Kirori Mal','St. Stephen\'s','LSR','Ramjas College','Daulat Ram','Other DU College'
];

const AREAS = [
  'Kamla Nagar','Hauz Khas','Connaught Place','North Campus',
  'Lajpat Nagar','Majnu Ka Tilla','Saket','Dilli Haat','Karol Bagh','Chandni Chowk'
];

const SEED_SCENES = [
  { id:'seed1', name:'Rahul K.', college:'Hansraj College', text:'Karan Aujla concert this Friday — got 1 extra ticket. Koi hai jo join karna chahta ho? 🔥', vibe:'concert', area:'Connaught Place', when:'This weekend', downCount:7, downedBy:[], messages:[], timestamp: Date.now()-1000*60*12, avatarColor:0 },
  { id:'seed2', name:'Priya V.', college:'Miranda House', text:'We\'re 3 girls headed to Kamla Nagar for chai & momos. Koi bhi join kar sakti hai ☕', vibe:'chill', area:'Kamla Nagar', when:'In 1 hour', downCount:4, downedBy:[], messages:[], timestamp: Date.now()-1000*60*28, avatarColor:1 },
  { id:'seed3', name:'Arjun S.', college:'SRCC', text:'Solo at this café in CP, raining outside, looks like a good adda day. Koi aana chahega? 🌧️', vibe:'chill', area:'Connaught Place', when:'Right now', downCount:2, downedBy:[], messages:[], timestamp: Date.now()-1000*60*45, avatarColor:2 },
  { id:'seed4', name:'Neha R.', college:'LSR', text:'Anyone up for badminton at DU sports complex? We need 2 more for doubles 🏸', vibe:'sports', area:'North Campus', when:'This evening', downCount:3, downedBy:[], messages:[], timestamp: Date.now()-1000*60*60, avatarColor:5 },
  { id:'seed5', name:'Dev M.', college:'Hindu College', text:'Econ paper Monday hai, stress mein hoon. Library mein study group banate hain? 📚 Coffee chalega', vibe:'study', area:'North Campus', when:'Tonight', downCount:5, downedBy:[], messages:[], timestamp: Date.now()-1000*60*90, avatarColor:3 },
  { id:'seed6', name:'Ananya T.', college:'Ramjas College', text:'Hauz Khas Village mein kuch khaana chahte ho? Group of 4 already, 2 aur chahiye 🍕', vibe:'food', area:'Hauz Khas', when:'Tonight', downCount:6, downedBy:[], messages:[], timestamp: Date.now()-1000*60*110, avatarColor:4 },
  { id:'seed7', name:'Kabir S.', college:'St. Stephen\'s', text:'Chandni Chowk ghoomne ka plan hai kal — street food aur photography. Koi interested? 📸', vibe:'food', area:'Chandni Chowk', when:'Tomorrow', downCount:8, downedBy:[], messages:[], timestamp: Date.now()-1000*60*150, avatarColor:3 },
  { id:'seed8', name:'Ishaan P.', college:'Kirori Mal', text:'Cricket match Sunday morning, North Campus ground. Need 4 more players 🏏', vibe:'sports', area:'North Campus', when:'This weekend', downCount:5, downedBy:[], messages:[], timestamp: Date.now()-1000*60*200, avatarColor:0 },
];

// =====================
// DATA LAYER
// =====================
const DB = {
  getScenes() {
    try {
      const stored = JSON.parse(localStorage.getItem('adda_scenes') || '[]');
      const ids = stored.map(s => s.id);
      const missing = SEED_SCENES.filter(s => !ids.includes(s.id));
      const all = [...stored, ...missing];
      // Ensure all scenes have messages array
      all.forEach(s => { if (!s.messages) s.messages = []; });
      return all;
    } catch(e) { return [...SEED_SCENES]; }
  },
  saveScenes(scenes) {
    localStorage.setItem('adda_scenes', JSON.stringify(scenes));
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem('adda_user') || 'null'); }
    catch(e) { return null; }
  },
  saveUser(user) {
    localStorage.setItem('adda_user', JSON.stringify(user));
  },
  getNotifications() {
    try { return JSON.parse(localStorage.getItem('adda_notifs') || '[]'); }
    catch(e) { return []; }
  },
  saveNotifications(notifs) {
    localStorage.setItem('adda_notifs', JSON.stringify(notifs));
  },
  getWaitlist() {
    try { return JSON.parse(localStorage.getItem('adda_waitlist') || '[]'); }
    catch(e) { return []; }
  },
  addToWaitlist(email) {
    const list = this.getWaitlist();
    if (!list.find(e => e.email === email)) {
      list.push({ email, timestamp: Date.now() });
      localStorage.setItem('adda_waitlist', JSON.stringify(list));
    }
  }
};

// =====================
// UTILS
// =====================
const Utils = {
  timeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Abhi abhi';
    if (mins < 60) return `${mins}m pehle`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h pehle`;
    return `${Math.floor(hrs / 24)}d pehle`;
  },
  expiryPct(timestamp) {
    const age = Date.now() - timestamp;
    return Math.max(0, 100 - (age / (1000*60*60*24) * 100));
  },
  initials(name) {
    return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  },
  avatarColor(name) {
    return (name || '').charCodeAt(0) % 6;
  },
  id() {
    return 'sc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  },
  scoreTitle(score) {
    if (score === 0) return 'Naya Banda';
    if (score < 20) return 'Scene Explorer';
    if (score < 50) return 'Regular Yaar';
    if (score < 100) return 'Adda King';
    return 'Legendary 🔥';
  },
  addNotification(notif) {
    const notifs = DB.getNotifications();
    notifs.unshift({ ...notif, id: Utils.id(), timestamp: Date.now(), read: false });
    DB.saveNotifications(notifs.slice(0, 50)); // Keep last 50
  }
};

// =====================
// TOAST
// =====================
let _toastTimer;
function showToast(msg, type = '') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// =====================
// POST SCENE MODAL (shared)
// =====================
function buildPostModal() {
  if (document.getElementById('globalPostModal')) return;
  const html = `
  <div class="modal-overlay" id="globalPostModal">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Scene Banao</span>
        <button class="modal-close" onclick="closePostModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Kya kar raha hai? *</label>
          <textarea class="form-textarea" id="gPostText" placeholder="e.g. Karan Aujla concert ke liye 1 extra ticket hai..." maxlength="160" oninput="gUpdateChar()"></textarea>
          <div style="text-align:right;font-size:0.75rem;color:#aaa;margin-top:4px;font-weight:600;" id="gCharCount">0 / 160</div>
        </div>
        <div class="form-group">
          <label class="form-label">Vibe *</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;" id="gVibeSelector">
            ${Object.entries(VIBES).map(([k,v]) => `
              <div style="border:1.5px solid var(--border);padding:10px;text-align:center;cursor:pointer;transition:all 0.15s;font-size:0.82rem;font-weight:700;color:#666;" class="g-vibe-opt" data-vibe="${k}" onclick="gSelectVibe(this)">
                <span style="display:block;font-size:1.5rem;margin-bottom:4px;">${v.emoji}</span>${v.label}
              </div>`).join('')}
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Kahan? *</label>
            <input class="form-input" id="gPostArea" list="gAreas" placeholder="Kamla Nagar, CP..." />
            <datalist id="gAreas">${AREAS.map(a => `<option value="${a}">`).join('')}</datalist>
          </div>
          <div class="form-group">
            <label class="form-label">Kab? *</label>
            <select class="form-select" id="gPostWhen">
              <option>Right now</option><option>In 1 hour</option><option>This evening</option>
              <option>Tonight</option><option>Tomorrow</option><option>This weekend</option>
            </select>
          </div>
        </div>
        <button class="submit-btn" onclick="gSubmitScene()">Scene Live Karo 🔥</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('globalPostModal').addEventListener('click', e => {
    if (e.target.id === 'globalPostModal') closePostModal();
  });
}

let _gSelectedVibe = '';
function openPostModal() {
  const user = DB.getUser();
  if (!user) { showToast('Pehle login kar bhai 😅', 'error'); openLoginModal(); return; }
  buildPostModal();
  document.getElementById('globalPostModal').classList.add('open');
}
function closePostModal() {
  const m = document.getElementById('globalPostModal');
  if (m) m.classList.remove('open');
}
function gUpdateChar() {
  const txt = document.getElementById('gPostText').value;
  document.getElementById('gCharCount').textContent = `${txt.length} / 160`;
}
function gSelectVibe(el) {
  document.querySelectorAll('.g-vibe-opt').forEach(o => {
    o.style.borderColor = 'var(--border)'; o.style.background = ''; o.style.color = '#666';
  });
  el.style.borderColor = 'var(--saffron)';
  el.style.background = 'rgba(255,107,26,0.06)';
  el.style.color = 'var(--saffron)';
  _gSelectedVibe = el.dataset.vibe;
}
function gSubmitScene() {
  const user = DB.getUser();
  const text = document.getElementById('gPostText').value.trim();
  const area = document.getElementById('gPostArea').value.trim();
  const when = document.getElementById('gPostWhen').value;
  if (!text) return showToast('Kuch toh likho bhai 😅', 'error');
  if (!_gSelectedVibe) return showToast('Vibe select karo', 'error');
  if (!area) return showToast('Kahan ka scene hai?', 'error');
  const scene = {
    id: Utils.id(), name: user.name, college: user.college, text,
    vibe: _gSelectedVibe, area, when, downCount: 0,
    downedBy: [], messages: [], timestamp: Date.now(),
    avatarColor: Utils.avatarColor(user.name)
  };
  const scenes = DB.getScenes();
  scenes.unshift(scene);
  DB.saveScenes(scenes);
  closePostModal();
  document.getElementById('gPostText').value = '';
  document.getElementById('gPostArea').value = '';
  _gSelectedVibe = '';
  document.querySelectorAll('.g-vibe-opt').forEach(o => { o.style.borderColor='var(--border)'; o.style.background=''; o.style.color='#666'; });
  showToast('Scene live ho gaya! 🔥', 'success');
  if (typeof onScenePosted === 'function') onScenePosted(scene);
}

// =====================
// LOGIN MODAL (shared)
// =====================
function buildLoginModal() {
  if (document.getElementById('globalLoginModal')) return;
  const html = `
  <div class="modal-overlay modal-sm" id="globalLoginModal">
    <div class="modal modal-sm">
      <div class="modal-header">
        <span class="modal-title">Adda Mein Aa</span>
        <button class="modal-close" onclick="closeLoginModal()">✕</button>
      </div>
      <div style="padding:32px 24px;">
        <div id="ls-phone">
          <p style="color:#666;font-size:0.9rem;margin-bottom:24px;line-height:1.6;">Apna phone number daal. OTP aayega. Bas itna hi.</p>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <div style="display:flex;">
              <span style="background:#f0f0f0;border:1.5px solid var(--border);border-right:none;padding:12px 16px;font-weight:700;font-size:0.9rem;color:#555;">+91</span>
              <input class="form-input" style="border-left:none;" id="lsPhone" type="tel" maxlength="10" placeholder="9876543210" oninput="this.value=this.value.replace(/\\D/g,'')"/>
            </div>
          </div>
          <button class="submit-btn" onclick="lsSendOTP()">OTP Bhejo →</button>
        </div>
        <div id="ls-otp" style="display:none;">
          <p style="color:#666;font-size:0.9rem;margin-bottom:4px;">OTP gaya <strong id="lsSentTo"></strong> pe.</p>
          <p style="color:#bbb;font-size:0.78rem;margin-bottom:20px;">Demo: koi bhi 4 digit chalega</p>
          <div style="display:flex;gap:10px;justify-content:center;margin-bottom:24px;">
            ${[1,2,3,4].map(i => `<input class="form-input" style="width:54px;height:64px;text-align:center;font-family:'Bebas Neue',sans-serif;font-size:2rem;padding:8px;" maxlength="1" id="lsOtp${i}" oninput="lsOtpNext(this,${i})" />`).join('')}
          </div>
          <button class="submit-btn" onclick="lsVerify()">Verify Karo</button>
        </div>
        <div id="ls-profile" style="display:none;">
          <p style="color:#666;font-size:0.9rem;margin-bottom:24px;">Ek baar bata — phir kabhi nahi poochhenge.</p>
          <div class="form-group">
            <label class="form-label">Tera Naam</label>
            <input class="form-input" id="lsName" placeholder="First name hi kaafi hai" />
          </div>
          <div class="form-group">
            <label class="form-label">Tera College</label>
            <select class="form-select" id="lsCollege">
              <option value="">Select college</option>
              ${COLLEGES.map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
          <button class="submit-btn" onclick="lsComplete()">Adda Mein Aa 🔥</button>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('globalLoginModal').addEventListener('click', e => {
    if (e.target.id === 'globalLoginModal') closeLoginModal();
  });
}

function openLoginModal() {
  buildLoginModal();
  document.getElementById('globalLoginModal').classList.add('open');
}
function closeLoginModal() {
  const m = document.getElementById('globalLoginModal');
  if (m) m.classList.remove('open');
}
function lsSendOTP() {
  const phone = document.getElementById('lsPhone').value;
  if (phone.length !== 10) return showToast('10 digit number daal', 'error');
  document.getElementById('lsSentTo').textContent = '+91 ' + phone;
  document.getElementById('ls-phone').style.display = 'none';
  document.getElementById('ls-otp').style.display = 'block';
}
function lsOtpNext(el, idx) {
  if (el.value.length === 1 && idx < 4) {
    const next = document.getElementById('lsOtp' + (idx + 1));
    if (next) next.focus();
  }
}
function lsVerify() {
  const otp = [1,2,3,4].map(i => document.getElementById('lsOtp'+i).value).join('');
  if (otp.length === 4) {
    document.getElementById('ls-otp').style.display = 'none';
    document.getElementById('ls-profile').style.display = 'block';
  } else showToast('4 digits daal', 'error');
}
function lsComplete() {
  const name = document.getElementById('lsName').value.trim();
  const college = document.getElementById('lsCollege').value;
  const phone = document.getElementById('lsPhone').value;
  if (!name) return showToast('Naam toh daal', 'error');
  if (!college) return showToast('College select karo', 'error');
  const user = { name, college, phone, joinedAt: Date.now() };
  DB.saveUser(user);
  closeLoginModal();
  showToast(`Welcome ${name}! 🎉`, 'success');
  if (typeof onLoginComplete === 'function') onLoginComplete(user);
  else setTimeout(() => location.reload(), 800);
}

// =====================
// UNREAD NOTIFICATIONS BADGE
// =====================
function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const notifs = DB.getNotifications();
  const unread = notifs.filter(n => !n.read).length;
  badge.classList.toggle('show', unread > 0);
}

// =====================
// INIT TOPBAR ACTIVE STATE
// =====================
function initTopbar() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
    else a.classList.remove('active');
  });
  updateNotifBadge();
}

document.addEventListener('DOMContentLoaded', initTopbar);
