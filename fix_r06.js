const fs = require('fs');

// Patch getOutboundOrders
let obContent = fs.readFileSync('src/app/dashboard/inventory/outbound/actions.ts', 'utf-8');
obContent = obContent.replace('requirePermission("GARMENT_CATALOG", "view")', 'requirePermission("INVENTORY_OUTBOUND", "view")');
fs.writeFileSync('src/app/dashboard/inventory/outbound/actions.ts', obContent);
console.log('Fixed getOutboundOrders');

// Patch Appointments
let appContent = fs.readFileSync('src/app/dashboard/appointments/actions.ts', 'utf-8');

if (!appContent.includes('requirePermission(')) {
  const imports = `import { requirePermission } from "@/lib/rbac";\n`;
  appContent = imports + appContent;
}

appContent = appContent.replace('export async function saveBooking(payload: any) {', 'export async function saveBooking(payload: any) {\n  await requirePermission("APPOINTMENTS", payload.id ? "update" : "create");');
appContent = appContent.replace('export async function getBookingById(id: string) {', 'export async function getBookingById(id: string) {\n  await requirePermission("APPOINTMENTS", "view");');
appContent = appContent.replace('export async function deleteBooking(id: string) {', 'export async function deleteBooking(id: string) {\n  await requirePermission("APPOINTMENTS", "delete");');

fs.writeFileSync('src/app/dashboard/appointments/actions.ts', appContent);
console.log('Fixed Appointments actions');
