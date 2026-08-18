"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Camera, ImagePlus, Loader2, MapPin, Plus, ScanText, Shirt, Trash2 } from "lucide-react";
import OCRScanner from "@/components/ocr-scanner";
import { completeInventoryDeclaration, getInventoryFormOptions, uploadGarmentImage } from "../actions";

type Master = { type: string; code: string; name: string; parent_code: string | null };
type Location = { floor_name: string; shelf_name: string | null; tier_name: string | null };
type SizeLine = { id: string; size_system: "VN" | "CN"; size_code: string; quantity: number; height_note: string; weight_note: string; fit_note: string; purchase_price: number };

const GROUPS = [
  { code: "VC", name: "Váy cưới" }, { code: "SU", name: "Bộ Suit" },
  { code: "JA", name: "Áo Vest" }, { code: "QU", name: "Quần lẻ" }, { code: "AD", name: "Áo dài" },
];
const FALLBACK_FORMS: Record<string, [string, string][]> = {
  VC: [["S02C", "Đuôi cá"], ["CONG", "Công chúa"], ["CUPI", "Cúp ngực"], ["CHUA", "Chữ A"], ["XO3M", "Xòe 3 mét"]],
  SU: [["OM", "Form ôm"], ["SUON", "Form suông"], ["BLAZ", "Dáng Blazer"], ["SLIM", "Slim fit"], ["TUXE", "Tuxedo"]],
  JA: [["VEST", "Áo Vest"], ["BLAZ", "Blazer"], ["SOMI", "Áo sơ mi"]], QU: [["QUAN", "Quần Âu"]], AD: [["AODA", "Áo Dài"]],
};
const FALLBACK_MATERIALS: Record<string, [string, string][]> = {
  VC: [["LU", "Lụa"], ["SA", "Satin"], ["RE", "Ren"], ["DD", "Đính đá"]],
  SU: [["WO", "Wool"], ["KA", "Kaki"], ["LI", "Linen"]], JA: [["WO", "Wool"], ["KA", "Kaki"]],
  QU: [["WO", "Wool"], ["KA", "Kaki"]], AD: [["LU", "Lụa"], ["GA", "Gấm"], ["RE", "Ren"]],
};
const FALLBACK_COLORS: Record<string, [string, string][]> = {
  VC: [["WH", "Trắng"], ["IV", "Kem/Ivory"]],
  SU: [["BK", "Đen"], ["NV", "Xanh navy"], ["GY", "Xám"], ["CH", "Xám than"], ["LG", "Xám sáng"], ["BE", "Be"], ["BR", "Nâu"], ["DB", "Nâu đậm"], ["WH", "Trắng"], ["IV", "Kem/Ivory"], ["RB", "Xanh royal"], ["SB", "Xanh da trời"], ["BU", "Đỏ burgundy"], ["OL", "Xanh olive"]],
  JA: [["BK", "Đen"], ["NV", "Xanh navy"], ["GY", "Xám"], ["CH", "Xám than"], ["LG", "Xám sáng"], ["BE", "Be"], ["BR", "Nâu"], ["WH", "Trắng"], ["RB", "Xanh royal"], ["BU", "Đỏ burgundy"], ["OL", "Xanh olive"]],
  QU: [["BK", "Đen"], ["NV", "Xanh navy"], ["GY", "Xám"], ["CH", "Xám than"], ["BE", "Be"], ["BR", "Nâu"]], AD: [["RD", "Đỏ"], ["WH", "Trắng"]],
};
const SUIT_PRODUCT_TYPES: [string, string][] = [["BT", "Bộ Suit thường"], ["BS", "Bộ Big Size"], ["AT", "Áo thời trang"], ["AL", "Áo lẻ"], ["QL", "Quần lẻ"], ["GL", "Gile"]];
const SUIT_BUTTONS: [string, string][] = [["1C", "Áo 1 cúc"], ["2C", "Áo 2 cúc"], ["2H2C", "2 hàng 2 cúc"], ["2H4C", "2 hàng 4 cúc"], ["2H6C", "2 hàng 6 cúc"]];
const SUIT_PATTERNS: [string, string][] = [["TR", "Trơn"], ["K", "Kẻ"], ["CA", "Caro"], ["SO", "Sọc"], ["HO", "Họa tiết khác"]];

const newLine = (system: "VN" | "CN" = "VN"): SizeLine => ({ id: crypto.randomUUID(), size_system: system, size_code: "", quantity: 1, height_note: "", weight_note: "", fit_note: "", purchase_price: 0 });

