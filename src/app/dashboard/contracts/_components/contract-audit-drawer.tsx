"use client";

import { useEffect, useState } from "react";
import { X, Clock, User, Activity, FileText } from "lucide-react";
import { getContractActivities } from "../actions";

interface ContractAuditDrawerProps {
  contractId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ContractAuditDrawer({ contractId, isOpen, onClose }: ContractAuditDrawerProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contractId) {
      setLoading(true);
      getContractActivities(contractId)
        .then((data) => {
          setActivities(data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, contractId]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[560px] xl:w-[640px] max-w-[92vw] bg-white shadow-2xl z-[101] flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-slate-800">
            <Clock className="w-5 h-5 text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Lịch sử chỉnh sửa</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Chưa có lịch sử thao tác nào.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {activities.map((act) => (
                <div key={act.id} className="py-4 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      {act.actor_name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(act.created_at).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pl-8">
                    {(act.content || "").split("|").map((change: string, idx: number) => {
                      let text = change.trim();
                      if (!text) return null;
                      const operation = text.includes(" THÊM") ? "THÊM" : text.includes(" XÓA") ? "XÓA" : text.includes(" SỬA") ? "SỬA" : "";
                      const operationClass = operation === "THÊM"
                        ? "bg-emerald-50 text-emerald-700"
                        : operation === "XÓA"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700";

                      let tag = "";
                      const tagMatch = text.match(/^\[(.*?)\]\s*(.*)/);
                      if (tagMatch) {
                        tag = tagMatch[1];
                        text = tagMatch[2];
                      }
                      if (operation) text = text.replace(new RegExp(`^${operation}\\s*[—-]?\\s*`), "");

                      const editMatch = text.match(/^(.*?):\s*Cũ:\s*(.*?)\s*→\s*Mới:\s*(.*)$/);
                      const addedFields = operation === "THÊM"
                        ? text.split(/,\s*(?=[^,:]+:\s)/).map((field) => field.trim()).filter(Boolean)
                        : [];

                      return (
                        <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-[13px] text-slate-700">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            {tag && <span className="font-bold text-slate-900">[{tag}]</span>}
                            {operation && <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${operationClass}`}>{operation}</span>}
                          </div>

                          {editMatch ? (
                            <div className="space-y-1 leading-relaxed">
                              <div className="font-semibold text-slate-800">{editMatch[1]}</div>
                              <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-2">
                                <span className="text-slate-400">Cũ:</span>
                                <span className="break-words">{editMatch[2]}</span>
                              </div>
                              <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-2">
                                <span className="font-semibold text-emerald-600">Mới:</span>
                                <span className="font-semibold text-slate-900 break-words">{editMatch[3]}</span>
                              </div>
                            </div>
                          ) : addedFields.length > 1 ? (
                            <div className="space-y-1 leading-relaxed">
                              {addedFields.map((field, fieldIndex) => (
                                <div key={fieldIndex} className="break-words">{field}</div>
                              ))}
                            </div>
                          ) : (
                            <div className="leading-relaxed font-medium break-words">{text}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
