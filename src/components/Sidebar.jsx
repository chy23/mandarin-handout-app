import React from 'react';
import { BookOpen, ChevronRight, X } from 'lucide-react';

export default function Sidebar({ lessons, currentLessonId, onSelectLesson, isOpen, setIsOpen }) {
  if (!isOpen) return null;
  return (
    <div className="w-72 bg-white/60 backdrop-blur-xl border-r border-slate-200 h-screen overflow-y-auto flex flex-col no-print sticky top-0 shadow-lg shrink-0 transition-all">
      <div className="p-6 border-b border-slate-200/50 flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-600/20">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">國語講義平台</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">專屬高效學習系統</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full" title="隱藏側邊欄">
          <X size={18} />
        </button>
      </div>
      
      <div className="flex-1 p-4 space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">課程列表</h2>
        {lessons.map((lesson) => {
          const isActive = currentLessonId === lesson.id;
          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 border border-blue-100 shadow-sm' 
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex flex-col items-start text-left">
                <span className={`text-xs font-bold ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
                  {lesson.lessonNum}
                </span>
                <span className={`text-sm font-bold mt-0.5 ${isActive ? 'text-blue-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                  {lesson.lessonName}
                </span>
              </div>
              <ChevronRight 
                size={16} 
                className={`transition-transform duration-200 ${isActive ? 'text-blue-600 translate-x-1' : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2'}`} 
              />
            </button>
          );
        })}
      </div>

      <div className="p-6 border-t border-slate-200/50 bg-slate-50/50 mt-auto">
        <div className="text-xs text-slate-400 text-center font-medium">
          系統更新：每週上架新課文
        </div>
      </div>
    </div>
  );
}
