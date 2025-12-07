#!/usr/bin/env node
/**
 * Supabase SQL 执行工具
 * 用法: node scripts/db-query.js "SELECT * FROM users LIMIT 5"
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://axzembhfbmavvklsqsjs.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4emVtYmhmYm1hdnZrbHNxc2pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU4NTQ2NiwiZXhwIjoyMDgwMTYxNDY2fQ.6Bnu4Aft4ZSamE2LbL5UkRI7it7yoNHwO-f5Iouy_wU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeQuery(sql) {
    console.log('Executing SQL:', sql);
    console.log('---');

    try {
        const { data, error } = await supabase.rpc('exec_sql', { query: sql });

        if (error) {
            // RPC 不存在，尝试其他方法
            if (error.message.includes('exec_sql')) {
                console.log('Note: exec_sql RPC not available. Using table queries instead.');
                return null;
            }
            console.error('Error:', error.message);
            return null;
        }

        console.log('Result:', JSON.stringify(data, null, 2));
        return data;
    } catch (e) {
        console.error('Exception:', e.message);
        return null;
    }
}

// 常用查询快捷方式
async function checkDatabase() {
    console.log('=== Database Health Check ===\n');

    // 1. Check auth users
    console.log('1. Auth Users:');
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    console.log(`   Count: ${authUsers?.users?.length || 0}`);
    authUsers?.users?.forEach(u => console.log(`   - ${u.id} (${u.email})`));

    // 2. Check public users
    console.log('\n2. Public Users:');
    const { data: pubUsers, error: pubErr } = await supabase.from('users').select('id, username, display_name');
    if (pubErr) {
        console.log(`   Error: ${pubErr.message}`);
    } else {
        console.log(`   Count: ${pubUsers?.length || 0}`);
        pubUsers?.forEach(u => console.log(`   - ${u.id} (${u.username})`));
    }

    // 3. Check if IDs match
    console.log('\n3. ID Sync Check:');
    const authIds = new Set(authUsers?.users?.map(u => u.id) || []);
    const pubIds = new Set(pubUsers?.map(u => u.id) || []);

    const missingInPublic = [...authIds].filter(id => !pubIds.has(id));
    const extraInPublic = [...pubIds].filter(id => !authIds.has(id));

    if (missingInPublic.length > 0) {
        console.log(`   ⚠️ Missing in public.users: ${missingInPublic.join(', ')}`);
    }
    if (extraInPublic.length > 0) {
        console.log(`   ⚠️ Extra in public.users: ${extraInPublic.join(', ')}`);
    }
    if (missingInPublic.length === 0 && extraInPublic.length === 0) {
        console.log('   ✅ All auth users have corresponding public users');
    }

    // 4. Test function
    console.log('\n4. Function Test:');
    try {
        const { data: fnTest } = await supabase.rpc('generate_username', { display_name: 'Test' });
        console.log(`   generate_username('Test') = ${fnTest}`);
    } catch (e) {
        console.log(`   generate_username test failed: ${e.message}`);
    }
}

// Main
const args = process.argv.slice(2);

if (args[0] === '--check' || args[0] === '-c') {
    checkDatabase();
} else if (args.length > 0) {
    executeQuery(args.join(' '));
} else {
    console.log('Usage:');
    console.log('  node scripts/db-query.js --check              # Run health check');
    console.log('  node scripts/db-query.js "SELECT * FROM ..."  # Run custom SQL');
}
