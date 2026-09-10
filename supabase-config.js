// SafeMind - Configuración de Supabase
// Pega SOLO tu Project URL y tu anon/public key.
// NO pongas aquí la service_role key.

const SUPABASE_URL = "https://gocrpkvldgkntahnyxdq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-afvuoTx_hyYGbIgiEzF6w_5Juq9vdt";

window.SAFEMIND_SUPABASE_CONFIGURED =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PEGA_AQUI") &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes("PEGA_AQUI");

if (window.SAFEMIND_SUPABASE_CONFIGURED) {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
} else {
  console.warn("SafeMind: falta configurar supabase-config.js");
}
