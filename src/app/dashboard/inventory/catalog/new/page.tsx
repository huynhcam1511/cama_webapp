"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, ChevronDown, ImagePlus, Loader2, MapPin, Plus, QrCode, Shirt, Trash2 } from "lucide-react";
import QRScanner from "@/components/qr-scanner";
import WarehouseMapSelector from "@/components/warehouse-map-selector";
import { completeInventoryDeclaration, getInventoryFormOptions, uploadGarmentImage } from "../actions";

type Master = { type: string; code: string; name: string; parent_code: string | null };
type Location = { floor_name: string; shelf_name: string | null; tier_name: string | null };
type SizeLine = { id: string; size_system: "VN" | "CN"; size_code: string; quantity: number; height_note: string; weight_note: string; fit_note: string; purchase_price: number };

const GROUPS = [
  { code: "VC", name: "Váy cưới" }, { code: "SU", name: "Bộ Suit" },
  { code: "JA", name: "Áo Vest nam" }, { code: "QU", name: "Quần lẻ nam" }, { code: "AD", name: "Áo dài" },
  { code: "GI", name: "Giày nam" }, { code: "CV", name: "Cà vạt" }, { code: "PK", name: "Phụ kiện nam" },
];
const FALLBACK_FORMS: Record<string, [string, string][]> = {
  VC: [["S02C", "Đuôi cá"], ["CONG", "Công chúa"], ["CUPI", "Cúp ngực"], ["CHUA", "Chữ A"], ["XO3M", "Xòe 3 mét"]],
  SU: [["SLIM", "Slim (Ôm)"], ["DAI", "Dài"], ["DUOI", "Đuôi tôm"], ["MANG", "Măng tô"], ["SUON", "Form suông"], ["BLAZ", "Dáng Blazer"], ["TUXE", "Tuxedo"]],
  JA: [["VEST", "Áo Vest"], ["BLAZ", "Blazer"], ["SOMI", "Áo sơ mi"]], QU: [["QUAN", "Quần Âu"]], AD: [["AODA", "Áo Dài"]],
  GI: [["TAY", "Giày tây"], ["LOAF", "Loafer"], ["BOOT", "Boot"]], CV: [["BAN", "Cà vạt bản"], ["NO", "Nơ cổ"]], PK: [["KCAP", "Khuy măng sét"], ["THAT", "Thắt lưng"], ["KHAC", "Phụ kiện khác"]],
};
const FALLBACK_MATERIALS: Record<string, [string, string][]> = {
  VC: [["LU", "Lụa"], ["SA", "Satin"], ["RE", "Ren"], ["DD", "Đính đá"]],
  SU: [["WO", "Wool"], ["KA", "Kaki"], ["LI", "Linen"]], JA: [["WO", "Wool"], ["KA", "Kaki"]],
  QU: [["WO", "Wool"], ["KA", "Kaki"]], AD: [["LU", "Lụa"], ["GA", "Gấm"], ["RE", "Ren"]],
  GI: [["DA", "Da"], ["GDA", "Giả da"], ["VAI", "Vải"]], CV: [["LUA", "Lụa"], ["POLY", "Polyester"]], PK: [["DA", "Da"], ["KL", "Kim loại"], ["VAI", "Vải"]],
};
const FALLBACK_COLORS: Record<string, [string, string][]> = {
  VC: [["WH", "Trắng"], ["IV", "Kem/Ivory"]],
  SU: [["BK", "Đen"], ["NV", "Xanh navy"], ["GY", "Xám"], ["CH", "Xám than"], ["LG", "Xám sáng"], ["BE", "Be"], ["BR", "Nâu"], ["DB", "Nâu đậm"], ["WH", "Trắng"], ["IV", "Kem/Ivory"], ["RB", "Xanh royal"], ["SB", "Xanh da trời"], ["BU", "Đỏ burgundy"], ["OL", "Xanh olive"]],
  JA: [["BK", "Đen"], ["NV", "Xanh navy"], ["GY", "Xám"], ["CH", "Xám than"], ["LG", "Xám sáng"], ["BE", "Be"], ["BR", "Nâu"], ["WH", "Trắng"], ["RB", "Xanh royal"], ["BU", "Đỏ burgundy"], ["OL", "Xanh olive"]],
  QU: [["BK", "Đen"], ["NV", "Xanh navy"], ["GY", "Xám"], ["CH", "Xám than"], ["BE", "Be"], ["BR", "Nâu"]], AD: [["RD", "Đỏ"], ["WH", "Trắng"]],
  GI: [["BK", "Đen"], ["BR", "Nâu"], ["DB", "Nâu đậm"], ["WH", "Trắng"]], CV: [["BK", "Đen"], ["NV", "Xanh navy"], ["RD", "Đỏ"], ["BU", "Đỏ burgundy"], ["GY", "Xám"], ["BE", "Be"]], PK: [["BK", "Đen"], ["BR", "Nâu"], ["SV", "Bạc"], ["GD", "Vàng"]],
};
const SUIT_PRODUCT_TYPES: [string, string][] = [["BT", "Bộ Suit thường"], ["BS", "Bộ Big Size"], ["AT", "Áo thời trang"], ["AL", "Áo lẻ"], ["QL", "Quần lẻ"], ["GL", "Gile"]];
const SUIT_BUTTONS: [string, string][] = [["1C", "Áo 1 cúc"], ["2C", "Áo 2 cúc"], ["2H2C", "2 hàng 2 cúc"], ["2H4C", "2 hàng 4 cúc"], ["2H6C", "2 hàng 6 cúc"]];
const SUIT_PATTERNS: [string, string][] = [["TR", "Trơn"], ["K", "Kẻ"], ["CA", "Caro"], ["SO", "Sọc"], ["HO", "Họa tiết khác"]];
const SUIT_COLLAR_TYPES: [string, string][] = [["CO_LA", "Cổ lá"], ["CO_K", "Cổ K"], ["CO_TRON", "Cổ tròn"], ["CO_VUONG", "Cổ vuông"], ["CO_THOI_TRANG", "Cổ thời trang"], ["CO_NHUNG", "Cổ nhung"]];
const SUIT_COLLAR_DETAILS: [string, string][] = [["BONG", "Cổ bóng"], ["K_BONG", "Cổ không bóng"], ["BONG_VIEN", "Cổ bóng viền chỉ"], ["K_BONG_VIEN", "Cổ không bóng viền chỉ"]];
const SUIT_VELVET_COLLAR_DETAILS: [string, string][] = [["VE_TRON", "Ve tròn"], ["VE_LA", "Ve lá"], ["VE_K", "Ve K"], ["VE_VUONG", "Ve vuông"]];

