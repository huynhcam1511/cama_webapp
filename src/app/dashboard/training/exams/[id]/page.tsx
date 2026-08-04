"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    question: "Khi giao váy cho khách, bước nào là bắt buộc trong Checklist QA/QC?",
    options: [
      "Chỉ cần hỏi khách có vừa không",
      "Kiểm tra cúc áo, dây kéo, vết bẩn và phụ kiện đi kèm",
      "Giao thẳng cho khách và hẹn ngày trả",
      "Yêu cầu khách ký tên là đủ"
    ],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "Nếu phát hiện váy bị đứt cúc hoặc dơ trước khi giao, nhân viên phải làm gì?",
    options: [
      "Giấu nhẹm đi và hy vọng khách không thấy",
      "Vẫn giao cho khách và nói khách tự sửa",
      "Bấm nút 'Báo Lỗi / Bẩn' trên hệ thống để chuyển qua giặt ủi/sửa chữa",
      "Bảo khách đổi sang cái khác"
    ],
    correctAnswer: 2,
  },
  {
    id: 3,
    question: "Trạng thái đơn hàng sẽ chuyển thành gì sau khi bấm nút 'Báo Lỗi / Bẩn'?",
    options: [
      "Hoàn tất (COMPLETED)",
      "Đã giao (DELIVERED)",
      "Sự cố (ISSUE)",
      "Chờ xử lý (PENDING)"
    ],
    correctAnswer: 2,
  }
];

export default function ExamTakingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectOption = (optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentQuestion]: optionIdx }));
  };

  const handleNext = () => {
    if (currentQuestion < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < SAMPLE_QUESTIONS.length) {
      if (!confirm("Bạn chưa làm xong tất cả câu hỏi. Vẫn muốn nộp bài?")) return;
    }
    
    let correctCount = 0;
    SAMPLE_QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correctCount++;
    });
    
    setScore(Math.round((correctCount / SAMPLE_QUESTIONS.length) * 100));
    setIsSubmitted(true);
  };

  const activeQ = SAMPLE_QUESTIONS[currentQuestion];

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Hoàn Thành Bài Thi!</h2>
        <p className="text-slate-500 mb-8">Bạn đã hoàn thành bài thi Sát hạch Quy trình Bàn giao</p>
        
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 mb-8 inline-block min-w-[200px]">
          <div className="text-sm font-bold text-slate-500 uppercase mb-2">Điểm Số</div>
          <div className={`text-5xl font-black ${score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {score}<span className="text-2xl text-slate-400">/100</span>
          </div>
          {score >= 80 ? (
            <div className="text-emerald-600 font-bold mt-2">ĐẠT YÊU CẦU</div>
          ) : (
            <div className="text-rose-600 font-bold mt-2">CHƯA ĐẠT - CẦN THI LẠI</div>
          )}
        </div>

        <div>
          <Link href="/dashboard/training/exams" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors">
            Quay Về Danh Sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-2">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/training/exams" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm">
          <Clock className="w-4 h-4" /> 14:59
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Progress header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Sát hạch Quy trình Bàn giao Trang phục</h1>
            <p className="text-xs text-slate-500 mt-1">Câu hỏi {currentQuestion + 1} / {SAMPLE_QUESTIONS.length}</p>
          </div>
          
          <div className="flex gap-1.5">
            {SAMPLE_QUESTIONS.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                  currentQuestion === idx ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                  answers[idx] !== undefined ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}
                onClick={() => setCurrentQuestion(idx)}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Question body */}
        <div className="p-8 flex-1">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-snug">
            {activeQ.question}
          </h2>

          <div className="space-y-3">
            {activeQ.options.map((opt, idx) => (
              <div 
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                  answers[currentQuestion] === idx 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  answers[currentQuestion] === idx ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {answers[currentQuestion] === idx && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                </div>
                <span className={`font-semibold text-[15px] ${answers[currentQuestion] === idx ? 'text-blue-800' : 'text-slate-700'}`}>
                  {opt}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button 
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            Câu trước
          </button>

          {currentQuestion === SAMPLE_QUESTIONS.length - 1 ? (
            <button 
              onClick={handleSubmit}
              className="px-8 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
            >
              Nộp Bài
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
            >
              Câu tiếp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
