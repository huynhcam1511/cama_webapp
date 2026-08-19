"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ImageIcon, Loader2, MapPin, PackageCheck, Search, X } from "lucide-react";
import { reserveContractInventory, searchContractInventory } from "../actions";

type ContractType = "SERVICE" | "SALES";
type FulfillmentType = "RENTAL" | "SALE";

type InventoryModel = {
  id: string;
  name: string;
  base_sku: string;
  image_url?: string | null;
  location?: string | null;
  sizes: Record<string, number>;
};

export default function InventoryPickerModal({
  isOpen,
  onClose,
  contractId,
  contractType,
  browseOnly = false,
  initialStartDate,
  initialEndDate,
  onSelected,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  contractType: ContractType;
  initialStartDate?: string;
  initialEndDate?: string;
  browseOnly?: boolean;
  onSelected?: (selection: { modelId: string; name: string; baseSku: string; imageUrl?: string | null; location?: string | null; size: string; quantity: number; codes: string[]; productType?: string; startDate?: string; endDate?: string }) => void;
  onSaved: () => void;
}) {
  const fulfillmentType: FulfillmentType = contractType === "SALES" ? "SALE" : "RENTAL";
  const today = new Date().toISOString().slice(0, 10);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [models, setModels] = useState<InventoryModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedModel = useMemo(
    () => models.find((model) => model.id === selectedModelId),
    [models, selectedModelId],
  );
  const maxQuantity = selectedModel?.sizes?.[selectedSize] || 0;

  useEffect(() => {
    if (!isOpen) return;

    if (initialStartDate) setStartDate(initialStartDate);
    if (initialEndDate) setEndDate(initialEndDate);
  }, [isOpen, initialStartDate, initialEndDate]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(async () => {
      if (fulfillmentType === "RENTAL" && (!startDate || !endDate)) return;
      setLoading(true);
      setMessage("");
      const result = await searchContractInventory(search, startDate, endDate, fulfillmentType, contractId || undefined);
      if (result.success) {
        setModels((result.models || []) as InventoryModel[]);
      } else {
        setMessage(result.error || "Không tải được dữ liệu kho.");
      }
      setLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [isOpen, search, startDate, endDate, fulfillmentType]);

  if (!isOpen) return null;

  const chooseModel = (model: InventoryModel) => {
    setSelectedModelId(model.id);
    setSelectedSize(Object.keys(model.sizes || {})[0] || "");
    setQuantity(1);
    setMessage("");
  };

  const submit = async () => {
    if (!selectedModelId || !selectedSize) {
      setMessage("Vui lòng chọn sản phẩm và size.");
      return;
    }

    if (browseOnly) {
      onSelected?.({
        modelId: selectedModelId,
        name: selectedModel?.name || "Sản phẩm kho",
        baseSku: selectedModel?.base_sku || "",
        imageUrl: selectedModel?.image_url,
        location: selectedModel?.location,
        size: selectedSize,
        quantity,
        codes: [],
        startDate: fulfillmentType === "RENTAL" ? startDate : undefined,
        endDate: fulfillmentType === "RENTAL" ? endDate : undefined,
      });
      onSaved();
      return;
    }

    setSaving(true);
    setMessage("");
    const result = await reserveContractInventory({
      contractId,
      modelId: selectedModelId,
      sizeCode: selectedSize,
      quantity,
      startDate: fulfillmentType === "RENTAL" ? startDate : undefined,
      endDate: fulfillmentType === "RENTAL" ? endDate : undefined,
      fulfillmentType,
    });
    setSaving(false);

    if (!result.success) {
      setMessage(result.error || "Không thể giữ sản phẩm.");
      return;
    }
    const reserved = "garments" in result ? (result.garments || []) : [];
    onSelected?.({
      modelId: selectedModelId,
      name: selectedModel?.name || reserved[0]?.product_name || "Sản phẩm kho",
      baseSku: selectedModel?.base_sku || "",
      imageUrl: selectedModel?.image_url,
      location: selectedModel?.location,
      size: selectedSize,
      quantity,
      codes: reserved.map((item: { garment_code?: string }) => item.garment_code).filter(Boolean) as string[],
      productType: reserved[0]?.product_type,
      startDate: fulfillmentType === "RENTAL" ? startDate : undefined,
      endDate: fulfillmentType === "RENTAL" ? endDate : undefined,
    });
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/55 md:items-center md:p-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-4xl md:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b p-4 md:p-5">
          <div>
            <h2 className="text-lg font-black text-slate-900">Chọn sản phẩm từ kho</h2>
            <p className="mt-1 text-xs text-slate-500">
              {fulfillmentType === "SALE"
                ? "Giữ để bán — xuất kho khi giao hoàn tất"
                : "Giữ theo lịch thuê — sản phẩm sẽ quay lại kho"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 border-b bg-slate-50/70 p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
              placeholder="Tìm tên, mã, màu hoặc vị trí kệ..."
            />
          </div>
          {fulfillmentType === "RENTAL" && (
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-bold text-slate-500">
                <span className="mb-1 flex items-center gap-1"><Calendar size={13} /> Ngày lấy</span>
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm" />
              </label>
              <label className="text-xs font-bold text-slate-500">
                <span className="mb-1 flex items-center gap-1"><Calendar size={13} /> Ngày trả</span>
                <input type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm" />
              </label>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-indigo-600" /></div>
          ) : models.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-500">Không có sản phẩm phù hợp hoặc còn khả dụng trong thời gian này.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {models.map((model) => (
                <button
                  type="button"
                  key={model.id}
                  onClick={() => chooseModel(model)}
                  className={`flex gap-3 rounded-2xl border p-3 text-left transition-colors ${selectedModelId === model.id ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100" : "border-slate-200 bg-white hover:border-indigo-200"}`}
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {model.image_url ? <img src={model.image_url} alt={model.name} className="h-full w-full object-cover" /> : <ImageIcon className="m-6 text-slate-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm font-black text-slate-900">{model.name}</div>
                    <code className="mt-1 block truncate text-[11px] text-indigo-600">{model.base_sku}</code>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(model.sizes || {}).map(([size, count]) => (
                        <span key={size} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{size}: {count}</span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-1 truncate text-[11px] text-slate-500"><MapPin size={12} /> {model.location || "Chưa có vị trí"}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedModel && (
          <div className="border-t bg-white p-4">
            <div className="mb-3 grid grid-cols-[1fr_100px] gap-2">
              <label className="text-xs font-bold text-slate-500">
                Size
                <select value={selectedSize} onChange={(event) => { setSelectedSize(event.target.value); setQuantity(1); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm">
                  <option value="">Chọn size</option>
                  {Object.entries(selectedModel.sizes || {}).map(([size, count]) => <option key={size} value={size}>{size} — còn {count}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold text-slate-500">
                Số lượng
                <input type="number" min={1} max={maxQuantity} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(maxQuantity, Number(event.target.value))))} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-center text-sm font-bold" />
              </label>
            </div>
            {message && <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{message}</div>}
            <button type="button" disabled={saving || !selectedSize} onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-black text-white disabled:opacity-50">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <PackageCheck size={18} />}
              {browseOnly ? "Chọn sản phẩm" : fulfillmentType === "SALE" ? "Giữ để bán" : "Giữ sản phẩm"}
            </button>
          </div>
        )}
        {!selectedModel && message && <div className="border-t bg-amber-50 p-3 text-xs text-amber-800">{message}</div>}
      </div>
    </div>
  );
}