export default function InventoryDeclarationPage() {
  const params = useSearchParams();
  const [master, setMaster] = useState<Master[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [locationLocked, setLocationLocked] = useState(false);
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
    suit_product_type: "", button_style: "", pattern_code: "",
    imageUrls: [] as string[], tag_image_url: "", supplier: "", notes: "", fit_note: "",
  });
  const [sizeLines, setSizeLines] = useState<SizeLine[]>([newLine()]);

  useEffect(() => {
    const savedLocation = window.localStorage.getItem("cama-inventory-work-location");
    if (savedLocation && !params.get("floor")) {
      try {
        const location = JSON.parse(savedLocation);
        setForm(prev => ({ ...prev, ...location }));
        if (location.location_floor && location.location_shelf && location.location_tier) setLocationLocked(true);
      } catch { window.localStorage.removeItem("cama-inventory-work-location"); }
    } else if (params.get("floor") && params.get("shelf") && params.get("tier")) {
      setLocationLocked(true);
    }
    getInventoryFormOptions().then((res) => {
      if (res.success) { setMaster((res.masterData || []) as Master[]); setLocations((res.locations || []) as Location[]); }
      else setMessage(res.error || "Không tải được dữ liệu nền.");
      setLoading(false);
    });
  }, []);

  const floors = useMemo(() => Array.from(new Set(locations.map(x => x.floor_name))), [locations]);
  const shelves = useMemo(() => Array.from(new Set(locations.filter(x => x.floor_name === form.location_floor).map(x => x.shelf_name).filter(Boolean))) as string[], [locations, form.location_floor]);
  const tiers = useMemo(() => Array.from(new Set(locations.filter(x => x.floor_name === form.location_floor && x.shelf_name === form.location_shelf).map(x => x.tier_name).filter(Boolean))) as string[], [locations, form.location_floor, form.location_shelf]);
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
    if (rows.length) return rows.map(x => x.code);
    if (line.size_system === "CN") return form.group_type === "QU" ? ["28", "30", "32", "34", "36"] : ["44", "46", "48", "50", "52", "54", "56"];
    return ["XS", "S", "M", "L", "XL", "2XL", "3XL", "FREE"];
  };
  const allSizeChoices = (line: SizeLine) => Array.from(new Set([
    ...sizeChoices({ ...line, size_system: "VN" }),
    ...sizeChoices({ ...line, size_system: "CN" }),
  ]));
  const previewSku = form.group_type === "SU"
    ? `${form.factory_code || "MÃ-MÁC"}-${form.button_style || "XC"}-${form.pattern_code || "HT"}${form.color_code || "XX"}`
    : `${form.group_type}-${form.style_details || "XXXX"}-${form.material_pattern || "XX"}-${form.color_code || "XX"}`;

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
    if (!form.location_floor || !form.location_shelf || !form.location_tier) return setMessage("Vui lòng chọn đủ Lầu/Tầng, Kệ/Sào và Ngăn/Móc.");
    const location = { location_floor: form.location_floor, location_shelf: form.location_shelf, location_tier: form.location_tier };
    window.localStorage.setItem("cama-inventory-work-location", JSON.stringify(location));
    setLocationLocked(true); setMessage("");
  };

  const resetForNext = () => {
    setForm(prev => ({ ...prev, style_details: "", material_pattern: "", color_code: "", color_name: "", name: "", factory_code: "", suit_product_type: "", button_style: "", pattern_code: "", imageUrls: [], tag_image_url: "", supplier: "", notes: "", fit_note: "" }));
    setImagePreviews([]); setTagPreview("");
    setSizeLines([newLine()]);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage("");
    if (!form.location_floor || !form.location_shelf || !form.location_tier) return setMessage("Vui lòng chọn đủ Lầu/Tầng, Kệ/Sào và Ngăn/Móc.");
    if (form.group_type === "SU") {
      if (!form.factory_code || !form.suit_product_type || !form.style_details || !form.button_style || !form.pattern_code || !form.color_code) return setMessage("Vui lòng nhập mã mác và chọn đủ phân loại Suit.");
    } else if (!form.style_details || !form.material_pattern || !form.color_code) return setMessage("Vui lòng chọn đủ nhóm, form, chất liệu và màu sắc.");
    if (!sizeLines.length || sizeLines.some(x => !x.size_code || x.quantity < 1)) return setMessage("Mỗi dòng size phải có size và số lượng hợp lệ.");
    setSaving(true);
    const result = await completeInventoryDeclaration({
      intake_type: "INITIAL_AUDIT", ...form, category: GROUPS.find(x => x.code === form.group_type)?.name,
      name: form.name || (form.group_type === "SU" ? `${SUIT_PRODUCT_TYPES.find(([code]) => code === form.suit_product_type)?.[1] || "Suit"} ${form.factory_code}` : ""),
      image_url: form.imageUrls[0] || "", additional_images: form.imageUrls.slice(1), size_lines: sizeLines,
    });
    setSaving(false);
    if (!result.success) return setMessage(`Không thể hoàn tất: ${result.error}`);
    setMessage(`Đã hoàn tất khai báo ${sizeLines.reduce((sum, x) => sum + x.quantity, 0)} sản phẩm tại vị trí này. Có thể tiếp tục nhập sản phẩm kế tiếp.`);
    resetForNext(); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="p-2.5 sm:p-4 md:p-8 max-w-6xl mx-auto pb-28">
      {message && <div className={`mb-5 px-4 py-3 rounded-xl border ${message.startsWith("Đã hoàn tất") ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>{message}</div>}
      <form onSubmit={submit} className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm p-3 md:p-8 space-y-5 md:space-y-9 relative overflow-hidden">
        <section>
          {locationLocked ? <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3"><MapPin size={18} className="text-indigo-600 shrink-0" /><div className="min-w-0 flex-1"><div className="text-[10px] uppercase font-bold text-indigo-400">Vị trí phiên nhập</div><div className="font-bold text-indigo-800 text-sm truncate">{form.location_floor} › {form.location_shelf} › {form.location_tier}</div></div><button type="button" onClick={() => setLocationLocked(false)} className="text-xs font-bold text-indigo-700 px-2 py-1.5 bg-white rounded-lg border border-indigo-200">Đổi</button></div> : <>
          <h2 className="font-black text-base md:text-lg text-slate-800 mb-3 flex items-center gap-2"><MapPin className="text-indigo-600" size={20} /> Chọn vị trí làm việc một lần</h2>
          <div className="grid gap-2 bg-indigo-50/60 border border-indigo-100 p-3 md:p-4 rounded-xl md:rounded-2xl">
            <select required value={form.location_floor} onChange={e => setForm({ ...form, location_floor: e.target.value, location_shelf: "", location_tier: "" })} className="field"><option value="">Chọn Lầu/Tầng...</option>{floors.map(x => <option key={x}>{x}</option>)}</select>
            <select required value={form.location_shelf} onChange={e => setForm({ ...form, location_shelf: e.target.value, location_tier: "" })} className="field"><option value="">Chọn Kệ/Sào...</option>{shelves.map(x => <option key={x}>{x}</option>)}</select>
            <select required value={form.location_tier} onChange={e => setForm({ ...form, location_tier: e.target.value })} className="field"><option value="">Chọn Ngăn/Móc...</option>{tiers.map(x => <option key={x}>{x}</option>)}</select>
            <button type="button" onClick={lockLocation} className="py-3 rounded-xl bg-indigo-600 text-white font-black">Xác nhận & bắt đầu nhập</button>
          </div>
          </>}
        </section>

        {locationLocked && <>
        <section>
          <h2 className="font-black text-base md:text-lg text-slate-800 mb-3">1. Nhận diện nhanh</h2>
          <div className="bg-indigo-50/60 border border-indigo-100 p-3 md:p-4 rounded-xl md:rounded-2xl space-y-3">
            <div className={`grid grid-cols-2 ${form.group_type === "SU" ? "lg:grid-cols-4" : "lg:grid-cols-4"} gap-2 md:gap-3`}>
              <label className="label">Nhóm<select value={form.group_type} onChange={e => setForm({ ...form, group_type: e.target.value, style_details: "", material_pattern: "", color_code: "", color_name: "", suit_product_type: "", button_style: "", pattern_code: "" })} className="field"><option value="">Chọn nhóm...</option>{GROUPS.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
              {form.group_type === "SU" ? <>
                <label className="label">Mã trên mác/NSX<div className="flex gap-1"><input required value={form.factory_code} onChange={e => setForm({ ...form, factory_code: e.target.value.toUpperCase() })} className="field flex-1" placeholder="VD: J1158-4" /><button type="button" onClick={() => setOcrOpen(true)} className="mt-1 px-2 rounded-lg border border-indigo-200 text-indigo-700"><ScanText size={18} /></button></div></label>
                <label className="label">Loại đồ<select required value={form.suit_product_type} onChange={e => setForm({ ...form, suit_product_type: e.target.value })} className="field"><option value="">Chọn loại...</option>{SUIT_PRODUCT_TYPES.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label>
                <label className="label">Form/kiểu dáng<select required value={form.style_details} onChange={e => setForm({ ...form, style_details: e.target.value })} className="field"><option value="">Chọn form...</option>{forms.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
                <label className="label">Kiểu cúc<select required value={form.button_style} onChange={e => setForm({ ...form, button_style: e.target.value })} className="field"><option value="">Chọn kiểu cúc...</option>{SUIT_BUTTONS.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label>
                <label className="label">Họa tiết<select required value={form.pattern_code} onChange={e => setForm({ ...form, pattern_code: e.target.value })} className="field"><option value="">Chọn họa tiết...</option>{SUIT_PATTERNS.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label>
                <label className="label">Màu sắc<select required value={form.color_code} onChange={e => { const c = colors.find(x => x.code === e.target.value); setForm({ ...form, color_code: e.target.value, color_name: c?.name || "" }); }} className="field"><option value="">Chọn màu...</option>{colors.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
              </> : <>
                <label className="label">Form/Chi tiết<select required value={form.style_details} onChange={e => setForm({ ...form, style_details: e.target.value })} className="field"><option value="">Chọn form...</option>{forms.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
                <label className="label">Chất liệu<select required value={form.material_pattern} onChange={e => setForm({ ...form, material_pattern: e.target.value })} className="field"><option value="">Chọn chất liệu...</option>{materials.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
                <label className="label">Màu sắc<select required value={form.color_code} onChange={e => { const c = colors.find(x => x.code === e.target.value); setForm({ ...form, color_code: e.target.value, color_name: c?.name || "" }); }} className="field"><option value="">Chọn màu...</option>{colors.map(x => <option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>
              </>}
            </div>
            <div className="bg-white border border-indigo-200 rounded-xl px-4 py-3"><span className="text-xs text-slate-500 block">MÃ MẪU DỰ KIẾN</span><strong className="font-mono text-indigo-700 text-lg">{previewSku}</strong></div>
          </div>
        </section>

        <section>
          <h2 className="font-black text-base md:text-lg text-slate-800 mb-3">2. Ảnh và thông tin mác</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <div><label className="label mb-2">Ảnh sản phẩm (tối đa 5)</label><div className="grid grid-cols-2 gap-2 mb-3"><button type="button" onClick={() => cameraInput.current?.click()} disabled={form.imageUrls.length >= 5 || uploading} className="py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"><Camera size={18} /> Chụp ảnh</button><button type="button" onClick={() => galleryInput.current?.click()} disabled={form.imageUrls.length >= 5 || uploading} className="py-2.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"><ImagePlus size={18} /> Chọn từ máy</button></div><input ref={cameraInput} hidden type="file" accept="image/*" capture="environment" onChange={e => { handleProductImage(e.target.files?.[0]); e.target.value = ""; }} /><input ref={galleryInput} hidden type="file" accept="image/*" multiple onChange={e => { handleGalleryImages(e.target.files); e.target.value = ""; }} /><div className="grid grid-cols-3 gap-2 md:gap-3">{Array.from({ length: 5 }).map((_, i) => <button key={i} type="button" onClick={() => imageInputs.current[i]?.click()} className="aspect-[3/4] rounded-lg md:rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden relative group">{imagePreviews[i] ? <img src={imagePreviews[i]} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" /> : <span className="flex flex-col items-center text-slate-400"><ImagePlus size={20} /><small className="mt-1">Ảnh {i + 1}</small></span>}<input ref={el => { imageInputs.current[i] = el; }} hidden type="file" accept="image/*" onChange={e => handleProductImage(e.target.files?.[0], i)} /></button>)}</div></div>
            <div className="space-y-4">
              <label className="label">Tên sản phẩm {form.group_type === "SU" && <span className="font-normal text-slate-400">(tự tạo nếu bỏ trống)</span>}<input required={form.group_type !== "SU"} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="field" placeholder={form.group_type === "SU" ? "VD: Suit J1158-4 (không bắt buộc)" : "Ví dụ: Váy cưới đuôi cá đính đá"} /></label>
              {form.group_type !== "SU" && <label className="label">Mã trên mác/NSX<div className="flex gap-2"><input value={form.factory_code} onChange={e => setForm({ ...form, factory_code: e.target.value.toUpperCase() })} className="field flex-1" placeholder="Nhập mã mác hoặc quét OCR" /><button type="button" onClick={() => setOcrOpen(true)} className="px-3 rounded-xl border border-indigo-200 text-indigo-700"><ScanText /></button></div></label>}
              <div><label className="label mb-2">Ảnh mác</label><div className="flex gap-2 mb-2"><button type="button" onClick={() => tagCameraInput.current?.click()} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold flex gap-1.5 items-center"><Camera size={16} /> Chụp mác</button><button type="button" onClick={() => tagGalleryInput.current?.click()} className="px-3 py-2 rounded-lg border border-indigo-200 text-indigo-700 text-xs font-bold flex gap-1.5 items-center"><ImagePlus size={16} /> Chọn ảnh</button></div><div className="w-48 aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center">{tagPreview ? <img src={tagPreview} alt="Ảnh mác" className="w-full h-full object-cover" /> : <span className="text-slate-400 text-xs">Chưa có ảnh mác</span>}</div><input ref={tagCameraInput} hidden type="file" accept="image/*" capture="environment" onChange={e => { handleTagImage(e.target.files?.[0]); e.target.value = ""; }} /><input ref={tagGalleryInput} hidden type="file" accept="image/*" onChange={e => { handleTagImage(e.target.files?.[0]); e.target.value = ""; }} /></div>
              <label className="label">Ghi chú form/dáng<input value={form.fit_note} onChange={e => setForm({ ...form, fit_note: e.target.value })} className="field" placeholder="Dáng ôm, eo cao, cần bóp..." /></label>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3"><h2 className="font-black text-base md:text-lg text-slate-800">3. Size và số lượng</h2><button type="button" onClick={() => setSizeLines(lines => [...lines, newLine(lines[0]?.size_system || "VN")])} className="text-indigo-700 text-sm font-bold flex items-center gap-1"><Plus size={17} /> Thêm dòng</button></div>
          <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_100px_38px] gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase"><span>Size</span><span>Số lượng</span><span /></div>
            {sizeLines.map((line, index) => <div key={line.id} className={`grid grid-cols-[minmax(0,1fr)_100px_38px] gap-2 items-center px-3 py-2 ${index > 0 ? "border-t border-slate-100" : ""}`}>
              <select aria-label="Size" required value={line.size_code} onChange={e => updateLine(line.id, { size_code: e.target.value, size_system: /^\d+$/.test(e.target.value) ? "CN" : "VN" })} className="field !mt-0"><option value="">Chọn size...</option>{allSizeChoices(line).map(x => <option key={x}>{x}</option>)}</select>
              <input aria-label="Số lượng" required min={1} inputMode="numeric" type="number" value={line.quantity} onChange={e => updateLine(line.id, { quantity: Number(e.target.value) })} className="field !mt-0 text-center font-bold" />
              <button type="button" aria-label="Xóa size" disabled={sizeLines.length === 1} onClick={() => setSizeLines(lines => lines.filter(x => x.id !== line.id))} className="h-10 flex items-center justify-center text-rose-500 disabled:opacity-20"><Trash2 size={18} /></button>
            </div>)}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4"><label className="label">Nhà cung cấp/Xưởng<input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="field" /></label><label className="label">Ghi chú lần khai báo<input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="field" /></label></section>
        <div className="fixed bottom-3 left-3 right-3 z-50 flex gap-2 p-2 bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-2xl md:static md:p-0 md:bg-transparent md:border-0 md:shadow-none md:rounded-none md:justify-end md:pt-5 md:border-t"><Link href="/dashboard/inventory/catalog" className="hidden md:block px-6 py-3 rounded-xl bg-slate-100 font-bold text-slate-600">Thoát</Link><button disabled={saving || uploading} className="w-full md:w-auto px-5 md:px-8 py-3 rounded-xl bg-indigo-600 text-white font-black shadow-lg disabled:opacity-50 flex justify-center gap-2 items-center">{saving || uploading ? <Loader2 className="animate-spin" /> : <Shirt size={19} />} {uploading ? "Đang tải ảnh..." : saving ? "Đang lưu..." : "Lưu & nhập sản phẩm tiếp"}</button></div>
        </>}
      </form>
      {ocrOpen && <OCRScanner onClose={() => setOcrOpen(false)} onScan={(text) => { setForm(prev => ({ ...prev, factory_code: text.toUpperCase() })); setOcrOpen(false); }} />}
      <style jsx>{`.field{width:100%;margin-top:.25rem;padding:.62rem .7rem;border:1px solid #e2e8f0;border-radius:.65rem;background:white;outline:none;min-width:0;font-size:.82rem}.field:focus{border-color:#6366f1;box-shadow:0 0 0 3px #e0e7ff}.label{display:block;font-size:.75rem;font-weight:700;color:#475569}@media(min-width:768px){.field{padding:.7rem .85rem;border-radius:.75rem;font-size:.875rem}.label{font-size:.82rem}}`}</style>
    </div>
  );
}
