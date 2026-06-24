import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, Search, ZoomIn, ZoomOut, Maximize, 
  Plus, Image as ImageIcon, AlignLeft, AlignCenter, 
  AlignRight, Bold, Italic, Underline, Type,
  Printer, Download, X, GripHorizontal, ChevronRight
} from 'lucide-react';

// --- Mock Data ---
const MOCK_STUDENTS = [
  { id: '01', name: '张子轩', comment: '该生本学期表现优异，学习态度端正，积极参与课堂互动，是同学们的榜样。希望下学期继续保持。' },
  { id: '02', name: '李雨桐', comment: '成绩稳定，性格开朗，乐于助人。在班级活动中表现活跃，具有较强的组织能力。' },
  { id: '03', name: '王强', comment: '基础扎实，但需提高听课专注度。希望今后能更加细心，克服粗心的毛病，成绩会有更大突破。' },
  { id: '04', name: '赵敏', comment: '思维敏捷，对理科有浓厚兴趣。性格稍显内向，建议多与同学交流，全面发展。' },
  { id: '05', name: '刘洋', comment: '本学期进步明显，特别是英语成绩有很大提升。继续保持努力，你一定会取得更好的成绩。' },
  { id: '06', name: '陈思宇', comment: '做事认真负责，担任课代表期间尽职尽责。学习上还需寻找更高效的方法。' },
];

const PRESETS = [
  { label: '2分(1x2)', rows: 2, cols: 1 },
  { label: '4分(2x2)', rows: 2, cols: 2 },
  { label: '6分(3x2)', rows: 3, cols: 2 },
  { label: '8分(4x2)', rows: 4, cols: 2 },
  { label: '10分(5x2)', rows: 5, cols: 2 },
  { label: '12分(6x2)', rows: 6, cols: 2 },
];

// --- Components ---

