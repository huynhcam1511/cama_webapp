const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/orders/actions.ts', 'utf-8');
const search = 'import { generateSequentialCode } from "@/utils/code-generator";';
const replacement = `
export type OrderChecklistItem = {
  task: string;
  category: "Thử đồ" | "Chỉnh sửa" | "Vệ sinh" | "Đóng gói" | "Giao nhận" | "Thu hồi";
  done: boolean;
};

export type OrderStatus = "PENDING" | "PREPARING" | "WAITING_FITTING" | "READY_TO_DELIVER" | "DELIVERED" | "WAITING_RETURN" | "COMPLETED" | "ISSUE" | "CANCELLED";

export interface Order {
  id: string;
  order_code: string;
  contract_id: string;
  event_id: string | null;
  event_date: string;
  return_date: string;
  delivery_status: string;
  completion_status: OrderStatus;
  checklist: OrderChecklistItem[];
  notes: string;
  service_type: string;
  pic_id: string | null;
  total_value: number;
  contract: {
    contract_code: string;
    customer: {
      bride_name: string;
      groom_name: string;
      phone: string;
    };
    garments?: any[];
  };
  pic: {
    full_name: string;
    team_id?: string;
  };
}
`;

const idx = content.indexOf(search);
if (idx !== -1) {
  content = content.substring(0, idx + search.length) + '\n\n' + replacement + '\n\n' + content.substring(content.indexOf('export async function fetchOrders'));
  fs.writeFileSync('src/app/dashboard/orders/actions.ts', content);
}
