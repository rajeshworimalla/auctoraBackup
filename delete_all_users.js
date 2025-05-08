require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

console.log("🔍 DEBUG: SUPABASE_URL =", SUPABASE_URL);
console.log("🔍 DEBUG: SERVICE_ROLE_KEY =", SERVICE_ROLE_KEY ? "Loaded ✅" : "Missing ❌");

const PAGE_SIZE = 10;

async function deleteAllUsers() {
  let usersDeleted = 0;
  let page = 1;

  while (true) {
    const url = `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${PAGE_SIZE}`;
    console.log(`📡 Fetching: ${url}`);

    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`
      }
    });

    const body = await res.json();
    console.log("🛑 Raw API response:", body);

    const users = Array.isArray(body) ? body : body.users || [];
    console.log(`📦 Page ${page}: Retrieved ${users.length} users`);

    if (!Array.isArray(users) || users.length === 0) break;

    for (const user of users) {
      console.log(`🗑️ Attempting to delete ${user.email || user.id}`);

      const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`
        }
      });

      if (deleteRes.ok) {
        console.log(`✅ Successfully deleted: ${user.email}`);
        usersDeleted++;
      } else {
        const errorText = await deleteRes.text();
        console.log(`❌ Failed to delete ${user.email} → ${deleteRes.status}: ${errorText}`);
      }
    }

    page++;
  }

  console.log(`\n🚨 TOTAL USERS DELETED: ${usersDeleted}`);
}

deleteAllUsers().catch(console.error);
