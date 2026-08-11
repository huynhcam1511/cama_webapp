const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /setInstallments\(manualPayments\.map\(\(p: any\) => \{[\s\S]*?return \{[\s\S]*?status: p\.status === "COMPLETED" \? "PAID" : \(p\.status \|\| "PENDING"\)\s*};\s*\}\)\);/m;

const replacement = `const mapped = manualPayments.map((p: any, idx: number) => {
          let parsedTitle = p.content || p.title || \`Lần \${idx + 1}\`;
          let parsedBillLink = p.receipt_attachment_url || p.receipt_url || p.billLink || "";
          try {
            const rawStr = p.content || p.notes || "";
            if (rawStr.startsWith("{")) {
              const parsed = JSON.parse(rawStr);
              if (parsed.title) parsedTitle = parsed.title;
              if (parsed.billLink) parsedBillLink = parsed.billLink;
            }
          } catch (e) {}

          return {
            title: parsedTitle,
            amount: p.amount || 0,
            method: p.payment_method || p.method || "TRANSFER",
            billLink: parsedBillLink,
            date: p.payment_date || p.date || "",
            status: p.status === "COMPLETED" ? "PAID" : (p.status || "PENDING")
          };
        });
        
        while (mapped.length < 5) {
          mapped.push({ title: \`Lần \${mapped.length + 1}\`, amount: 0, method: "TRANSFER", billLink: "", date: "", status: "PENDING" });
        }
        setInstallments(mapped);`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Done padding installments on edit load');
