import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HandoutViewer from './components/HandoutViewer';
import { lessons } from './data/lessons';

function App() {
  const [currentLessonId, setCurrentLessonId] = useState(lessons[0]?.id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const currentLesson = lessons.find(l => l.id === currentLessonId);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 selection:bg-blue-100 relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none no-print overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-100/40 blur-3xl" />
      </div>

      <Sidebar 
        lessons={lessons} 
        currentLessonId={currentLessonId} 
        onSelectLesson={setCurrentLessonId} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 h-screen overflow-y-auto relative z-10 no-scrollbar">
        {currentLesson ? (
          <HandoutViewer lesson={currentLesson} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 font-medium text-lg">
            請從左側選單選擇一課開始
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
