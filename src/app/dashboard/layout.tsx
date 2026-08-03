"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import * as icons from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { MODULE_REGISTRY, getModuleByRoute, getModuleByCode, ModuleGroup, ModuleCode } from "@/config/moduleRegistry";
import QRScanner from "@/components/qr-scanner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isCollapsed = !isPinned && !isHovered;
  const [userProfile, setUserProfile] = useState<{name: string, email: string, initial: string} | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, isLoading } = usePermissions();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('users').select('full_name, email').eq('id', user.id).single();
        if (profile) {
          setUserProfile({
            name: profile.full_name || "Admin Studio",
            email: profile.email || user.email || "",
            initial: (profile.full_name?.substring(0, 2) || "AD").toUpperCase()
          });
        } else {
          setUserProfile({
            name: user.email?.split('@')[0] || "Admin",
            email: user.email || "",
            initial: (user.email?.substring(0, 2) || "AD").toUpperCase()
          });
        }
      }
    };
    fetchUser();
  }, []);

  const GROUP_LABELS: Record<ModuleGroup, string> = {
    DASHBOARD: "TỔNG QUAN",
    BUSINESS: "KINH DOANH",
    FINANCE: "TÀI CHÍNH",
    OPERATIONS: "VẬN HÀNH",
    HR: "Nhân Sự & Đào Tạo",
    ADMIN: "Quản Trị Hệ Thống",
    MARKETING: "Marketing & Nội Dung"
  };

  const SIDEBAR_GROUP_ORDER: ModuleGroup[] = ["DASHBOARD", "BUSINESS", "FINANCE", "OPERATIONS", "HR", "MARKETING", "ADMIN"];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isRouteActive = (route: string, moduleCode: string) => {
    if (!pathname) return false;
    const currentModule = getModuleByRoute(pathname);
    if (!currentModule) return false;
    
    // It's active if we are on the exact route
    return currentModule.moduleCode === moduleCode;
  };

  const sidebarModules = MODULE_REGISTRY.filter(m => m.showInSidebar).sort((a, b) => a.sortOrder - b.sortOrder);

  // Determine current breadcrumb trail
  const currentModule = getModuleByRoute(pathname || "");
  const breadcrumbs = [];
  if (currentModule) {
    breadcrumbs.push(currentModule.label);
  } else {
    breadcrumbs.push(pathname?.split("/").pop()?.replace(/-/g, " ") || "Dashboard");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Desktop (Clean Light Blue / White SaaS Sidebar) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center border-b border-slate-200 shrink-0 relative px-4 overflow-hidden">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 overflow-hidden group whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? 'opacity-0 w-0 -translate-x-4' : 'opacity-100 w-full translate-x-0'
            }`}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">CH</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-slate-800 leading-none group-hover:text-amber-600 transition-colors truncate">
                CAMA HAUTE
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Studio System</span>
            </div>
          </Link>
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className={`absolute right-4 p-1.5 rounded-lg transition-colors hidden md:block shrink-0 ${isPinned ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <icons.Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-6 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Dynamic Sidebar Groups */}
          {SIDEBAR_GROUP_ORDER.map(groupCode => {
            const groupModules = sidebarModules.filter(m => m.group === groupCode);
            const visibleModules = groupModules.filter(m => isLoading || hasPermission(m.moduleCode, "view") || m.route === "/dashboard");
            
            if (visibleModules.length === 0) return null;

            return (
              <div key={groupCode} className="space-y-1 mb-6">
                <div className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 whitespace-nowrap transition-all duration-300 ${
                  isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
                }`}>
                  {GROUP_LABELS[groupCode]}
                </div>
                
                {visibleModules.map(item => {
                  const active = isRouteActive(item.route, item.moduleCode);
                  const Icon = ((icons as any)[item.icon] || (icons as any).LayoutDashboard) as React.ElementType;
                  
                  return (
                    <Link
                      key={item.moduleCode}
                      href={item.route}
                      className={`flex items-center rounded-lg text-sm transition-colors px-3 py-2.5 overflow-hidden ${
                        active
                          ? "font-bold text-blue-700 bg-blue-50"
                          : "font-medium text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? "text-blue-600" : isCollapsed ? "text-slate-500" : "text-slate-400"}`} />
                      <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 -translate-x-4' : 'opacity-100 w-auto translate-x-0 ml-3'}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 overflow-hidden">
          <button
            onClick={handleLogout}
            className={`flex items-center text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full px-3 py-2.5`}
            title="Đăng xuất"
          >
            <icons.LogOut className="w-5 h-5 shrink-0" />
            <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 -translate-x-4' : 'opacity-100 w-auto translate-x-0 ml-3'}`}>
              Đăng xuất
            </span>
          </button>
        </div>
      </aside>

      {/* Main Right Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Quay lại"
            >
              <icons.ArrowLeft className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 ml-2">
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-slate-300">/</span>}
                  <span className={idx === breadcrumbs.length - 1 ? "text-slate-900 font-bold capitalize text-base" : ""}>
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nhanh..."
                className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-48"
              />
            </div>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Quét QR Sản Phẩm"
            >
              <icons.QrCode className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <icons.Bell className="w-4 h-4" />
            </button>

            {userProfile && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-slate-800 leading-none mb-1">{userProfile.name}</span>
                  <span className="text-[10px] text-slate-500 leading-none">{userProfile.email}</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  {userProfile.initial}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {isScannerOpen && (
        <QRScanner 
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={(text) => {
            // Scanner stays open, we just show the alert!
            
            // Mock data for demo
            const MOCK_DB: Record<string, any> = {
              "VC001-M-W-01": { name: "Váy Cưới Công Chúa Ren Pháp", size: "M", color: "Trắng (W)", loc: "Lầu 1 - Kệ A - Tầng 2" },
              "VC001-S-W-01": { name: "Váy Cưới Công Chúa Ren Pháp", size: "S", color: "Trắng (W)", loc: "Lầu 1 - Kệ A - Tầng 2" },
              "VS012-L-B-01": { name: "Suit Nam Tuxedo Đen", size: "L", color: "Đen (B)", loc: "Lầu 2 - Kệ V1 - Tầng 1" },
              "AD005-F-R-01": { name: "Áo Dài Cặp Long Phụng (Nữ)", size: "Free", color: "Đỏ (R)", loc: "Lầu 1 - Kệ C - Tầng 3" },
              "PK001-F-W-01": { name: "Lúp Cô Dâu Đính Đá Cao Cấp", size: "Free", color: "Trắng (W)", loc: "Lầu 3 - Tủ P - Ngăn 1" }
            };

            const garment = MOCK_DB[text];
            if (garment) {
              alert(`✅ TÌM THẤY SẢN PHẨM!\n\nMã: ${text}\nTên: ${garment.name}\nSize: ${garment.size} | Màu: ${garment.color}\nVị trí: ${garment.loc}\n\n(Đây là dữ liệu test để chứng minh QR Code hoạt động)`);
            } else {
              alert(`❌ KHÔNG TÌM THẤY!\n\nMã: ${text}\nSản phẩm này không có trong kho hệ thống.`);
            }
          }}
        />
      )}
    </div>
  );
}
