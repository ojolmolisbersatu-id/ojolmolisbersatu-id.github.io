/* OMB V2 — app.js
   Fase 2A: login email + password, guard sesi, logout, helper hak akses.
   LEGACY: OMB.setSession (dulu dipakai login ID OMB + PIN) dipertahankan
   tetapi tidak dipakai lagi. */
window.OMB = window.OMB || {};

function toggleMenu(){
  var n = document.querySelector('.navlinks');
  if (n) n.classList.toggle('open');
}

/* Root situs diturunkan dari lokasi app.js, jadi tidak bergantung pada path absolut. */
OMB.root = (function(){
  var s = document.currentScript && document.currentScript.src;
  return s ? s.replace(/assets\/js\/app\.js.*$/, '') : '/';
})();
OMB.url = function(path){ return OMB.root + String(path).replace(/^\//, ''); };

OMB.supabase = null;
OMB.initSupabase = function(){
  if (OMB.supabase || !window.supabase || !window.OMB_CONFIG) return OMB.supabase;
  OMB.supabase = window.supabase.createClient(
    window.OMB_CONFIG.SUPABASE_URL,
    window.OMB_CONFIG.SUPABASE_ANON_KEY
  );
  return OMB.supabase;
};

/* LEGACY — tidak dipakai lagi sejak login email + password. */
OMB.setSession = async function(access_token, refresh_token){
  var sb = OMB.initSupabase();
  if (!sb) throw new Error('Supabase belum siap.');
  var r = await sb.auth.setSession({ access_token: access_token, refresh_token: refresh_token });
  if (r.error) throw r.error;
  return r.data.session;
};

/* ---------- Hak akses (dibaca dari backend: function my_access) ---------- */
OMB.getAccess = async function(){
  var sb = OMB.initSupabase();
  if (!sb) throw new Error('Layanan belum siap. Muat ulang halaman.');
  var res = await sb.rpc('my_access');
  if (res.error) throw res.error;
  return res.data;
};
OMB.isAdminAccess = function(a){
  return !!a && (a.is_super_admin === true || (a.permissions || []).length > 0);
};
OMB.hasPermission = function(a, code){
  return !!a && (a.is_super_admin === true || (a.permissions || []).indexOf(code) !== -1);
};
OMB.isAccountUsable = function(a){
  return !!a && a.is_active !== false && (a.is_super_admin === true || a.has_profile === true);
};
OMB.homeFor = function(a){ return OMB.url(OMB.isAdminAccess(a) ? 'admin/' : 'member/'); };

OMB.validatePassword = function(pw){
  if (!pw || pw.length < 8) return 'Password minimal 8 karakter.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password harus berisi huruf dan angka.';
  return null;
};

OMB.signOut = async function(){
  try { var sb = OMB.initSupabase(); if (sb) await sb.auth.signOut(); } catch (e) {}
  location.href = OMB.url('auth/login/');
};

OMB.blocked = function(message){
  var main = document.querySelector('main') || document.body;
  main.innerHTML = '';
  var card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'margin:24px auto;max-width:560px';
  var p = document.createElement('p');
  p.textContent = message;
  var a = document.createElement('a');
  a.href = '#';
  a.className = 'btn secondary';
  a.setAttribute('data-logout', '');
  a.textContent = 'Keluar';
  card.appendChild(p);
  card.appendChild(a);
  main.appendChild(card);
  document.body.classList.add('omb-ok');
};

/* ---------- Guard sesi ----------
   <body data-guard="member">                         halaman anggota
   <body data-guard="admin" data-permission="x.y">    halaman admin
   Ini hanya mengatur tampilan. Keamanan data tetap ditentukan RLS di Supabase. */
OMB.guard = async function(){
  var body = document.body;
  var mode = body.getAttribute('data-guard');
  if (!mode) return;
  var needPerm = body.getAttribute('data-permission');
  try {
    var sb = OMB.initSupabase();
    if (!sb) throw new Error('Layanan belum siap. Muat ulang halaman.');

    var s = await sb.auth.getSession();
    if (!s.data || !s.data.session) { location.replace(OMB.url('auth/login/')); return; }

    var access = await OMB.getAccess();
    if (!OMB.isAccountUsable(access)) {
      OMB.blocked('Akun Anda belum aktif atau belum terhubung ke data anggota. Hubungi pengurus.');
      return;
    }
    if (access.must_change_password) { location.replace(OMB.url('auth/ganti-password/')); return; }

    if (mode === 'admin') {
      if (!OMB.isAdminAccess(access)) { location.replace(OMB.url('member/')); return; }
      if (needPerm && !OMB.hasPermission(access, needPerm)) {
        OMB.blocked('Anda tidak memiliki izin untuk halaman ini.');
        return;
      }
    }

    OMB.access = access;
    body.classList.add('omb-ok');
    sb.auth.onAuthStateChange(function(event){
      if (event === 'SIGNED_OUT') location.replace(OMB.url('auth/login/'));
    });
    document.dispatchEvent(new CustomEvent('omb:ready', { detail: access }));
  } catch (err) {
    console.error(err);
    OMB.blocked('Gagal memuat hak akses. Muat ulang halaman atau masuk kembali.');
  }
};

document.addEventListener('click', function(e){
  var t = e.target && e.target.closest ? e.target.closest('[data-logout]') : null;
  if (!t) return;
  e.preventDefault();
  OMB.signOut();
});

(function(){
  function run(){ OMB.guard(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
