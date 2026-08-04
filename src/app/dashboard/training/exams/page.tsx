"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Clock, Award, ChevronRight, CheckCircle2 } from "lucide-react";

export default function ExamsListPage() {
  const [activeTab, setActiveTab] = useState("ALL");

  const exams = [
    { id: 1, title: "Sát hạch Quy trình Tư vấn Hợp đồng", category: "Sale", duration: 30, questions: 20, status: "PENDING" },
    { id: 2, title: "Kiểm tra Kiến thức Vải & Form dáng váy", category: "Sale", duration: 20, questions: 15, status: "COMPLETED", score: 85 },
    { id: 3, title: "Sát hạch Quy trình Bàn giao Trang phục (QA/QC)", category: "Kho", duration: 15, questions: 10, status: "PENDING" },
    { id: 4, title: "Quy tắc An toàn thiết bị Studio", category: "Photo", duration: 15, questions: 15, status: "COMPLETED", score: 100 },
  ];

  const filteredExams = exams.filter(e => activeTab === "ALL" || e.status === activeTab);

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            Sát Hạch & Trắc Nghiệm
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Đánh giá năng lực và nắm vững quy trình nội bộ</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6">
        <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === "ALL" ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Tất cả bài thi
          </button>
          <button 
            onClick={() => setActiveTab("PENDING")}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === "PENDING" ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Cần hoàn thành
          </button>
          <button 
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === "COMPLETED" ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Đã làm
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map(exam => (
            <div key={exam.id} className="group bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">{exam.category}</span>
                {exam.status === "COMPLETED" ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-100 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" /> Đã qua ({exam.score}/100)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-100 px-2 py-1 rounded-lg">
                    Chưa làm
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-slate-800 text-lg mb-3 line-clamp-2">{exam.title}</h3>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {exam.duration} phút</div>
                <div className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4" /> {exam.questions} câu hỏi</div>
              </div>

              {exam.status === "COMPLETED" ? (
                <Link href={`/dashboard/training/exams/${exam.id}`} className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  Xem Lại Bài Làm
                </Link>
              ) : (
                <Link href={`/dashboard/training/exams/${exam.id}`} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                  Bắt Đầu Thi <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
