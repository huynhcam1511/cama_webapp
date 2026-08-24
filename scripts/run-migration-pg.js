const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("Connected to Database.");

    // 1. Create Kho Ảo
    console.log("1. Creating Virtual Warehouse...");
    await client.query(`
      INSERT INTO inventory_locations (floor_name, shelf_name, tier_name, notes) 
      VALUES ('Kho Ảo', NULL, NULL, 'Khu vực lưu trữ tạm thời chờ phân bổ lên kệ thực tế.') 
      ON CONFLICT DO NOTHING;
    `);

    // 2. Count existing items
    const countRes = await client.query(`
      SELECT count(*) FROM garments_inventory WHERE location_floor != 'Kho Ảo' OR location_floor IS NULL;
    `);
    console.log(`2. Moving ${countRes.rows[0].count} products to Kho Ảo...`);

    // 3. Move items
    await client.query(`
      UPDATE garments_inventory
      SET location_floor = 'Kho Ảo', location_shelf = NULL, location_tier = NULL
      WHERE location_floor != 'Kho Ảo' OR location_floor IS NULL;
    `);

    // 4. Delete old locations
    console.log("3. Deleting old locations...");
    await client.query(`
      DELETE FROM inventory_locations WHERE floor_name != 'Kho Ảo';
    `);

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await client.end();
  }
}

runMigration();
