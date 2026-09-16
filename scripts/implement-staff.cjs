const fs=require('fs');const path='src/app/dashboard/schedules/staff/staff-schedules-view.tsx';let s=fs.readFileSync(path,'utf8').replace(/\r\n/g,'\n');
s=s.replace('useState, useOptimistic, useTransition, useMemo','useState, useOptimistic, useTransition, useMemo, useEffect');
s=s.replace('import { StaffSchedule,','import Link from "next/link";\nimport { useRouter } from "next/navigation";\nimport WeeklyRegistration from "./weekly-registration";\nimport OffLimits from "./off-limits";\nimport { StaffSchedule, getStaffSchedules,');
s=s.replace('  const [currentDate', '  const router = useRouter();\n  const [error, setError] = useState("");\n  const [loadedSchedules, setLoadedSchedules] = useState(initialSchedules);\n  const [currentDate');
s=s.replace('    initialSchedules,','    loadedSchedules,');
s=s.replace('  // Filtering users', `  useEffect(() => {
    let active = true;
    const start = startOfWeek(currentDate, {weekStartsOn:1}); const end = endOfWeek(currentDate, {weekStartsOn:1});
    Promise.all([getStaffSchedules(start.getMonth()+1,start.getFullYear()),getStaffSchedules(end.getMonth()+1,end.getFullYear())]).then(results=>{
      if(active) {setLoadedSchedules(Array.from(new Map(results.flat().map(row=>[row.id,row])).values()));setError('');}
    }).catch(e=>{if(active){setLoadedSchedules([]);setError(e.message);}});
    return ()=>{active=false;};
  }, [currentDate, initialSchedules]);
  // Filtering users`);
s=s.replace(/      startTransition\(\(\) => \{\n        updateOptimisticSchedules\(\{\n          action: "CREATE",[\s\S]*?      \}\);\n\n/g,'');
s=s.replace('      await createWeeklySchedules([payload]);','      await createWeeklySchedules([payload]);\n      router.refresh();');
s=s.replaceAll('alert("Lỗi: " + error.message);','setError("Lỗi: " + error.message);');
s=s.replace(/  const submitOvertime = async[\s\S]*?  const handleApprove/, '  const handleApprove');
s=s.replace(/    startTransition\(\(\) => \{\n      updateOptimisticSchedules\([\s\S]*?    \}\);\n\n    try \{/, '    try {');
s=s.replace('      await updateApprovalStatus(id, status);','      await updateApprovalStatus(id, status);\n      router.refresh();');
s=s.replace('WORKING: "Đi làm",','WEEKLY_OFF: "OFF tuần", WORKING: "Đi làm",');
s=s.replace('<div className="space-y-6">','<div className="space-y-6">\n      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}\n      <Link href="/dashboard/schedules/overtime" className="inline-block text-sm text-emerald-700 underline">Khai báo & duyệt OT</Link>\n      {permissions.can_create && <WeeklyRegistration />}\n      {permissions.can_update && <OffLimits departments={departments} />}');
s=s.replace('setShowOvertimeModal(true)', 'router.push("/dashboard/schedules/overtime")');
s=s.replace(/      \{\/\* Overtime Modal \*\/\}[\s\S]*?      \{\/\* Filter Modal \*\/\}/,'      {/* Filter Modal */}');
s=s.replace('<option value="ANNUAL_LEAVE">','<option value="WEEKLY_OFF">OFF tuần</option>\n                  <option value="ANNUAL_LEAVE">');
fs.writeFileSync(path,s);
