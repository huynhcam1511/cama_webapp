"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, Loader2, Search } from "lucide-react";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { createOrder } from "../actions";

interface Props {
  users: Array<{ id: string; full_name: string | null; email?: string | null }>;
  contracts?: Array<{
    id: string;
    contract_code: string;
    customer?: { bride_name?: string | null; phone?: string | null } | null;
  }>;
}

type OrderSource = "standalone" | "contract";

const controlClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10";

export default function CreateOrderClient({ users, contracts = [] }: Props) {
  const router = useRouter();
  const [source, setSource] = useState<OrderSource>("standalone");
  const [contractId, setContractId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [picId, setPicId] = useState("");
  const [notes, setNotes] = useState("");
  const [contractSearch, setContractSearch] = useState("");
  const [showContracts, setShowContracts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedContract = contracts.find((contract) => contract.id === contractId);
  const filteredContracts = useMemo(() => {
    const query = contractSearch.trim().toLocaleLowerCase("vi");
    if (!query) return contracts;
    return contracts.filter((contract) =>
      [contract.contract_code, contract.customer?.bride_name, contract.customer?.phone]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase("vi").includes(query)),
    );
  }, [contractSearch, contracts]);

  const changeSource = (next: OrderSource) => {
    setSource(next);
    setError("");
    if (next === "standalone") {
      setContractId("");
      setContractSearch("");
      setShowContracts(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!serviceType.trim()) return setError("Vui lòng nhập tên dịch vụ hoặc sự kiện.");
    if (source === "contract" && !contractId) return setError("Vui lòng chọn hợp đồng.");

    setIsSubmitting(true);
    try {
      await createOrder({
        contract_id: source === "contract" ? contractId : null,
        service_type: serviceType.trim(),
        event_date: eventDate || null,
        delivery_time: deliveryTime || null,
        pic_id: picId || null,
        notes: notes.trim(),
      });
      router.push("/dashboard/orders");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tạo đơn. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} aria-label="Quay lại" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Tạo đơn hàng</h1>
          <p className="mt-0.5 text-sm text-slate-500">Mã đơn được cấp tự động sau khi lưu.</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-6">
          <label className="mb-2 block text-sm font-semibold text-slate-800">Loại đơn</label>
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            <button type="button" onClick={() => changeSource("standalone")} className={`h-9 rounded-md text-sm font-medium transition ${source === "standalone" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Đơn lẻ
            </button>
            <button type="button" onClick={() => changeSource("contract")} className={`h-9 rounded-md text-sm font-medium transition ${source === "contract" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Theo hợp đồng
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">{source === "standalone" ? "Đơn độc lập, không liên kết hợp đồng." : "Đơn được liên kết với một hợp đồng có sẵn."}</p>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          {source === "contract" && (
            <div>
              <FieldLabel required>Hợp đồng</FieldLabel>
              <div className="relative">
                <button type="button" onClick={() => setShowContracts((open) => !open)} className={`${controlClass} flex items-center justify-between text-left`}>
                  <span className={selectedContract ? "truncate" : "text-slate-400"}>{selectedContract ? `${selectedContract.contract_code} — ${selectedContract.customer?.bride_name || "Chưa có tên khách"}` : "Chọn hợp đồng"}</span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                </button>
                {showContracts && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    <div className="relative border-b border-slate-100 p-2">
                      <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input autoFocus value={contractSearch} onChange={(e) => setContractSearch(e.target.value)} placeholder="Tìm mã HĐ, tên khách, số điện thoại" className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-600" />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                      {filteredContracts.length ? filteredContracts.map((contract) => (
                        <button key={contract.id} type="button" onClick={() => { setContractId(contract.id); setShowContracts(false); setContractSearch(""); }} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-slate-50">
                          <span className="min-w-0"><span className="block text-sm font-medium text-slate-800">{contract.contract_code}</span><span className="block truncate text-xs text-slate-500">{contract.customer?.bride_name || "Chưa có tên khách"}{contract.customer?.phone ? ` · ${contract.customer.phone}` : ""}</span></span>
                          {contract.id === contractId && <Check className="ml-2 h-4 w-4 shrink-0 text-emerald-600" />}
                        </button>
                      )) : <p className="px-3 py-6 text-center text-sm text-slate-500">Không tìm thấy hợp đồng.</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <FieldLabel required>Dịch vụ / tên sự kiện</FieldLabel>
            <input value={serviceType} onChange={(e) => setServiceType(e.target.value)} className={controlClass} placeholder="Ví dụ: Mượn váy chụp ngoại cảnh" maxLength={160} autoFocus />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <FieldLabel>Ngày giao đồ</FieldLabel>
              <CustomDatePicker value={eventDate} onChange={setEventDate} className="[&_input]:h-10 [&_input]:rounded-lg [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_button]:right-2 [&_button_svg]:h-4 [&_button_svg]:w-4" />
            </div>
            <div>
              <FieldLabel>Giờ giao đồ</FieldLabel>
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className={controlClass}
              />
            </div>
            <div>
              <FieldLabel>Người phụ trách</FieldLabel>
              <div className="relative">
                <select value={picId} onChange={(e) => setPicId(e.target.value)} className={`${controlClass} appearance-none pr-9`}>
                  <option value="">Chưa phân công</option>
                  {users.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.email || "Nhân sự chưa đặt tên"}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between"><FieldLabel>Ghi chú vận hành</FieldLabel><span className="mb-1.5 text-xs text-slate-400">{notes.length}/1000</span></div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxLength={1000} className={`${controlClass} h-auto resize-y py-2.5`} placeholder="Yêu cầu chuẩn bị hoặc lưu ý khi giao nhận" />
          </div>

          {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={() => router.back()} disabled={isSubmitting} className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
          <button type="submit" disabled={isSubmitting} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}{isSubmitting ? "Đang tạo..." : "Tạo đơn"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return <label className="mb-1.5 block text-sm font-medium text-slate-700">{children}{required && <span className="text-rose-500"> *</span>}</label>;
}
