import { createClient } from "@/lib/supabase/server";
import EmployeeListView from "./employee-list-view";
import OrgChartView from "./org-chart-view";
import { requirePermission } from "@/lib/rbac";

export default async function EmployeesPage({
  searchParams
}: {
  searchParams: { tab?: string }
}) {
  await requirePermission("EMPLOYEES", "view");

  const supabase = createClient();
  const tab = searchParams.tab || "list";

  const { data: users, error } = await supabase
    .from("users")
    .select(`
      *,
      departments(department_name),
      teams(name),
      positions(position_name),
      roles(role_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  // Common Header & Tab Navigation can be placed in a layout, 
  // but to keep it simple we can render different views.
  // Wait, if we want the Tab Navigation to be shared, we can build a wrapper,
  // but EmployeeListView has its own complex header. We'll add the tabs to EmployeeListView and OrgChartView directly, 
  // or just conditionally render the views and they can have their own tab selectors.
  // Actually, passing the current tab and a unified wrapper is better.

  if (tab === "org-chart") {
    return (
      <div className="space-y-6">
        {/* Tab Navigation Wrapper */}
        <TabNavigation currentTab="org-chart" />
        <OrgChartView users={users || []} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TabNavigation currentTab="list" />
      <EmployeeListView initialUsers={users || []} />
    </div>
  );
}

// A simple local component for tab navigation
function TabNavigation({ currentTab }: { currentTab: string }) {
  return (
    <div className="px-6 pt-6 max-w-[1600px] mx-auto">
      <div className="flex border-b border-slate-200 gap-6">
        <a 
          href="/dashboard/employees?tab=list" 
          className={`pb-3 font-semibold text-sm transition-colors relative ${currentTab === 'list' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Danh sách nhân viên
          {currentTab === 'list' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
          )}
        </a>
        <a 
          href="/dashboard/employees?tab=org-chart" 
          className={`pb-3 font-semibold text-sm transition-colors relative ${currentTab === 'org-chart' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Sơ đồ tổ chức
          {currentTab === 'org-chart' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
          )}
        </a>
      </div>
    </div>
  );
}
