import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars manually for the script
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim();
  }
});

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function main() {
  const email = 'huynhkiencam151102@gmail.com';
  
  // 1. Check if user exists in Auth
  console.log('Checking auth users...');
  let { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  let user = usersData?.users.find(u => u.email === email);
  
  if (!user) {
    console.log('User not found in Auth. Creating...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: 'Password123!', // Default password
      email_confirm: true,
      user_metadata: { full_name: 'Super Admin' }
    });
    
    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    user = newUser.user;
    console.log('Created user with ID:', user.id);
  } else {
    console.log('Found existing user in Auth with ID:', user.id);
    
    // Reset password just in case they need it
    await supabaseAdmin.auth.admin.updateUserById(user.id, { password: 'Password123!' });
    console.log('Reset password to Password123!');
  }

  // 2. Get SUPER_ADMIN role ID
  console.log('Fetching SUPER_ADMIN role...');
  const { data: role, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('role_code', 'SUPER_ADMIN')
    .single();

  if (roleError || !role) {
    console.error('SUPER_ADMIN role not found in DB. Did the migration run properly?');
    return;
  }

  // 3. Insert or update in public.users
  console.log('Upserting user into public.users...');
  const { error: upsertError } = await supabaseAdmin.from('users').upsert({
    id: user.id,
    email: email,
    employee_code: 'ADMIN-01',
    full_name: 'Huỳnh Kiến Cẩm',
    role_id: role.id,
    is_active: true,
    is_working: true,
    employment_status: 'working'
  });

  if (upsertError) {
    console.error('Error upserting into public.users:', upsertError);
    return;
  }

  console.log('SUCCESS! User has been granted full permissions.');
  console.log('Login Email:', email);
  console.log('Login Password:', 'Password123!');
}

main().catch(console.error);