export default function App() {
  // Global State
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(MOCK_STUDENTS[0].id);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Layout Config State
  const [layoutConfig, setLayoutConfig] = useState({
    preset: '8分(4x2)',
    rows: 4,
    cols: 2,
    marginTop: 15,
    marginLeft: 10,
    gapX: 5,
    gapY: 5,
    showBackground: true
  });

  // Canvas State
  const [zoom, setZoom] = useState(0.75);
  // Default elements in the template cell
  const [elements, setElements] = useState([
    { id: 'e1', type: 'variable', name: '姓名变量', text: '{学生姓名}', x: 20, y: 15, w: 100, h: 30, fontSize: 18, fontWeight: 'bold', align: 'center' },
    { id: 'e2', type: 'variable', name: '评语变量', text: '{评语内容：此处将显示学生的详细评语内容...}', x: 10, y: 55, w: 160, h: 80, fontSize: 12, fontWeight: 'normal', align: 'left' },
    { id: 'e3', type: 'text', name: '固定文本', text: '爱你的老师', x: 110, y: 150, w: 80, h: 24, fontSize: 12, fontWeight: 'normal', align: 'right' },
  ]);
  // 修改：默认选中第二个元素(评语变量)，这样一加载就能看到样式面板
  const [selectedElementId, setSelectedElementId] = useState('e2');

  // Handlers
  const handlePresetChange = (preset) => {
    setLayoutConfig(prev => ({ ...prev, preset: preset.label, rows: preset.rows, cols: preset.cols }));
  };

  const activeStudent = students.find(s => s.id === selectedStudentId);
  const activeElement = elements.find(e => e.id === selectedElementId);

  // A4 Proportions (210 x 297 mm)
  // For screen rendering, let's use a base pixel size and scale it
  const A4_BASE_WIDTH = 794; // approx pixels for A4 at 96dpi
  const A4_BASE_HEIGHT = 1123;

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans overflow-hidden text-gray-800">
      
      {/* 1. Left Column: Student Data */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col z-10 shadow-[2px_0_8px_rgba(0,0,0,0.05)]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <button className="flex items-center text-gray-600 hover:text-blue-600 text-sm mb-4 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> 返回主界面
          </button>
          <h2 className="text-lg font-bold">排版数据</h2>
          <p className="text-xs text-gray-500 mt-1">共有 {students.length} 名学生有评语</p>
          
          <div className="mt-4 relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="按姓名搜索..." 
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {students.filter(s => s.name.includes(searchQuery)).map(student => {
            const isSelected = student.id === selectedStudentId;
            return (
              <div 
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`p-3 rounded-lg cursor-pointer border text-sm transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-50/50 border-blue-400 shadow-sm' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex font-medium text-gray-900 mb-1">
                  <span className="text-gray-400 mr-2">{student.id}</span>
                  {student.name}
                </div>
                <div className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                  {student.comment}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Column: Canvas Area */}
      <div className="flex-1 min-w-0 flex flex-col relative bg-[#e5e7eb]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        {/* Top Bar */}
        <div className="h-12 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-center font-medium absolute top-0 w-full z-10">
          A4 排版画布区
        </div>

        {/* Canvas Container */}
        <div 
          className="flex-1 overflow-auto flex items-center justify-center p-8 pt-20 pb-20"
          onClick={() => setSelectedElementId(null)} // Deselect when clicking outside
        >
          {/* The A4 Paper */}
          <div 
            className="bg-white shadow-xl relative origin-center transition-transform duration-200"
            style={{ 
              width: `${A4_BASE_WIDTH}px`, 
              height: `${A4_BASE_HEIGHT}px`,
              transform: `scale(${zoom})`,
            }}
          >
            {/* Grid Layout Visualization */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                paddingTop: `${layoutConfig.marginTop * 3.78}px`, // basic mm to px conversion
                paddingLeft: `${layoutConfig.marginLeft * 3.78}px`,
                paddingRight: `${layoutConfig.marginLeft * 3.78}px`, // assuming symmetric for now
                paddingBottom: `${layoutConfig.marginTop * 3.78}px`,
                display: 'grid',
                gridTemplateColumns: `repeat(${layoutConfig.cols}, 1fr)`,
                gridTemplateRows: `repeat(${layoutConfig.rows}, 1fr)`,
                gap: `${layoutConfig.gapY * 3.78}px ${layoutConfig.gapX * 3.78}px`,
              }}
            >
              {Array.from({ length: layoutConfig.rows * layoutConfig.cols }).map((_, index) => (
                <div 
                  key={index} 
                  className={`border border-dashed ${index === 0 ? 'border-blue-400 bg-blue-50/10' : 'border-gray-300'} relative`}
                >
                  {/* Render Template Editor ONLY in the first cell */}
                  {index === 0 ? (
                    <div className="absolute inset-0 pointer-events-auto overflow-hidden">
                      {elements.map(el => (
                        <DraggableElement 
                          key={el.id} 
                          element={el} 
                          isSelected={selectedElementId === el.id}
                          onSelect={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Render Preview for other cells */
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
                      [{activeStudent?.name || '学生'}的评语区域预览]
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-md border border-gray-200 flex items-center px-2 py-1 space-x-2 z-10">
        <button onClick={() => setZoom(Math.max(0.25, zoom - 0.1))} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600"><ZoomOut size={16}/></button>
        <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600"><ZoomIn size={16}/></button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <button onClick={() => setZoom(0.75)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600" title="自适应"><Maximize size={16}/></button>
      </div>
    </div>

    {/* 3. Right Column: Settings */}
    <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col z-10 shadow-[-2px_0_8px_rgba(0,0,0,0.02)]">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold">排版设置</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Preset Specifications */}
        <section>
          <h3 className="text-sm font-medium text-gray-900 mb-3">预设规格</h3>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map(preset => (
                <button 
                  key={preset.label}
                  onClick={() => handlePresetChange(preset)}
                  className={`py-1.5 px-2 text-xs rounded border transition-colors ${
                    layoutConfig.preset === preset.label 
                      ? 'bg-blue-500 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>

          <hr className="border-gray-100"/>

          {/* Dimensions & Spacing */}
        <section>
          <h3 className="text-sm font-medium text-gray-900 mb-3">标签尺寸与间距</h3>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="flex items-center text-xs">
              <span className="text-gray-500 whitespace-nowrap">页上边距:</span>
              <input type="number" value={layoutConfig.marginTop} onChange={(e)=>setLayoutConfig({...layoutConfig, marginTop: e.target.value})} className="w-10 flex-1 p-1 border rounded text-center mx-1 focus:border-blue-500 outline-none" />
              <span className="text-gray-400 whitespace-nowrap">mm</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-gray-500 whitespace-nowrap">页左边距:</span>
              <input type="number" value={layoutConfig.marginLeft} onChange={(e)=>setLayoutConfig({...layoutConfig, marginLeft: e.target.value})} className="w-10 flex-1 p-1 border rounded text-center mx-1 focus:border-blue-500 outline-none" />
              <span className="text-gray-400 whitespace-nowrap">mm</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-gray-500 whitespace-nowrap">横向间距:</span>
              <input type="number" value={layoutConfig.gapX} onChange={(e)=>setLayoutConfig({...layoutConfig, gapX: e.target.value})} className="w-10 flex-1 p-1 border rounded text-center mx-1 focus:border-blue-500 outline-none" />
              <span className="text-gray-400 whitespace-nowrap">mm</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-gray-500 whitespace-nowrap">纵向间距:</span>
              <input type="number" value={layoutConfig.gapY} onChange={(e)=>setLayoutConfig({...layoutConfig, gapY: e.target.value})} className="w-10 flex-1 p-1 border rounded text-center mx-1 focus:border-blue-500 outline-none" />
              <span className="text-gray-400 whitespace-nowrap">mm</span>
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 mt-2 flex items-center">
            当前：{layoutConfig.rows}行{layoutConfig.cols}列，共{layoutConfig.rows * layoutConfig.cols}个标签/页
          </div>
        </section>

        <hr className="border-gray-100"/>

        {/* Background Theme */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-sm font-medium text-gray-900">背景主题</h3>
             <label className="flex items-center cursor-pointer">
                <span className="text-xs text-gray-500 mr-2 whitespace-nowrap">显示背景</span>
                <div className="relative flex-shrink-0">
                  <input type="checkbox" className="sr-only" checked={layoutConfig.showBackground} onChange={() => setLayoutConfig({...layoutConfig, showBackground: !layoutConfig.showBackground})} />
                  <div className={`block w-8 h-4 rounded-full transition-colors ${layoutConfig.showBackground ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${layoutConfig.showBackground ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="aspect-square border-2 border-blue-500 rounded bg-white relative cursor-pointer overflow-hidden group">
                 {/* Diagonal line to indicate transparent/none */}
                 <div className="absolute inset-0 bg-white"></div>
                 <div className="absolute top-0 right-0 bottom-0 left-0 border-t border-red-200 transform rotate-45 scale-150 origin-center"></div>
              </div>
              <div className="aspect-square border border-gray-200 rounded bg-white relative cursor-pointer flex items-center justify-center overflow-hidden">
                <div className="w-full h-full opacity-30" style={{backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)', backgroundSize: '5px 5px'}}></div>
              </div>
              <div className="aspect-square border border-gray-200 rounded bg-white relative cursor-pointer flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-blue-50" style={{backgroundImage: 'radial-gradient(#93c5fd 1px, transparent 1px)', backgroundSize: '4px 4px'}}></div>
              </div>
              <div className="aspect-square border border-gray-200 rounded border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400">
                 <Plus size={14} />
                 <span className="text-[10px] mt-1">Upload</span>
              </div>
            </div>
          </section>

          <hr className="border-gray-100"/>

          {/* Add Content */}
          <section>
            <h3 className="text-sm font-medium text-gray-900 mb-3">添加内容</h3>
            <div className="space-y-2">
               <button className="w-full py-1.5 border border-blue-200 text-blue-600 bg-blue-50/30 hover:bg-blue-50 rounded text-sm flex items-center justify-center transition-colors">
                 <Plus size={14} className="mr-1" /> 添加姓名变量
               </button>
               <button className="w-full py-1.5 border border-blue-200 text-blue-600 bg-blue-50/30 hover:bg-blue-50 rounded text-sm flex items-center justify-center transition-colors">
                 <Plus size={14} className="mr-1" /> 添加评语变量
               </button>
               <button className="w-full py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-sm flex items-center justify-center transition-colors">
                 <Plus size={14} className="mr-1" /> 添加固定文本
               </button>
            </div>
          </section>

          {/* Contextual Style Editor (修改为常驻显示) */}
          <hr className="border-gray-100"/>
          <section className={`-mx-4 px-4 py-3 border-y transition-colors ${activeElement ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={`text-sm font-medium ${activeElement ? 'text-gray-900' : 'text-gray-500'}`}>元素样式</h3>
              {activeElement ? (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">已选中: {activeElement.name}</span>
              ) : (
                <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">未选中元素</span>
              )}
            </div>
            
            {activeElement ? (
              <div className="space-y-3">
                {/* Font row */}
                <div className="flex space-x-2">
                  <select className="flex-1 text-sm border rounded p-1 outline-none focus:border-blue-500">
                    <option>思源黑体</option>
                    <option>宋体</option>
                    <option>楷体</option>
                  </select>
                  <select className="w-16 text-sm border rounded p-1 outline-none focus:border-blue-500" defaultValue="12">
                    <option>12</option>
                    <option>14</option>
                    <option>16</option>
                    <option>18</option>
                    <option>24</option>
                  </select>
                </div>

                {/* Format row */}
                <div className="flex items-center space-x-2">
                  <div className="flex border rounded overflow-hidden">
                    <button className="p-1.5 bg-white hover:bg-gray-100 border-r text-gray-700"><Bold size={14}/></button>
                    <button className="p-1.5 bg-white hover:bg-gray-100 border-r text-gray-700"><Italic size={14}/></button>
                    <button className="p-1.5 bg-white hover:bg-gray-100 text-gray-700"><Underline size={14}/></button>
                  </div>
                  <div className="flex border rounded overflow-hidden">
                    <button className="p-1.5 bg-gray-100 border-r text-gray-700"><AlignLeft size={14}/></button>
                    <button className="p-1.5 bg-white hover:bg-gray-100 border-r text-gray-700"><AlignCenter size={14}/></button>
                    <button className="p-1.5 bg-white hover:bg-gray-100 text-gray-700"><AlignRight size={14}/></button>
                  </div>
                </div>

                {/* Color & Spacing */}
                <div className="flex items-center space-x-3">
                   <div className="flex items-center space-x-1 border rounded p-1 bg-white">
                      <div className="w-4 h-4 bg-gray-800 rounded-full border"></div>
                   </div>
                   <select className="flex-1 text-sm border rounded p-1 outline-none focus:border-blue-500" defaultValue="1.5">
                    <option>1.0倍</option>
                    <option>1.5倍</option>
                    <option>2.0倍</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 py-6 text-center border-2 border-dashed border-gray-200 rounded-md bg-white">
                 点击画布中的文字元素<br/>即可配置样式
              </div>
            )}
          </section>

        </div>

        {/* Bottom Action */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={() => setIsPreviewMode(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center"
          >
            进入打印预览
          </button>
        </div>
      </div>

      {/* 4. Print Preview Modal (Simulated) */}
      {isPreviewMode && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col">
          {/* Header */}
          <div className="h-14 bg-white px-6 flex items-center justify-between border-b border-gray-200">
             <div className="flex items-center">
                <button onClick={() => setIsPreviewMode(false)} className="mr-4 p-1 hover:bg-gray-100 rounded text-gray-500">
                  <X size={20} />
                </button>
                <h2 className="font-bold text-gray-800">打印预览 (共 {Math.ceil(students.length / (layoutConfig.rows * layoutConfig.cols))} 页)</h2>
             </div>
             <div className="flex space-x-3">
               <button className="px-4 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <Download size={14} className="mr-1.5" /> 导出 PDF
               </button>
               <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center shadow-sm">
                  <Printer size={14} className="mr-1.5" /> 直接打印
               </button>
             </div>
          </div>
          
          {/* Preview Area */}
          <div className="flex-1 overflow-auto flex flex-col items-center p-8 space-y-8 pb-20">
             {/* Mocking just one page for preview simplicity */}
             <div 
                className="bg-white shadow-2xl relative flex-shrink-0"
                style={{ 
                  width: `${A4_BASE_WIDTH}px`, 
                  height: `${A4_BASE_HEIGHT}px`,
                  minWidth: `${A4_BASE_WIDTH}px`,
                  minHeight: `${A4_BASE_HEIGHT}px`,
                  paddingTop: `${layoutConfig.marginTop * 3.78}px`,
                  paddingLeft: `${layoutConfig.marginLeft * 3.78}px`,
                  paddingRight: `${layoutConfig.marginLeft * 3.78}px`,
                  paddingBottom: `${layoutConfig.marginTop * 3.78}px`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${layoutConfig.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${layoutConfig.rows}, 1fr)`,
                  gap: `${layoutConfig.gapY * 3.78}px ${layoutConfig.gapX * 3.78}px`,
                }}
             >
                {Array.from({ length: layoutConfig.rows * layoutConfig.cols }).map((_, index) => {
                  const studentIndex = index;
                  const student = students[studentIndex];
                  
                  return (
                    <div key={index} className="relative overflow-hidden" style={{ border: layoutConfig.showBackground ? '1px dashed #e5e7eb' : 'none' }}>
                      {student ? (
                         // Render template elements for this student
                         <div className="absolute inset-0">
                           {elements.map(el => {
                             let content = el.text;
                             if (el.text === '{学生姓名}') content = student.name;
                             if (el.text.includes('{评语内容')) content = student.comment;

                             return (
                               <div 
                                 key={el.id}
                                 style={{
                                   position: 'absolute',
                                   left: `${el.x}px`,
                                   top: `${el.y}px`,
                                   width: `${el.w}px`,
                                   height: `${el.h}px`,
                                   fontSize: `${el.fontSize}px`,
                                   fontWeight: el.fontWeight,
                                   textAlign: el.align,
                                 }}
                                 className="leading-relaxed"
                               >
                                 {content}
                               </div>
                             )
                           })}
                         </div>
                      ) : null}
                    </div>
                  )
                })}
             </div>

             {/* Pagination (Mock) */}
             <div className="fixed bottom-6 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-4">
                <button className="text-gray-400 hover:text-white"><ChevronLeft size={20}/></button>
                <span className="text-sm font-medium">第 1 页 / 共 {Math.ceil(students.length / (layoutConfig.rows * layoutConfig.cols))} 页</span>
                <button className="hover:text-white"><ChevronRight size={20}/></button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- Helper Component: Draggable Element on Canvas ---
function DraggableElement({ element, isSelected, onSelect }) {
  // In a real app, use react-use-gesture or framer-motion. 
  // Here we simulate the visual bounding box and selection state.
  return (
    <div
      onClick={onSelect}
      className={`absolute cursor-move select-none ${isSelected ? 'ring-1 ring-blue-500 z-10 bg-blue-50/10' : 'hover:ring-1 hover:ring-gray-300'}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.w}px`,
        height: `${element.h}px`,
        fontSize: `${element.fontSize}px`,
        fontWeight: element.fontWeight,
        textAlign: element.align,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: element.align === 'center' ? 'center' : element.align === 'right' ? 'flex-end' : 'flex-start'
      }}
    >
      <div className="w-full h-full p-1 border border-transparent whitespace-pre-wrap leading-tight overflow-hidden">
        {element.text}
      </div>

      {/* Resize/Transform Handles (Visual only for prototype) */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500 cursor-nwse-resize"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-500 cursor-nesw-resize"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-500 cursor-nesw-resize"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500 cursor-nwse-resize"></div>
          
          <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-white border border-blue-500 cursor-ew-resize"></div>
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-white border border-blue-500 cursor-ew-resize"></div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border border-blue-500 cursor-ns-resize"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border border-blue-500 cursor-ns-resize"></div>
          
          {/* Drag handle icon */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white rounded p-0.5 cursor-move shadow-sm">
             <GripHorizontal size={12} />
          </div>
        </>
      )}
    </div>
  );
}