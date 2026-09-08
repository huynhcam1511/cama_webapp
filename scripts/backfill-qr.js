const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // Fetch assets with UUID-like QR codes (length > 20)
    const res = await client.query(`
      SELECT gi.id, gi.qr_code, gi.size_code, gi.size, gm.base_sku, gm.factory_code, gm.name
      FROM garments_inventory gi
      LEFT JOIN garment_models gm ON gi.model_id = gm.id
      WHERE LENGTH(gi.qr_code) > 20 OR gi.qr_code LIKE '%-%-%-%-%'
    `);
    
    const assets = res.rows;
    console.log(`Found ${assets.length} assets with old QR codes.`);

    if (assets.length === 0) {
      console.log('No assets to update.');
      return;
    }

    // Determine current max seq for each group to avoid duplicates
    const maxSeqRes = await client.query(`
      SELECT qr_code FROM garments_inventory WHERE LENGTH(qr_code) <= 20
    `);
    const existingQrs = maxSeqRes.rows.map(r => r.qr_code).filter(Boolean);
    const maxSeqMap = new Map();
    
    existingQrs.forEach(qr => {
      const parts = qr.split('-');
      if (parts.length >= 3) {
        const seqStr = parts.pop();
        const base = parts.join('-');
        const seq = parseInt(seqStr, 10);
        if (!isNaN(seq)) {
          maxSeqMap.set(base, Math.max(maxSeqMap.get(base) || 0, seq));
        }
      }
    });

    const updates = [];
    const groupCounters = new Map();

    for (const asset of assets) {
      const modelCode = asset.base_sku || asset.factory_code || 'UNK';
      const sizeCode = asset.size_code || asset.size || 'ONE';
      const baseCode = `${modelCode}-${sizeCode}`;
      
      // Initialize counter for this baseCode if not exists
      if (!groupCounters.has(baseCode)) {
        groupCounters.set(baseCode, maxSeqMap.get(baseCode) || 0);
      }
      
      // Increment counter
      const currentSeq = groupCounters.get(baseCode) + 1;
      groupCounters.set(baseCode, currentSeq);
      
      const paddedSeq = currentSeq.toString().padStart(3, '0');
      const newQrCode = `${baseCode}-${paddedSeq}`;
      
      updates.push({ id: asset.id, newQrCode });
    }

    // Execute updates in a transaction
    await client.query('BEGIN');
    for (const update of updates) {
      await client.query(
        'UPDATE garments_inventory SET qr_code = $1, sku = $1 WHERE id = $2',
        [update.newQrCode, update.id]
      );
    }
    await client.query('COMMIT');

    console.log(`Successfully updated ${updates.length} assets.`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error executing migration:', error);
  } finally {
    await client.end();
  }
}

main();
