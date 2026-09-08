const fs = require('fs');

let rCode = fs.readFileSync('supabase/migrations/20260905000005_reserve_garments_atomic.sql', 'utf-8');
rCode = rCode.replace(/v_contract\.notes/g, "v_contract.notes::jsonb");
rCode = rCode.replace(/COALESCE\(v_contract\.notes::jsonb, '\{\}'::jsonb\)/g, "COALESCE(NULLIF(v_contract.notes::text, ''), '{}')::jsonb");
rCode = rCode.replace(/notes = v_meta/g, "notes = v_meta::text");
fs.writeFileSync('supabase/migrations/20260905000005_reserve_garments_atomic.sql', rCode);

let pCode = fs.readFileSync('supabase/migrations/20260905000006_record_payment_atomic.sql', 'utf-8');
pCode = pCode.replace(/payment_installments \(([\s\S]*?notes[\s\S]*?)\) VALUES \(([\s\S]*?)\);/im, (match, cols, vals) => {
    return match.replace(/jsonb_build_object\([\s\S]*?\)/m, (m) => m + '::text');
});
pCode = pCode.replace(/COALESCE\(v_contract\.notes, '\{\}'::jsonb\)/g, "COALESCE(NULLIF(v_contract.notes, ''), '{}')::jsonb");
pCode = pCode.replace(/notes = v_meta,/g, "notes = v_meta::text,");
pCode = pCode.replace(/WHERE notes->>'request_id'/g, "WHERE notes::jsonb->>'request_id'");
fs.writeFileSync('supabase/migrations/20260905000006_record_payment_atomic.sql', pCode);

console.log('Fixed V2-02 SQL type casts');
