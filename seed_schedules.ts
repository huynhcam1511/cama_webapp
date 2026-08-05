import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function run() {
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase credentials");
    return;
  }
  
  // Get Users
  const userRes = await fetch(`${supabaseUrl}/rest/v1/users?is_active=eq.true&select=id`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const users = await userRes.json();
  const userIds = users?.map((u: any) => u.id) || [];

  if (userIds.length === 0) {
    console.log("No users found to assign schedules to.");
    return;
  }

  const today = new Date();
  
  const schedules = [];
  const eventTypes = [
    'DRESS_TRY_ON', 'FITTING', 'DRESS_PREPARATION', 
    'CUSTOMER_APPOINTMENT', 'DELIVERY', 'RETURN', 'PICKUP', 'ALTERATION'
  ];

  for (let i = -3; i < 10; i++) {
    for (let j = 0; j < 4; j++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const startHour = 8 + Math.floor(Math.random() * 10);
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
      
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      let title = "";
      switch (type) {
        case 'DELIVERY': title = `Giao đồ cho dâu Nguyễn Thị ${i}${j}`; break;
        case 'RETURN': title = `Trả đồ chụp phóng sự ${i}${j}`; break;
        case 'DRESS_TRY_ON': title = `Thử váy lần 1 ${i}${j}`; break;
        case 'FITTING': title = `Fitting váy cưới ${i}${j}`; break;
        default: title = `Lịch Hẹn ${type} - ${i}${j}`;
      }
      
      schedules.push({
        title,
        date: date.toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime,
        event_type: type,
        customer_name: `Khách Hàng ${i}${j}`,
        customer_phone: `0901234${i}${j}`,
        status: i < 0 ? 'COMPLETED' : 'SCHEDULED',
        primary_assignee_id: userIds[Math.floor(Math.random() * userIds.length)],
        location: `Phòng Váy ${Math.floor(Math.random() * 3) + 1}`,
        notes: "Dữ liệu sinh tự động để test",
        schedule_category: 'MANUAL'
      });
    }
  }

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/operation_schedules`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey, 
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(schedules)
  });

  if (!insertRes.ok) {
    const err = await insertRes.text();
    console.error("Error inserting schedules", err);
  } else {
    console.log("Successfully inserted", schedules.length, "mock schedules.");
  }
}

run();
