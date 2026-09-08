const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/contracts/actions.ts', 'utf-8');

// 1. Fix cancelContract order update
content = content.replace(
  /await supabase\.from\("orders"\)\.update\(\{ status: "CANCELLED", updated_at: new Date\(\)\.toISOString\(\) \}\)\.eq\("contract_id", contractId\);/g,
  'await supabase.from("orders").update({ completion_status: "CANCELLED", updated_at: new Date().toISOString() }).eq("contract_id", contractId);'
);

// 2. Fix createContract sync
content = content.replace(
  /const matchedOrder = reusableOrders\.find\(\(order: any\) => order\.service_type === ev\.name\)\s*\|\|\s*reusableOrders\.find\(\(order: any\) => order\.service_type === "Tự động từ HĐ"\);/g,
  `const matchedOrder = reusableOrders.find((order: any) => order.event_id === eventId)
            || reusableOrders.find((order: any) => order.service_type === ev.name)
            || reusableOrders.find((order: any) => order.service_type === "Tự động từ HĐ");`
);

content = content.replace(
  /notes: `\[EVENT_ID:\$\{eventId\}\].*?`,/g,
  `notes: \`Đơn hàng tự động sinh từ Hợp đồng \${code} cho sự kiện: \${ev.name}\\nNgày diễn ra: \${ev.event_date || "Không có"}\\nNgày giao: \${ev.pickup_date || "Không có"}\\nĐịa điểm: \${ev.location || "Không có"}\`,`
);

content = content.replace(
  /order_code: newCode,\s*contract_id: contract\.id,\s*completion_status: "PENDING",/g,
  `order_code: newCode,
            contract_id: contract.id,
            event_id: eventId,
            completion_status: "PENDING",`
);

// 3. Fix updateContract sync
content = content.replace(
  /const marker = `\[EVENT_ID:\$\{eventId\}\]`;\s*const matchedOrder = existingOrdersArray\.find\(\(o: any\) => String\(o\.notes \|\| ""\)\.includes\(marker\)\)/g,
  `const marker = \`[EVENT_ID:\${eventId}]\`;
          const matchedOrder = existingOrdersArray.find((o: any) => o.event_id === eventId || String(o.notes || "").includes(marker))`
);

content = content.replace(
  /await supabase\.from\("orders"\)\.update\(\{\s*service_type: ev\.name \|\| "Dịch vụ cưới",\s*event_date: ev\.pickup_date \|\| null,\s*return_date: ev\.return_date \|\| null,\s*notes: `\[EVENT_ID:\$\{eventId\}\].*?`,\s*\}\)\.eq\("id", matchedOrder\.id\);/g,
  `await supabase.from("orders").update({
              service_type: ev.name || "Dịch vụ cưới",
              event_id: eventId,
              event_date: ev.pickup_date || null,
              return_date: ev.return_date || null,
            }).eq("id", matchedOrder.id);`
);

fs.writeFileSync('src/app/dashboard/contracts/actions.ts', content);
