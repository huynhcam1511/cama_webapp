const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add events state
content = content.replace(
  'const [contractDate, setContractDate] = useState<string>(new Date().toISOString().split("T")[0]);',
  `const [contractDate, setContractDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Events State
  const [events, setEvents] = useState<{name: string, event_date: string, pickup_date: string, return_date: string, location: string}[]>([
    {name: "", event_date: "", pickup_date: "", return_date: "", location: ""},
    {name: "", event_date: "", pickup_date: "", return_date: "", location: ""},
    {name: "", event_date: "", pickup_date: "", return_date: "", location: ""}
  ]);`
);

// 2. Update services state
content = content.replace(
  'const [services, setServices] = useState<{category: string, detail: string, quantity: number, price: number, notes: string}[]>(',
  'const [services, setServices] = useState<{category: string, detail: string, quantity: number, price: number, notes: string, usage_events: string[]}[]>('
);
content = content.replace(
  '? { category: "Váy cưới", detail: "", quantity: 1, price: 0, notes: "" }',
  '? { category: "Váy cưới", detail: "", quantity: 1, price: 0, notes: "", usage_events: [] }'
);
content = content.replace(
  ': { category: "", detail: "", quantity: 1, price: 0, notes: "" }',
  ': { category: "", detail: "", quantity: 1, price: 0, notes: "", usage_events: [] }'
);

// 3. Update loading logic for events and services
const initialServicesCode = `const loadedServices = parsedNotes.items.map((item: any) => ({
          category: item.category || "",
          detail: item.item_name?.replace(\`\${item.category} - \`, "") || item.item_name || "",
          quantity: item.quantity || 1,
          price: item.unit_price || item.price || 0,
          notes: item.notes || ""
        }));`;
const newInitialServicesCode = `const loadedServices = parsedNotes.items.map((item: any) => ({
          category: item.category || "",
          detail: item.item_name?.replace(\`\${item.category} - \`, "") || item.item_name || "",
          quantity: item.quantity || 1,
          price: item.unit_price || item.price || 0,
          notes: item.notes || "",
          usage_events: item.usage_events || []
        }));`;
content = content.replace(initialServicesCode, newInitialServicesCode);

const pushEmptyServiceCode = 'loadedServices.push({ category: "", detail: "", quantity: 1, price: 0, notes: "" });';
const newPushEmptyServiceCode = 'loadedServices.push({ category: "", detail: "", quantity: 1, price: 0, notes: "", usage_events: [] });';
content = content.replace(pushEmptyServiceCode, newPushEmptyServiceCode);

content = content.replace(
  'setGeneralNotes(parsedNotes.userNotes || "");',
  `setGeneralNotes(parsedNotes.userNotes || "");
      if (initialData.events && Array.isArray(initialData.events) && initialData.events.length > 0) {
        const loadedEvents = [...initialData.events];
        while (loadedEvents.length < 3) loadedEvents.push({name: "", event_date: "", pickup_date: "", return_date: "", location: ""});
        setEvents(loadedEvents.slice(0, 3));
      }`
);

// 4. Update handleSubmit payload for activeItems and events
content = content.replace(
  'notes: s.notes,',
  `notes: s.notes,
      usage_events: s.usage_events,`
);
content = content.replace(
  'payment_due_date: calculatedPaymentDueDate,',
  `payment_due_date: calculatedPaymentDueDate,
      events: events.filter(e => e.name.trim() !== ""),`
);

// 5. Replace handleRemoveService
content = content.replace(
  'updated.push({ category: "", detail: "", quantity: 1, price: 0, notes: "" });',
  'updated.push({ category: "", detail: "", quantity: 1, price: 0, notes: "", usage_events: [] });'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done modifying state and logic');
