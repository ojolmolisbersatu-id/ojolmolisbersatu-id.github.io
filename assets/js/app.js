window.OMB=window.OMB||{};
function toggleMenu(){document.querySelector('.navlinks')?.classList.toggle('open')}

OMB.supabase = null;
OMB.initSupabase = function(){
  if (OMB.supabase || !window.supabase || !window.OMB_CONFIG) return OMB.supabase;
  OMB.supabase = window.supabase.createClient(
    window.OMB_CONFIG.SUPABASE_URL,
    window.OMB_CONFIG.SUPABASE_ANON_KEY
  );
  return OMB.supabase;
};

OMB.setSession = async function(access_token, refresh_token){
  const sb = OMB.initSupabase();
  if (!sb) throw new Error('Supabase belum siap.');
  const {data,error}=await sb.auth.setSession({access_token,refresh_token});
  if(error) throw error;
  return data.session;
};
