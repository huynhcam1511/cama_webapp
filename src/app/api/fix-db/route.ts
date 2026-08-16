import { NextResponse } from 'next/server';
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const sql = `
      ALTER TABLE contracts
      ADD COLUMN IF NOT EXISTS contract_type VARCHAR(20) DEFAULT 'SERVICE' NOT NULL;

      ALTER TABLE contracts
      DROP CONSTRAINT IF EXISTS valid_contract_type;

      ALTER TABLE contracts
      ADD CONSTRAINT valid_contract_type CHECK (contract_type IN ('SERVICE', 'SALES'));

      COMMENT ON COLUMN contracts.contract_type IS 'Loại hợp đồng: SERVICE (Cho thuê/Chụp ảnh) hoặc SALES (Bán lẻ/Bán đứt/Đền bù)';
    `;
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    return NextResponse.json({ 
      message: "DB Fix ran.",
      rpcError: error?.message || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
