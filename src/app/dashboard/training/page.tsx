"use client";

import { GraduationCap, BookOpen, PlayCircle, CheckCircle2, Search, Video, ClipboardList } from "lucide-react";
import { useState } from "react";

export default function TrainingDashboardPage() {
  const [activeTab, setActiveTab] = useState("ALL");

  const courses = [
    { id: 1, title: "Kỹ năng Sale Cơ bản", category: "Sale", instructor: "Nguyễn Văn Cao", lessons: 12, completed: 12, progress: 100, cover: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80" },
    { id: 2, title: "Chụp ảnh cưới Ngoại cảnh", category: "Photo", instructor: "Lê C", lessons: 8, completed: 4, progress: 50, cover: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&q=80" },
    { id: 3, title: "Kỹ thuật Trang điểm Cô dâu", category: "Makeup", instructor: "Trần D", lessons: 15, completed: 0, progress: 0, cover: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&q=80" },
    { id: 4, title: "Quy trình chăm sóc Khách hàng", category: "CSKH", instructor: "Nguyễn Thị Anh Thi", lessons: 5, completed: 1, progress: 20, cover: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=500&q=80" },
  ];

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-orange-600" />
            Đào Tạo Nội Bộ
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Nâng cao nghiệp vụ và chuyên môn cho đội ngũ CAMA</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative w-full md:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm khoá học..." 
              className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all shadow-sm"
            />
          </div>
          <a 
            href="/dashboard/training/exams"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <ClipboardList className="w-4 h-4" /> Sát Hạch
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-3xl text-white shadow-lg shadow-orange-500/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-orange-100 mb-1">Khoá Học Đã Hoàn Thành</p>
              <h3 className="text-4xl font-black mt-2">1</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-500 mb-1">Giờ học tích luỹ</p>
              <h3 className="text-4xl font-black text-slate-800 mt-2">24<span className="text-lg text-slate-400">h</span></h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><ClockIcon className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-500 mb-1">Chứng chỉ đạt được</p>
              <h3 className="text-4xl font-black text-slate-800 mt-2">1</h3>
            </div>
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Award className="w-6 h-6" /></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6">
        <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4 overflow-x-auto">
          {["ALL", "Sale", "Photo", "Makeup", "CSKH"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab === "ALL" ? "Tất cả khoá học" : `Bộ phận ${tab}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.filter(c => activeTab === "ALL" || c.category === activeTab).map(course => (
            <div key={course.id} className="group border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                <img src={course.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                   <div className="flex gap-2">
                     <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/20">{course.category}</span>
                     <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/20 flex items-center gap-1"><Video className="w-3 h-3"/> {course.lessons} Bài</span>
                   </div>
                </div>
                {course.progress === 100 && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="p-5 bg-white">
                <h3 className="font-bold text-slate-800 text-lg line-clamp-2 leading-tight mb-2 group-hover:text-orange-600 transition-colors">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Giảng viên: <span className="font-semibold text-slate-700">{course.instructor}</span>
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Tiến độ</span>
                    <span className={course.progress === 100 ? "text-emerald-600" : "text-orange-600"}>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">{course.completed}/{course.lessons} bài học</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}
function Award(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
  );
}
