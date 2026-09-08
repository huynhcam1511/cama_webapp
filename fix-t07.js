const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/orders/actions.ts', 'utf-8');

const searchStr = "let incidents = order.qa_incidents || [];";
const replaceStr = `const { data: user } = await supabase.auth.getUser();
  const userId = user?.user?.id;
  
  const { error } = await supabase.from('order_incidents').insert({
    order_id: orderId,
    contract_id: contractId,
    description: incidentData.description,
    penalty_amount: incidentData.penalty_amount || 0,
    deduct_amount: incidentData.deductAmount || 0,
    extra_amount: incidentData.extraAmount || 0,
    status: 'OPEN',
    reported_by: incidentData.created_by_id || userId || null,
  });
  if (error) return { error: error.message };`;

content = content.replace(/let incidents = order\.qa_incidents \|\| \[\];[\s\S]*?if \(error\) return \{ error: error\.message \};/, replaceStr);

fs.writeFileSync('src/app/dashboard/orders/actions.ts', content);
