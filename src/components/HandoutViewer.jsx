import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Eraser, Trash2, ZoomIn, ZoomOut, Menu } from 'lucide-react';

const checkTool = () => document.body.classList.contains('cursor-eraser') || document.body.classList.contains('cursor-pen');

const BlankWord = ({ text, globalShow }) => {
  const [localState, setLocalState] = useState(null);
  const isVisible = localState !== null ? localState : globalShow;
  
  const toggle = (e) => {
    if (checkTool()) return;
    e.stopPropagation();
    setLocalState(!isVisible);
  };

  if (text === '' || text === '　' || text === '✓' || text === '☑️') {
    const isCheck = (text !== '　');
    return (
      <span onClick={toggle}
        className="cursor-pointer inline-block text-center w-6 data-blankword-check select-none" data-text={isCheck ? '✓' : '　'}>
        <span className={isVisible && isCheck ? 'text-red-600 font-bold' : 'text-transparent'}>
          {isCheck ? '✓' : '　'}
        </span>
      </span>
    );
  }
  return (
    <span onClick={toggle}
      className={`cursor-pointer px-2 mx-1 font-bold transition-colors select-none border-b-[3px] data-blankword ${isVisible ? 'text-red-600 border-red-300 bg-red-50' : 'text-transparent border-slate-400 bg-slate-100'}`}
      data-text={text}>
      {text}
    </span>
  );
};

/* ── 第六課 HTML 表格專用元件 ── */
const TableContent = ({ html, globalShow }) => {
  const ref = useRef(null);

  // 在這階段就把 html 裡的紅字 td 全部轉換掉，避免 re-render 時變回紅字
  const processedHtml = html
    .replace(/class="([^"]*)text-red-600([^"]*)"/g, (match, p1, p2) => {
      // 把 text-red-600 拿掉，避免 td 影響
      return `class="${p1}${p2}"`;
    })
    .replace(/\*(.*?)\*/g, (_, text) => {
      return `<span class="table-blank cursor-pointer font-bold transition-colors text-transparent bg-slate-100 px-1 border-b-[3px] border-slate-400 select-none">${text}</span>`;
    });

  // 同步全域顯示狀態，並支援點擊切換
  useEffect(() => {
    if (!ref.current) return;
    ref.current.querySelectorAll('.table-blank').forEach(blank => {
      // 判斷該格子是否已經被手動揭開
      const isRevealed = blank.classList.contains('text-red-600');
      // 如果 globalShow 為 true，強迫顯示；如果為 false，隱藏 (除非有手動揭開)
      if (globalShow) {
        blank.classList.remove('text-transparent', 'bg-slate-100', 'border-slate-400');
        blank.classList.add('text-red-600', 'bg-red-50', 'border-red-300');
      } else {
        if (!isRevealed) {
          blank.classList.add('text-transparent', 'bg-slate-100', 'border-slate-400');
          blank.classList.remove('text-red-600', 'bg-red-50', 'border-red-300');
        }
      }
    });
  }, [globalShow]);

  const handleClick = (e) => {
    if (checkTool()) return;
    const blank = e.target.closest('.table-blank');
    if (blank) {
      e.stopPropagation();
      const isHidden = blank.classList.contains('text-transparent');
      if (isHidden) {
        blank.classList.remove('text-transparent', 'bg-slate-100', 'border-slate-400');
        blank.classList.add('text-red-600', 'bg-red-50', 'border-red-300');
      } else {
        blank.classList.add('text-transparent', 'bg-slate-100', 'border-slate-400');
        blank.classList.remove('text-red-600', 'bg-red-50', 'border-red-300');
      }
    }
  };

  return <div ref={ref} onClick={handleClick} dangerouslySetInnerHTML={{ __html: processedHtml }} />;
};

const parseTask1 = (text, globalShow) => {
  if (text.includes('<table')) return <TableContent html={text} globalShow={globalShow} />;
  const parts = text.split(/\*(.*?)\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) return <BlankWord key={i} text={part} globalShow={globalShow} />;
    return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
  });
};