const newLine = (system: "VN" | "CN" = "VN"): SizeLine => ({ id: crypto.randomUUID(), size_system: system, size_code: "", quantity: 1, height_note: "", weight_note: "", fit_note: "", purchase_price: 0 });

const normalizeFloor = (floor: string) => floor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const zoneForFloor = (floor: string) => {
  const value = normalizeFloor(floor);
  if (/\b(3|iii)\b/.test(value)) return "MEN_VIP";
  if (/\b(2|ii)\b/.test(value)) return "MEN";
  if (value.includes("tret") || value.includes("ground") || /\b(1|i)\b/.test(value)) return "BRIDAL";
  return "ALL";
};
const GROUP_CODES_BY_ZONE: Record<string, string[]> = {
  BRIDAL: ["VC", "AD"],
  MEN: ["SU", "JA", "QU", "GI", "CV", "PK"],
  MEN_VIP: ["SU", "JA", "QU", "GI", "CV", "PK"],
  ALL: GROUPS.map(group => group.code),
};

export default function InventoryDeclarationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [master, setMaster] = useState<Master[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locationScannerOpen, setLocationScannerOpen] = useState(false);
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [locationLocked, setLocationLocked] = useState(false);
  const [missingFactoryCode, setMissingFactoryCode] = useState(false);
  const [generatedFactoryCode, setGeneratedFactoryCode] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tagPreview, setTagPreview] = useState("");
  const imageInputs = useRef<Array<HTMLInputElement | null>>([]);
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const tagCameraInput = useRef<HTMLInputElement>(null);
  const tagGalleryInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    location_floor: params.get("floor") || "", location_shelf: params.get("shelf") || "", location_tier: params.get("tier") || "",
    group_type: "VC", style_details: "", material_pattern: "", color_code: "", color_name: "", name: "", factory_code: "",
    suit_product_type: "", button_style: "", pattern_code: "", collar_type: "", collar_detail: "",
    imageUrls: [] as string[], tag_image_url: "", supplier: "", notes: "", fit_note: "",
  });
  const [sizeLines, setSizeLines] = useState<SizeLine[]>([newLine()]);

  useEffect(() => {
    const savedLocation = window.localStorage.getItem("cama-inventory-work-location");
    if (savedLocation && !params.get("floor")) {
      try {
        const location = JSON.parse(savedLocation);
        setForm(prev => ({ ...prev, ...location }));
        if (params.get("step") === "product" && location.location_floor && location.location_shelf) setLocationLocked(true);
      } catch { window.localStorage.removeItem("cama-inventory-work-location"); }
    } else if (params.get("floor") && params.get("shelf")) {
      setLocationLocked(true);
    }
    getInventoryFormOptions().then((res) => {
      if (res.success) { setMaster((res.masterData || []) as Master[]); setLocations((res.locations || []) as Location[]); }
      else setMessage(res.error || "Không tải được dữ liệu nền.");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const hasLocationInUrl = Boolean(params.get("floor") && params.get("shelf"));
    if (params.get("step") !== "product" && !hasLocationInUrl) setLocationLocked(false);
  }, [params]);

  const hasAutoOpenedScanner = useRef(false);
  useEffect(() => {
    if (!loading && !locationLocked && !hasAutoOpenedScanner.current) {
      setLocationScannerOpen(true);
      hasAutoOpenedScanner.current = true;
    }
  }, [loading, locationLocked]);

  const floors = useMemo(() => Array.from(new Set(locations.map(x => x.floor_name))), [locations]);
  const shelves = useMemo(() => Array.from(new Set(locations.filter(x => x.floor_name === form.location_floor).map(x => x.shelf_name).filter(Boolean))) as string[], [locations, form.location_floor]);
  const tiers = useMemo(() => Array.from(new Set(locations.filter(x => x.floor_name === form.location_floor && x.shelf_name === form.location_shelf).map(x => x.tier_name).filter(Boolean))) as string[], [locations, form.location_floor, form.location_shelf]);
  const shelfHasTiers = tiers.length > 0;
  const locationZone = useMemo(() => zoneForFloor(form.location_floor), [form.location_floor]);
  const allowedGroups = useMemo(() => GROUPS.filter(group => GROUP_CODES_BY_ZONE[locationZone].includes(group.code)), [locationZone]);
  const isVipZone = locationZone === "MEN_VIP";

  useEffect(() => {
    if (!form.location_floor || allowedGroups.some(group => group.code === form.group_type)) return;
    setForm(prev => ({ ...prev, group_type: allowedGroups[0]?.code || "", style_details: "", material_pattern: "", color_code: "", color_name: "", suit_product_type: "", button_style: "", pattern_code: "", collar_type: "", collar_detail: "" }));
  }, [allowedGroups, form.group_type, form.location_floor]);
  const options = (type: string, parent: string, fallback: Record<string, [string, string][]>) => {
    const rows = master.filter(x => x.type === type && x.parent_code === parent).map(x => ({ code: x.code, name: x.name }));
    const defaults = (fallback[parent] || []).map(([code, name]) => ({ code, name }));
    return [...rows, ...defaults.filter(item => !rows.some(row => row.code === item.code))];
  };
  const forms = options("GARMENT_FORM", form.group_type, FALLBACK_FORMS);
  const materials = options("MATERIAL", form.group_type, FALLBACK_MATERIALS);
  const colors = options("COLOR", form.group_type, FALLBACK_COLORS);
  const sizeChoices = (line: SizeLine) => {
    const rows = master.filter(x => x.type === "SIZE" && x.parent_code === `${form.group_type}:${line.size_system}`);
    const masterSizes = rows.map(x => x.code);
    if (form.group_type === "GI") return ["38", "39", "40", "41", "42", "43", "44", "45"];
    if (form.group_type === "CV" || form.group_type === "PK") return ["FREE"];
    const defaults = form.group_type === "QU"
      ? ["28", "30", "32", "34", "36", "38", "40"]
      : ["XS", "S", "M", "L", "XL", "2XL", "3XL", "44", "46", "48", "50", "52", "54", "56", "58", "60"];
    return Array.from(new Set([...masterSizes, ...defaults]));
  };
  const effectiveFactoryCode = missingFactoryCode ? generatedFactoryCode : form.factory_code;
  const previewSku = [
    form.group_type || "NHÓM",
    ...(form.group_type === "SU" ? [form.suit_product_type || "LOẠI"] : []),
    form.style_details || "FORM",
    (form.group_type === "SU" ? form.pattern_code : form.material_pattern) || "CHẤT_LIỆU",
    form.color_code || "MÀU",
    effectiveFactoryCode || "MÃ"
  ].join("-");

  const uploadFile = async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    const result = await uploadGarmentImage(body);
    if (!result.success || !result.path) throw new Error(result.error || "Không tải được ảnh.");
    return result.path;
  };

  const handleProductImage = async (file?: File, replaceIndex?: number) => {
    if (!file) return;
    setUploading(true); setMessage("");
    try {
      const url = await uploadFile(file);
      const preview = URL.createObjectURL(file);
      setForm(prev => {
        const next = [...prev.imageUrls];
        if (replaceIndex === undefined || replaceIndex >= next.length) next.push(url); else next[replaceIndex] = url;
        return { ...prev, imageUrls: next.slice(0, 5) };
      });
      setImagePreviews(prev => { const next = [...prev]; if (replaceIndex === undefined || replaceIndex >= next.length) next.push(preview); else next[replaceIndex] = preview; return next.slice(0, 5); });
    } catch (e: any) { setMessage(`Tải ảnh thất bại: ${e.message}`); }
    setUploading(false);
  };

  const handleGalleryImages = async (files?: FileList | null) => {
    if (!files?.length) return;
    const remaining = Math.max(0, 5 - form.imageUrls.length);
    for (const file of Array.from(files).slice(0, remaining)) await handleProductImage(file);
  };

  const handleTagImage = async (file?: File) => {
    if (!file) return;
    setUploading(true); setMessage("");
    try { const url = await uploadFile(file); setForm(prev => ({ ...prev, tag_image_url: url })); setTagPreview(URL.createObjectURL(file)); }
    catch (e: any) { setMessage(`Tải ảnh mác thất bại: ${e.message}`); }
    setUploading(false);
  };

  const updateLine = (id: string, patch: Partial<SizeLine>) => setSizeLines(lines => lines.map(line => line.id === id ? { ...line, ...patch } : line));

  const lockLocation = () => {
    if (!form.location_floor || !form.location_shelf) return setMessage("Vui lòng chọn Lầu/Tầng và Kệ/Sào.");
    if (shelfHasTiers && !form.location_tier) return setMessage("Kệ/Sào này có chia ngăn. Vui lòng chọn Ngăn/Móc.");
    const location = { location_floor: form.location_floor, location_shelf: form.location_shelf, location_tier: shelfHasTiers ? form.location_tier : "" };
    window.localStorage.setItem("cama-inventory-work-location", JSON.stringify(location));
    setLocationLocked(true); setMessage("");
    router.push("/dashboard/inventory/catalog/new?step=product");
  };

  const handleMapSelect = (floor: string, shelf: string, tier: string) => {
    setForm(prev => ({ ...prev, location_floor: floor, location_shelf: shelf, location_tier: tier }));
    setIsMobileMapOpen(false);
  };
  const applyScannedLocation = (decodedText: string) => {
    try {
      const url = new URL(decodedText, window.location.origin);
      const floor = url.searchParams.get("floor") || "";
      const shelf = url.searchParams.get("shelf") || "";
      const tier = url.searchParams.get("tier") || "";
      const exists = locations.some(location => location.floor_name === floor && location.shelf_name === shelf && (location.tier_name || "") === tier);
      if (!floor || !shelf || !exists) throw new Error();
      const location = { location_floor: floor, location_shelf: shelf, location_tier: tier };
      setForm(prev => ({ ...prev, ...location }));
      window.localStorage.setItem("cama-inventory-work-location", JSON.stringify(location));
      setLocationLocked(true);
      setLocationScannerOpen(false);
      setMessage("");
      router.push("/dashboard/inventory/catalog/new?step=product");
    } catch {
      setLocationScannerOpen(false);
      setMessage("Mã QR vị trí không hợp lệ hoặc vị trí không còn tồn tại trong sơ đồ kho.");
    }
  };

  const resetForNext = () => {
    setForm(prev => ({ ...prev, style_details: "", material_pattern: "", color_code: "", color_name: "", name: "", factory_code: "", suit_product_type: "", button_style: "", pattern_code: "", collar_type: "", collar_detail: "", imageUrls: [], tag_image_url: "", supplier: "", notes: "", fit_note: "" }));
    setMissingFactoryCode(false); setGeneratedFactoryCode("");
    setImagePreviews([]); setTagPreview("");
    setSizeLines([newLine()]);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage("");
    if (!form.location_floor || !form.location_shelf) return setMessage("Vui lòng chọn Lầu/Tầng và Kệ/Sào.");
    if (shelfHasTiers && !form.location_tier) return setMessage("Kệ/Sào này có chia ngăn. Vui lòng chọn Ngăn/Móc.");
    if (!effectiveFactoryCode || !form.color_code) return setMessage("Vui lòng nhập mã mẫu trên mác hoặc chọn không tìm thấy mã, sau đó chọn màu sắc.");
    if (form.group_type === "SU" && !form.suit_product_type) return setMessage("Vui lòng chọn loại đồ.");
    if (!form.imageUrls.length || !form.tag_image_url) return setMessage("Vui lòng thêm ảnh sản phẩm và ảnh mác/NSX để đối soát.");
    if (!sizeLines.length || sizeLines.some(x => !x.size_code || x.quantity < 1)) return setMessage("Mỗi dòng size phải có size và số lượng hợp lệ.");
    setSaving(true);
    const result = await completeInventoryDeclaration({
      intake_type: "INITIAL_AUDIT", ...form, factory_code: effectiveFactoryCode, category: GROUPS.find(x => x.code === form.group_type)?.name,
      name: form.name || (form.group_type === "SU" ? `${SUIT_PRODUCT_TYPES.find(([code]) => code === form.suit_product_type)?.[1] || "Suit"} ${effectiveFactoryCode}` : `${GROUPS.find(x => x.code === form.group_type)?.name || "Sản phẩm"} ${effectiveFactoryCode}`),
      image_url: form.imageUrls[0] || "", additional_images: form.imageUrls.slice(1), size_lines: sizeLines,
    });
    setSaving(false);
    if (!result.success) return setMessage(`Không thể hoàn tất: ${result.error}`);
    setMessage(`Đã hoàn tất khai báo ${sizeLines.reduce((sum, x) => sum + x.quantity, 0)} sản phẩm tại vị trí này. Có thể tiếp tục nhập sản phẩm kế tiếp.`);
    resetForNext(); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="lg:grid lg:grid-cols-2 h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
      <div className="overflow-y-auto p-2.5 sm:p-4 md:p-8 pb-28 h-full">
      {message && <div className={`mb-5 px-4 py-3 rounded-xl border ${message.startsWith("Đã hoàn tất") ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>{message}</div>}
      <form onSubmit={submit} className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm p-3 md:p-8 space-y-5 md:space-y-9 relative overflow-hidden">
        <section>
          {locationLocked ? <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3"><MapPin size={18} className="text-indigo-600 shrink-0" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-[10px] uppercase font-bold text-indigo-400"><span>Vị trí phiên nhập</span>{isVipZone && <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">Kho VIP</span>}</div><div className="font-bold text-indigo-800 text-sm truncate">{[form.location_floor, form.location_shelf, form.location_tier].filter(Boolean).join(" › ")}</div></div><button type="button" onClick={() => { setLocationLocked(false); router.push("/dashboard/inventory/catalog/new"); }} className="text-xs font-bold text-indigo-700 px-2 py-1.5 bg-white rounded-lg border border-indigo-200">Đổi</button></div> : <>
          <h2 className="font-black text-base md:text-lg text-slate-800 mb-3 flex items-center gap-2"><MapPin className="text-indigo-600" size={20} /> Chọn vị trí làm việc một lần</h2>
          <div className="grid gap-2 bg-indigo-50/60 border border-indigo-100 p-3 md:p-4 rounded-xl md:rounded-2xl">
            <button type="button" onClick={() => setLocationScannerOpen(true)} className="py-3 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center gap-2"><QrCode size={19} /> Quét QR vị trí kệ</button>
            <div className="text-center text-[11px] font-bold text-slate-400">HOẶC CHỌN TỪ SƠ ĐỒ KHO (MOBILE)</div>
            <button type="button" onClick={() => setIsMobileMapOpen(true)} className="py-3 rounded-xl bg-white border-2 border-indigo-200 text-indigo-700 font-bold flex items-center justify-center gap-2 shadow-sm lg:hidden">
               📍 Mở Sơ đồ kho để chọn
            </button>
            <div className="hidden lg:block text-center text-[11px] font-bold text-indigo-400 bg-indigo-100/50 p-2 rounded-lg">
               👉 Hãy click chọn một vị trí trên sơ đồ kho ở màn hình bên phải
            </div>
            
            {/* Show selected location explicitly */}
            <div className="flex gap-2">
              <input readOnly value={form.location_floor} placeholder="Tầng..." className="field flex-1 bg-white cursor-not-allowed text-xs" />
              <input readOnly value={form.location_shelf} placeholder="Kệ..." className="field flex-1 bg-white cursor-not-allowed text-xs" />
              {shelfHasTiers && <input readOnly value={form.location_tier} placeholder="Ngăn..." className="field flex-1 bg-white cursor-not-allowed text-xs" />}
            </div>
            
            <button type="button" onClick={lockLocation} className="py-3 rounded-xl bg-indigo-600 text-white font-black mt-2">Xác nhận & bắt đầu nhập</button>
            <button type="button" onClick={() => { 
              setForm(prev => ({...prev, location_floor: 'Kho Ảo', location_shelf: '', location_tier: ''})); 
              // Wait for state update then lock
              setTimeout(() => {
                window.localStorage.setItem("cama-inventory-work-location", JSON.stringify({ location_floor: 'Kho Ảo', location_shelf: '', location_tier: '' }));
                setLocationLocked(true); 
                router.push("/dashboard/inventory/catalog/new-v2?step=product");
              }, 100);
            }} className="py-2.5 rounded-xl bg-slate-200 text-slate-600 font-bold mt-1 text-sm">Bỏ qua (Cho vào Kho Ảo)</button>
          </div>
          </>}
        </section>

        {locationLocked && <>
        <section>
          <h2 className="font-black text-base md:text-lg text-slate-800 mb-3">1. Nhận diện nhanh</h2>
          <div className="bg-indigo-50/60 border border-indigo-100 p-3 md:p-4 rounded-xl md:rounded-2xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="label">Nhóm<select value={form.group_type} onChange={e => setForm({ ...form, group_type: e.target.value, style_details: "", material_pattern: "", color_code: "", color_name: "", suit_product_type: "", button_style: "", pattern_code: "", collar_type: "", collar_detail: "" })} className="field"><option value="">Chọn nhóm...</option>{allowedGroups.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
              {form.group_type === "SU" &&
                <label className="label">Loại đồ<select required value={form.suit_product_type} onChange={e => setForm({ ...form, suit_product_type: e.target.value })} className="field"><option value="">Chọn loại...</option>{SUIT_PRODUCT_TYPES.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label>
              }
              <label className="label sm:col-span-2 lg:col-span-1">Màu sắc<select required value={form.color_code} onChange={e => { const c = colors.find(x => x.code === e.target.value); setForm({ ...form, color_code: e.target.value, color_name: c?.name || "" }); }} className="field"><option value="">Chọn màu...</option>{colors.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
              <div className="sm:col-span-2 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between gap-2"><label className="label !text-slate-700">Mã mẫu trên mác</label><button type="button" onClick={() => { const checked = !missingFactoryCode; setMissingFactoryCode(checked); if (checked && !generatedFactoryCode) setGeneratedFactoryCode(`AUTO-${crypto.randomUUID().slice(0, 6).toUpperCase()}`); }} className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${missingFactoryCode ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>{missingFactoryCode ? "Đang dùng mã tự sinh" : "Không có mã"}</button></div><input required={!missingFactoryCode} disabled={missingFactoryCode} value={missingFactoryCode ? generatedFactoryCode : form.factory_code} onChange={e => setForm({ ...form, factory_code: e.target.value.toUpperCase() })} className="field disabled:bg-slate-100 disabled:text-slate-500" placeholder="Ví dụ: J1158-4" /><p className="mt-1.5 text-[10px] font-medium text-slate-400">Tìm: ART NO. / STYLE NUMBER / CODE / TYPE OF GOODS / MODEL</p></div>
            </div>
            <div className="bg-white border border-indigo-200 rounded-xl px-4 py-3"><span className="text-xs text-slate-500 block">MÃ MẪU DỰ KIẾN</span><strong className="font-mono text-indigo-700 text-lg">{previewSku}</strong></div>
          </div>
        </section>

        <section>
          <h2 className="font-black text-base md:text-lg text-slate-800 mb-3">2. Ảnh và thông tin mác</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <div><label className="label mb-2">Ảnh sản phẩm <span className="text-rose-500">*</span> <span className="font-normal text-slate-400">(tối đa 5)</span></label><div className="mb-3"><button type="button" onClick={() => cameraInput.current?.click()} disabled={form.imageUrls.length >= 5 || uploading} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"><Camera size={18} /> Chụp ảnh</button></div><input ref={cameraInput} hidden type="file" accept="image/*" capture="environment" onChange={e => { handleProductImage(e.target.files?.[0]); e.target.value = ""; }} /><input ref={galleryInput} hidden type="file" accept="image/*" multiple onChange={e => { handleGalleryImages(e.target.files); e.target.value = ""; }} /><div className="grid grid-cols-3 gap-2 md:gap-3">{imagePreviews.map((preview, i) => <button key={preview} type="button" onClick={() => imageInputs.current[i]?.click()} className="aspect-[3/4] rounded-lg md:rounded-xl border border-slate-200 bg-slate-50 overflow-hidden relative" aria-label={`Thay ảnh ${i + 1}`}><img src={preview} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" /><input ref={el => { imageInputs.current[i] = el; }} hidden type="file" accept="image/*" onChange={e => handleProductImage(e.target.files?.[0], i)} /></button>)}{imagePreviews.length < 5 && <button type="button" onClick={() => galleryInput.current?.click()} className="aspect-[3/4] rounded-lg md:rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400"><ImagePlus size={20} /><small className="mt-1">Thêm ảnh</small></button>}</div></div>
            <div className="space-y-4">
              <div><label className="label mb-2">Ảnh mác/NSX <span className="text-rose-500">*</span></label><div className="mb-2"><button type="button" onClick={() => tagCameraInput.current?.click()} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold flex gap-1.5 items-center"><Camera size={16} /> Chụp mác</button></div><button type="button" onClick={() => tagGalleryInput.current?.click()} className="w-full max-w-xs aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center" aria-label={tagPreview ? "Thay ảnh mác" : "Thêm ảnh mác"}>{tagPreview ? <img src={tagPreview} alt="Ảnh mác" className="w-full h-full object-cover" /> : <span className="flex flex-col items-center gap-2 text-slate-400 text-xs"><ImagePlus size={22} />Nhấn để thêm ảnh mác/NSX</span>}</button><input ref={tagCameraInput} hidden type="file" accept="image/*" capture="environment" onChange={e => { handleTagImage(e.target.files?.[0]); e.target.value = ""; }} /><input ref={tagGalleryInput} hidden type="file" accept="image/*" onChange={e => { handleTagImage(e.target.files?.[0]); e.target.value = ""; }} /></div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3"><h2 className="font-black text-base md:text-lg text-slate-800">3. Size và số lượng</h2><button type="button" onClick={() => setSizeLines(lines => [...lines, newLine(lines[0]?.size_system || "VN")])} className="text-indigo-700 text-sm font-bold flex items-center gap-1"><Plus size={17} /> Thêm dòng</button></div>
          <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_100px_38px] gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase"><span>Size</span><span>Số lượng</span><span /></div>
            {sizeLines.map((line, index) => <div key={line.id} className={`grid grid-cols-[minmax(0,1fr)_100px_38px] gap-2 items-center px-3 py-2 ${index > 0 ? "border-t border-slate-100" : ""}`}>
              <select aria-label="Size" required value={line.size_code} onChange={e => updateLine(line.id, { size_code: e.target.value })} className="field !mt-0"><option value="">Chọn size...</option>{sizeChoices(line).map(x => <option key={x}>{x}</option>)}</select>
              <input aria-label="Số lượng" required min={1} inputMode="numeric" type="number" value={line.quantity} onChange={e => updateLine(line.id, { quantity: Number(e.target.value) })} className="field !mt-0 text-center font-bold" />
              <button type="button" aria-label="Xóa size" disabled={sizeLines.length === 1} onClick={() => setSizeLines(lines => lines.filter(x => x.id !== line.id))} className="h-10 flex items-center justify-center text-rose-500 disabled:opacity-20"><Trash2 size={18} /></button>
            </div>)}
          </div>
        </section>

        <details className="group rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-black text-slate-800"><span>Thông tin bổ sung <small className="ml-1 font-medium text-slate-400">(không bắt buộc)</small></span><ChevronDown size={20} className="text-slate-400 transition-transform group-open:rotate-180" /></summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-200 bg-white p-4">
            {form.group_type === "SU" ? <>
              <label className="label">Form/kiểu dáng<select value={form.style_details} onChange={e => setForm({ ...form, style_details: e.target.value })} className="field"><option value="">Chọn form...</option>{forms.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
              <label className="label">Kiểu cổ<select value={form.collar_type} onChange={e => setForm({ ...form, collar_type: e.target.value, collar_detail: "" })} className="field"><option value="">Chọn kiểu cổ...</option>{SUIT_COLLAR_TYPES.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label>
              <label className="label">Chi tiết cổ<select value={form.collar_detail} onChange={e => setForm({ ...form, collar_detail: e.target.value })} className="field"><option value="">Chọn chi tiết...</option>{(form.collar_type === "CO_NHUNG" ? SUIT_VELVET_COLLAR_DETAILS : SUIT_COLLAR_DETAILS).map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label>
              <label className="label">Kiểu cúc<select value={form.button_style} onChange={e => setForm({ ...form, button_style: e.target.value })} className="field"><option value="">Chọn kiểu cúc...</option>{SUIT_BUTTONS.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label>
              <label className="label">Họa tiết<select value={form.pattern_code} onChange={e => setForm({ ...form, pattern_code: e.target.value })} className="field"><option value="">Chọn họa tiết...</option>{SUIT_PATTERNS.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label>
            </> : <>
              <label className="label">Form/Chi tiết<select value={form.style_details} onChange={e => setForm({ ...form, style_details: e.target.value })} className="field"><option value="">Chọn form...</option>{forms.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
              <label className="label">Chất liệu<select value={form.material_pattern} onChange={e => setForm({ ...form, material_pattern: e.target.value })} className="field"><option value="">Chọn chất liệu...</option>{materials.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
            </>}
            <label className="label md:col-span-2">Tên sản phẩm <span className="font-normal text-slate-400">(tự tạo nếu trống)</span><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="field" placeholder="Tên dễ nhớ trong nội bộ" /></label>
            <label className="label">Nhà cung cấp/Xưởng/Hãng<input list="suppliers" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="field" placeholder="Chọn hoặc nhập hãng..." /><datalist id="suppliers"><option value="Xilai" /><option value="Morden" /><option value="Hàng may" /><option value="Hàng trung" /><option value="CHRISMAN" /></datalist></label>
            <label className="label">Ghi chú đặc biệt<input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="field" /></label>
          </div>
        </details>
        <div className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-8px_24px_rgba(15,23,42,.08)] md:static md:p-0 md:bg-transparent md:border-0 md:shadow-none md:justify-end md:pt-5 md:border-t"><Link href="/dashboard/inventory/catalog" className="hidden md:block px-6 py-3 rounded-xl bg-slate-100 font-bold text-slate-600">Thoát</Link><button disabled={saving || uploading} className="w-full md:w-auto px-5 md:px-8 py-3 rounded-xl bg-indigo-600 text-white font-black shadow-lg disabled:opacity-50 flex justify-center gap-2 items-center">{saving || uploading ? <Loader2 className="animate-spin" /> : <Shirt size={19} />} {uploading ? "Đang tải ảnh..." : saving ? "Đang lưu..." : "Lưu sản phẩm"}</button></div>
        </>}
      </form>
      </div>

      {/* RIGHT PANE: Map Selector (Desktop) */}
      <div className="hidden lg:block h-full border-l border-slate-200 bg-white p-4">
        <h2 className="font-black text-lg text-slate-800 mb-4 flex items-center gap-2"><MapPin className="text-indigo-600" /> Sơ đồ kho</h2>
        <div className="h-[calc(100%-2rem)]">
          <WarehouseMapSelector 
            onSelectLocation={handleMapSelect} 
            selectedFloor={form.location_floor}
            selectedShelf={form.location_shelf}
            selectedTier={form.location_tier}
          />
        </div>
      </div>
      
      {/* Mobile Map Modal */}
      {isMobileMapOpen && (
        <div className="fixed inset-0 z-[100] bg-white lg:hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between shadow-sm">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><MapPin className="text-indigo-600 w-5 h-5" /> Chọn vị trí</h2>
            <button type="button" onClick={() => setIsMobileMapOpen(false)} className="text-slate-500 font-bold px-3 py-1 bg-slate-100 rounded-lg">Đóng</button>
          </div>
          <div className="flex-1 overflow-hidden p-2">
            <WarehouseMapSelector 
              onSelectLocation={handleMapSelect} 
              selectedFloor={form.location_floor}
              selectedShelf={form.location_shelf}
              selectedTier={form.location_tier}
            />
          </div>
        </div>
      )}

      {locationScannerOpen && <QRScanner title="Quét QR vị trí kệ" instruction="Đưa mã QR dán tại kệ hoặc ngăn vào khung hình." onClose={() => setLocationScannerOpen(false)} onScanSuccess={applyScannedLocation} />}
      <style jsx>{`.field{width:100%;min-height:44px;margin-top:.25rem;padding:.62rem .7rem;border:1px solid #e2e8f0;border-radius:.65rem;background-color:white;outline:none;min-width:0;font-size:.82rem}.field:focus{border-color:#6366f1;box-shadow:0 0 0 3px #e0e7ff}select.field{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .75rem center;background-size:18px;padding-right:2.5rem;cursor:pointer}.label{display:block;font-size:.75rem;font-weight:700;color:#475569}@media(min-width:768px){.field{padding:.7rem .85rem;border-radius:.75rem;font-size:.875rem}select.field{padding-right:2.75rem}.label{font-size:.82rem}}`}</style>
    </div>
  );
}
