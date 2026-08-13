import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Starting seed orders...");
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    // Fetch contracts that don't have an order yet and are not DRAFT or CANCELLED
    const contractsRes = await client.query(`
      SELECT c.id, c.contract_code, cu.wedding_date 
      FROM contracts c
      LEFT JOIN orders o ON c.id = o.contract_id
      LEFT JOIN customers cu ON c.customer_id = cu.id
      WHERE o.id IS NULL AND c.contract_status NOT IN ('DRAFT', 'CANCELLED', 'ARCHIVED')
    `);
    
    const contracts = contractsRes.rows;
    console.log(`Found ${contracts.length} contracts without orders.`);
    
    // Create orders for them
    for (const c of contracts) {
      // Create random ORD-XXXXXX
      const orderCode = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      await client.query(`
        INSERT INTO orders (order_code, contract_id, service_type, event_date, completion_status)
        VALUES ($1, $2, $3, $4, $5)
      `, [orderCode, c.id, 'Tự động từ HĐ', c.wedding_date || new Date().toISOString(), 'PENDING']);
    }
    
    await client.query("COMMIT");
    console.log("Successfully seeded orders.");
    
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error during seed:", e);
  } finally {
    client.release();
    pool.end();
  }
}

main();