const parsePractice = (text, globalShow) => {
  if (text === "(本題無提供練習句)") return <span>(本題無提供練習句)</span>;
  const parts = text.split(/\((.*?)\)/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) return (
      <span key={i} className="inline-flex items-center text-blue-700 font-bold mx-1">
        (<BlankWord text={part} globalShow={globalShow} />)
      </span>
    );
    return <span key={i}>{part}</span>;
  });
};

const QuizBlock = ({ qIdx, q, options, a, showAllAnswers }) => {
  const [localState, setLocalState] = useState(null);
  const isShow = localState !== null ? localState : showAllAnswers;
  
  const toggle = (e) => {
    if (checkTool()) return;
    setLocalState(!isShow);
  };
  return (
    <div className="mb-6 cursor-pointer select-none group" onClick={toggle}>
      <div className="font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors" style={{ marginLeft: '2em' }}>
        {qIdx + 1}. {q}
      </div>
      <ul className="space-y-3" style={{ marginLeft: '4em' }}>
        {options.map((opt, oIdx) => {
          const isCorrect = (oIdx + 1 === a);
          return (
            <li key={oIdx} className="flex items-start data-quiz-opt" data-correct={isCorrect}>
              <span className={`mr-2 font-bold leading-none ${isShow && isCorrect ? 'text-red-600' : 'text-slate-400'}`}>
                {isShow && isCorrect ? '✓' : '□'}
              </span>
              <span className={isShow && isCorrect ? 'text-red-600 font-bold' : 'text-slate-700'}>{opt}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const PracticeBlock = ({ index, p, showAllAnswers }) => {
  // 移除 onClick 以避免「點擊一格跳出多格」的狀況，讓使用者必須準確點擊空格
  return (
    <div className="mb-6 select-none group">
      <div className="font-bold text-slate-800 transition-colors" style={{ marginLeft: '2em' }}>
        例句{['一','二','三','四','五','六'][index]}：<span className="font-normal">{p.ex}</span>
      </div>
      <div className="font-bold text-slate-800 flex mt-1" style={{ marginLeft: '2em' }}>
        <span style={{ whiteSpace: 'pre' }}>{index === 0 ? '　  練習：' : '練習：'}</span>
        <div className="font-normal text-slate-800">{parsePractice(p.pr, showAllAnswers)}</div>
      </div>
    </div>
  );
};

/* ── 造句：整句隱藏，點擊才顯示 ── */
const SentenceBlock = ({ word, ex, showAllAnswers }) => {
  const [showLocal, setShowLocal] = useState(false);
  const isShow = showAllAnswers || showLocal;
  const cleanText = ex.replace(/[()]/g, '');
  return (
    <div className="mb-6 cursor-pointer select-none group" onClick={(e) => { if (checkTool()) return; setShowLocal(!showLocal); }}>
      <div className="font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors" style={{ marginLeft: '2em' }}>
        <span className="bg-slate-200 px-2 py-1 rounded mr-2 text-sm no-print">造句</span>{word}：
      </div>
      <div className="leading-relaxed" style={{ marginLeft: '4em' }}>
        <span
          className={`inline px-2 font-bold transition-colors border-b-[3px] data-blankword ${isShow ? 'text-red-600 border-red-300 bg-red-50' : 'text-transparent border-slate-400 bg-slate-100'}`}
          data-text={cleanText}>
          {cleanText}
        </span>
      </div>
    </div>
  );
};

const Task4QA = ({ q, a, showAllAnswers }) => {
  const [showLocal, setShowLocal] = useState(false);
  const isShow = showAllAnswers || showLocal;
  return (
    <div className="cursor-pointer select-none group" onClick={(e) => { if (checkTool()) return; setShowLocal(!showLocal); }}>
      <div className="font-bold mb-2 text-slate-800 group-hover:text-blue-700 transition-colors" style={{ marginLeft: '2em' }}>
        問答題：{q}
      </div>
      <div className={`data-qa-ans text-red-600 font-bold leading-relaxed ${isShow ? 'block' : 'hidden'}`} style={{ marginLeft: '4em' }}>
        解答：{a}
      </div>
      <div className={`data-qa-line data-qa-line-break text-slate-300 ${!isShow ? 'block' : 'hidden'}`} style={{ marginLeft: '4em' }}>
        ＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿
      </div>
    </div>
  );
};

const Task4MC = ({ q, options, a, showAllAnswers }) => {
  const [showLocal, setShowLocal] = useState(false);
  const isShow = showAllAnswers || showLocal;
  return (
    <div className="cursor-pointer select-none group" onClick={(e) => { if (checkTool()) return; setShowLocal(!showLocal); }}>
      <div className="font-bold mb-2 text-slate-800 group-hover:text-blue-700 transition-colors" style={{ marginLeft: '2em' }}>
        選擇題：{q}
      </div>
      <ul className="space-y-2 mb-2 text-slate-700" style={{ marginLeft: '4em' }}>
        {options.map((opt, oIdx) => (
          <li key={oIdx} className={`data-quiz-opt ${isShow && opt.startsWith(a) ? "text-red-600 font-bold" : ""}`} data-correct={opt.startsWith(a)}>
            <span className="hidden">□</span><span>{opt}</span>
          </li>
        ))}
      </ul>
      <div className={`data-mc-ans text-red-600 font-bold ${isShow ? 'block' : 'hidden'}`} style={{ marginLeft: '4em' }}>
        解答：{a}
      </div>
      <div className={`data-qa-line text-slate-300 ${!isShow ? 'block' : 'hidden'}`} style={{ marginLeft: '4em' }}>
        ＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿
      </div>
    </div>
  );
};

export default function HandoutViewer({ lesson, isSidebarOpen, setIsSidebarOpen }) {
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [toolMode, setToolMode] = useState('none');
  const [exportSize, setExportSize] = useState('A4');
  const [exportMargin, setExportMargin] = useState('standard');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isWidescreen, setIsWidescreen] = useState(false);

  useEffect(() => {
    setShowAllAnswers(false);
    setResetKey(k => k + 1);
  }, [lesson?.id]);

  const toggleShowAll = () => {
    if (showAllAnswers) setResetKey(k => k + 1);
    setShowAllAnswers(prev => !prev);
  };

  const isHighlightNode = (node) => {
    if (!node || !node.style) return false;
    const bg = (node.style.backgroundColor || '').replace(/\s/g, '').toLowerCase();
    return bg === 'rgb(254,240,138)' || bg === '#fef08a' || bg === 'yellow' || bg === 'rgb(255,255,0)';
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (toolMode === 'pen') {
        const selection = window.getSelection();
        if (!selection.isCollapsed && selection.rangeCount > 0) {
          document.designMode = "on";
          document.execCommand("HiliteColor", false, "#fef08a");
          document.execCommand("backColor", false, "#fef08a");
          document.designMode = "off";
          selection.removeAllRanges();
        }
      }
    };
    const handleClick = (e) => {
      if (toolMode === 'eraser') {
        let target = e.target;
        while (target && target !== document.body) {
          if (isHighlightNode(target)) { target.style.backgroundColor = ''; break; }
          target = target.parentNode;
        }
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClick);
    return () => { document.removeEventListener('mouseup', handleMouseUp); document.removeEventListener('click', handleClick); };
  }, [toolMode]);

  useEffect(() => {
    document.body.className = `font-sans antialiased bg-slate-50 text-slate-800 ${toolMode === 'pen' ? 'cursor-pen' : toolMode === 'eraser' ? 'cursor-eraser' : ''}`;
  }, [toolMode]);

  const clearAllHighlight = () => {
    document.getElementById('printable-area')?.querySelectorAll('*').forEach(el => {
      if (isHighlightNode(el)) el.style.backgroundColor = '';
    });
  };

  const exportToWord = (mode, showWatermark = true) => {
    const clone = document.getElementById('printable-area').cloneNode(true);
    clone.querySelectorAll('.no-print').forEach(el => el.remove());

    if (mode === 'student') {
      clone.querySelectorAll('.data-blankword').forEach(el => {
        const len = (el.getAttribute('data-text') || '').trim().length;
        el.innerHTML = '＿'.repeat(len > 0 ? len * 2 : 4);
        el.style.color = '#000'; el.style.border = 'none'; el.style.background = 'transparent';
      });
      clone.querySelectorAll('.data-blankword-check').forEach(el => {
        el.innerHTML = '　'; el.style.color = '#000'; el.style.background = 'transparent';
      });
      clone.querySelectorAll('.table-blank').forEach(el => {
        const len = (el.textContent || '').trim().length;
        el.innerHTML = '＿'.repeat(len > 0 ? len * 2 : 4);
        el.style.color = '#000'; el.style.border = 'none'; el.style.background = 'transparent';
      });
      clone.querySelectorAll('.data-quiz-opt').forEach(el => {
        const icon = el.children[0]; const text = el.children[1];
        if (icon) { icon.innerHTML = '□'; icon.style.color = '#000'; icon.classList.remove('hidden'); }
        if (text) { text.style.color = '#000'; text.style.fontWeight = 'normal'; }
      });
      clone.querySelectorAll('.data-qa-ans, .data-mc-ans').forEach(el => el.remove());
      clone.querySelectorAll('.data-qa-line').forEach(el => {
        el.style.display = 'block'; el.style.color = '#000';
        if (el.classList.contains('data-qa-line-break')) {
          el.innerHTML = '<br>＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿<br>＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿';
        } else {
          el.innerHTML = '＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿';
        }
      });
    } else {
      clone.querySelectorAll('.data-blankword').forEach(el => {
        el.innerHTML = el.getAttribute('data-text');
        el.style.color = '#DC2626'; el.style.background = 'transparent'; el.style.textDecoration = 'underline';
      });
      clone.querySelectorAll('.data-blankword-check').forEach(el => {
        const val = el.getAttribute('data-text');
        el.innerHTML = val === '✓' ? '✓' : '　';
        el.style.color = val === '✓' ? '#DC2626' : '#000';
        el.style.fontWeight = val === '✓' ? 'bold' : 'normal';
        el.style.background = 'transparent';
      });
      clone.querySelectorAll('.table-blank').forEach(el => {
        el.style.color = '#DC2626'; el.style.background = 'transparent';
        el.style.borderBottom = 'none'; el.style.textDecoration = 'underline';
      });
      clone.querySelectorAll('.data-quiz-opt').forEach(el => {
        const isCorrect = el.getAttribute('data-correct') === 'true';
        const icon = el.children[0]; const text = el.children[1];
        if (isCorrect) {
          if (icon) { icon.innerHTML = '✓'; icon.style.color = '#DC2626'; icon.classList.remove('hidden'); }
          if (text) { text.style.color = '#DC2626'; text.style.fontWeight = 'bold'; }
        } else {
          if (icon) { icon.innerHTML = '□'; icon.style.color = '#000'; icon.classList.remove('hidden'); }
          if (text) { text.style.color = '#000'; text.style.fontWeight = 'normal'; }
        }
      });
      clone.querySelectorAll('.data-qa-line').forEach(el => el.remove());
      clone.querySelectorAll('.data-qa-ans, .data-mc-ans').forEach(el => {
        el.style.display = 'block'; el.style.color = '#DC2626'; el.style.fontWeight = 'bold';
      });
    }



    let sizeCss = '21cm 29.7cm';
    if (exportSize === 'B4') sizeCss = '25.7cm 36.4cm';
    if (exportSize === 'A3') sizeCss = '29.7cm 42cm';
    let marginCss = '2.54cm 3.18cm 2.54cm 3.18cm';
    if (exportMargin === 'wide') marginCss = '2.54cm 5.08cm 2.54cm 5.08cm';
    if (exportMargin === 'narrow') marginCss = '1.27cm 1.27cm 1.27cm 1.27cm';

    const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <style>
        @page WordSection1 { size: ${sizeCss}; margin: ${marginCss}; }
        div.WordSection1 { page: WordSection1; }
        body, p, span, div, li, ul, h1, h2, h3, h4 { font-family: "標楷體", "BiauKai", "DFKai-SB", serif !important; line-height: 1.5 !important; }
        body { font-size: 12pt !important; color: #000; }
        h1 { font-size: 16pt !important; font-weight: bold; text-align: center; margin-bottom: 24px; }
        h2 { font-size: 14pt !important; font-weight: bold; margin-top: 24px; margin-bottom: 12px; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #94a3b8; padding: 6px 8px; }
      </style>
    </head>
    <body><div class="WordSection1">${clone.innerHTML}</div></body>
    </html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const lessonNumber = lesson.id.replace('lesson-', '').padStart(2, '0');
    link.download = `${lessonNumber}${lesson.lessonNum}課堂單_${lesson.lessonName}_${mode === 'teacher' ? '教用版' : '學用版'}.doc`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };



  if (!lesson) {
    return <div className="p-10 text-center text-slate-500">請從左側選擇一份課文</div>;
  }

  return (
    <div className="flex flex-col w-full h-full pb-20">
      {/* 控制台 */}
      <div className="no-print bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-40 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4 shrink-0">
        <div className="font-bold text-xl text-blue-900 flex items-center gap-3">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors" title="開啟課程列表">
              <Menu size={20} />
            </button>
          )}
          講義控制台
        </div>
        <div className="flex gap-3 flex-wrap justify-center items-center">
          {/* 版權註記 */}
          <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-1.5 rounded text-right leading-tight mr-1 hidden md:block">
            學習單資料取自「翰林出版社」<br/>
            網站內容僅限用於孩子學習使用<br/>
            <span className="text-red-600 font-bold">切勿用於商業行為</span>
          </div>
          {/* 縮放 */}
          <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <button onClick={() => setZoomLevel(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))} className="p-1 hover:bg-white rounded text-slate-600" title="縮小"><ZoomOut size={18} /></button>
            <span className="text-sm font-bold w-12 text-center text-slate-700">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel(z => Math.min(2, parseFloat((z + 0.1).toFixed(1))))} className="p-1 hover:bg-white rounded text-slate-600" title="放大"><ZoomIn size={18} /></button>
          </div>
          {/* 拉寬 */}
          <button onClick={() => setIsWidescreen(!isWidescreen)} className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${isWidescreen ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {isWidescreen ? '縮回版面' : '拉寬版面'}
          </button>
          {/* 版面設定 */}
          <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
            <label className="text-sm font-bold text-slate-700 flex items-center">版面：
              <select className="ml-1 border-slate-300 rounded text-sm p-1" value={exportSize} onChange={e => setExportSize(e.target.value)}>
                <option value="A4">A4</option><option value="B4">B4</option><option value="A3">A3</option>
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700 flex items-center">邊界：
              <select className="ml-1 border-slate-300 rounded text-sm p-1" value={exportMargin} onChange={e => setExportMargin(e.target.value)}>
                <option value="standard">標準</option><option value="wide">寬</option><option value="narrow">窄</option>
              </select>
            </label>
          </div>
          <button onClick={toggleShowAll} className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg font-bold shadow-sm transition-colors text-sm">
            {showAllAnswers ? '🔒 隱藏全解答' : '👁️ 顯示全解答'}
          </button>
          <button onClick={() => exportToWord('teacher')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow font-bold text-sm">匯出教用版</button>
          <button onClick={() => exportToWord('student')} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow font-bold text-sm">匯出學用版</button>
        </div>
      </div>

      {/* 內容區 */}
      <div className="flex-1 w-full p-6 flex justify-center overflow-y-auto">
        <div
          key={`content-${lesson.id}-${resetKey}`}
          id="printable-area"
          className={`relative w-full ${isWidescreen ? 'max-w-[1200px]' : 'max-w-[850px]'} bg-white p-10 md:p-16 shadow-xl rounded-xl border border-slate-100 content-area self-start`}
          style={{ zoom: zoomLevel }}
        >

          <h1 className="font-bold text-center mb-4 text-slate-800 text-2xl relative z-10">
            115 五上國語學習講義翰林版 {lesson.lessonNum} {lesson.lessonName} 作者：{lesson.author}
          </h1>
          <div className="text-center font-bold text-xl mb-12 text-slate-800">
            班級：_______ 座號：_______ 姓名：_____________
          </div>

          <section className="mb-14">
            <h2 className="font-bold text-slate-800 text-xl mb-4">任務一、文意理解，深入認識課文</h2>
            <div className="mb-8 space-y-2">
              {lesson.task1.map((item, i) => (
                <div key={i} style={{ marginLeft: `${item.indent * 2}em` }} className={`leading-relaxed ${item.isBox ? 'border-2 border-slate-800 p-4 rounded bg-white my-4 font-bold' : ''}`}>
                  {parseTask1(item.text, showAllAnswers)}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="font-bold text-slate-800 text-xl mb-4 leading-relaxed">
              任務二、閱讀測驗，讀完課文之後，你了解課文內容和作者的想法嗎？<br />
              請依據課文回答下面的問題。（在□裡打「✓」）
            </h2>
            <div className="space-y-6 mt-6">
              {lesson.quiz.map((q, i) => <QuizBlock key={i} qIdx={i} q={q.q} options={q.options} a={q.a} showAllAnswers={showAllAnswers} />)}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="font-bold text-slate-800 text-xl mb-4">任務三、句型練習</h2>
            <div className="space-y-8 mt-6">
              {lesson.practices.map((p, i) => <PracticeBlock key={i} index={i} p={p} showAllAnswers={showAllAnswers} />)}
            </div>
            {lesson.sentences && (
              <div className="space-y-6 mt-8">
                {lesson.sentences.map((s, i) => <SentenceBlock key={i} word={s.word} ex={s.ex} showAllAnswers={showAllAnswers} />)}
              </div>
            )}
          </section>

          {lesson.task4 && (
            <section className="mb-10">
              <h2 className="font-bold text-slate-800 text-xl mb-4">挑戰任務、寫作引導，本課文本要點</h2>
              <div className="mt-6">
                <div className="mb-4 font-bold text-slate-800" style={{ marginLeft: '2em' }}>
                  寫作主題：<span className="font-normal">{lesson.task4.theme}</span>
                </div>
                <div className="mb-6">
                  <div className="font-bold text-slate-800 mb-2" style={{ marginLeft: '2em' }}>◎課文分析師</div>
                  <div className="text-slate-700 leading-relaxed" style={{ marginLeft: '4em' }} dangerouslySetInnerHTML={{ __html: lesson.task4.analyst }} />
                </div>
                {lesson.task4.magic && (
                  <div className="mb-6">
                    <div className="font-bold text-slate-800 mb-2" style={{ marginLeft: '2em' }}>◎主題魔法書</div>
                    <div className="text-slate-700 leading-relaxed" style={{ marginLeft: '4em' }} dangerouslySetInnerHTML={{ __html: lesson.task4.magic }} />
                  </div>
                )}
                <div className="mb-6 space-y-6 mt-8">
                  {lesson.task4.qa && <Task4QA q={lesson.task4.qa.q} a={lesson.task4.qa.a} showAllAnswers={showAllAnswers} />}
                  {lesson.task4.mc && <Task4MC q={lesson.task4.mc.q} options={lesson.task4.mc.options} a={lesson.task4.mc.a} showAllAnswers={showAllAnswers} />}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* 浮動工具列 */}
      <div className="no-print fixed bottom-8 right-8 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-2xl border border-slate-200 flex flex-col space-y-3 z-50">
        <button onClick={() => setToolMode(toolMode === 'pen' ? 'none' : 'pen')} className={`p-4 rounded-full transition-all ${toolMode === 'pen' ? 'bg-yellow-300 text-yellow-800 shadow-inner' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`} title="螢光筆畫記"><PenTool size={24} /></button>
        <button onClick={() => setToolMode(toolMode === 'eraser' ? 'none' : 'eraser')} className={`p-4 rounded-full transition-all ${toolMode === 'eraser' ? 'bg-pink-300 text-pink-800 shadow-inner' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`} title="消除畫記"><Eraser size={24} /></button>
        <button onClick={clearAllHighlight} className="p-4 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-600 transition-colors" title="清除所有畫記"><Trash2 size={24} /></button>
      </div>
    </div>
  );
}
