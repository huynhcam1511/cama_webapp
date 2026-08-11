const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add pb-24 to columns so content isn't covered by sticky footer
content = content.replace(
  '<div className="lg:col-span-1 flex flex-col gap-2 md:gap-3 pr-1 pb-1 print:pb-0 print:overflow-visible">',
  '<div className="lg:col-span-1 flex flex-col gap-2 md:gap-3 pr-1 pb-24 print:pb-0 print:overflow-visible">'
);

content = content.replace(
  '<div className="lg:col-span-3 flex flex-col gap-2 md:gap-3 pr-1 pb-1 print:pb-0 min-w-0">',
  '<div className="lg:col-span-3 flex flex-col gap-2 md:gap-3 pr-1 pb-24 print:pb-0 min-w-0">'
);

// 2. Change initial state of installments to 5 items
const oldInstallments = `  const [installments, setInstallments] = useState<{title: string, amount: number, method: string, billLink: string, date: string, filePreviewUrl?: string, status?: string}[]>([
    { title: "Lần 1", amount: 0, method: "TRANSFER", billLink: "", date: new Date().toISOString().split("T")[0], status: "PENDING" },
    { title: "Lần 2", amount: 0, method: "TRANSFER", billLink: "", date: "", status: "PENDING" },
    { title: "Lần 3", amount: 0, method: "TRANSFER", billLink: "", date: "", status: "PENDING" }
  ]);`;

const newInstallments = `  const [installments, setInstallments] = useState<{title: string, amount: number, method: string, billLink: string, date: string, filePreviewUrl?: string, status?: string}[]>([
    { title: "Lần 1", amount: 0, method: "TRANSFER", billLink: "", date: new Date().toISOString().split("T")[0], status: "PENDING" },
    { title: "Lần 2", amount: 0, method: "TRANSFER", billLink: "", date: "", status: "PENDING" },
    { title: "Lần 3", amount: 0, method: "TRANSFER", billLink: "", date: "", status: "PENDING" },
    { title: "Lần 4", amount: 0, method: "TRANSFER", billLink: "", date: "", status: "PENDING" },
    { title: "Lần 5", amount: 0, method: "TRANSFER", billLink: "", date: "", status: "PENDING" }
  ]);`;

content = content.replace(oldInstallments, newInstallments);

fs.writeFileSync(file, content, 'utf8');
console.log('Done fixing footer overlap and increasing default installments to 5');
