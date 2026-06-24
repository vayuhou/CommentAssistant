import React, { useState } from 'react';
import { 
  Search, ArrowRight, Settings, User, BarChart2,
  CheckCircle2, XCircle, Sparkles, Clock
} from 'lucide-react';

const TAG_DATA = {
  learning: { label: '学习表现', tags: ['勤奋好学', '成绩优异', '积极发言', '需提高'] },
  personality: { label: '性格品质', tags: ['诚实守信', '乐于助人', '团结同学', '活泼开朗'] },
  behavior: { label: '行为习惯', tags: ['遵守纪律', '讲究卫生', '尊敬师长'] },
  specialty: { label: '特长能力', tags: ['绘画', '体育', '音乐'] }
};

const MOCK_STUDENTS = [
  { id: '17', no: '17', name: '王强', preview: '该生本学期表现能异，学习，积极学期...', status: '未生成', statusColor: 'text-red-500' },
  { id: '18', no: '18', name: '李子轩', preview: '该生本学期表现优异，学习积极主动...', status: 'AI润色', statusColor: 'text-blue-500' },
  { id: '19', no: '19', name: '张薇', preview: '学习认真，但需加强... (已生成)', status: '已生成', statusColor: 'text-green-500' },
  { id: '20', no: '20', name: '王强', preview: '课上纪律需要，课堂奎棠学习积极主动...', status: '未生成', statusColor: 'text-red-500' },
  { id: '21', no: '21', name: '陈明', preview: '思维活跃，但在细节上需要更加注意...', status: '已生成', statusColor: 'text-green-500' },
  { id: '22', no: '22', name: '刘洋', preview: '表现平稳，按时完成作业...', status: '已锁定', statusColor: 'text-gray-600' },
];

export default function App() {
  const [activeStudent, setActiveStudent] = useState(MOCK_STUDENTS[1]);
  const [selectedTags, setSelectedTags] = useState(['勤奋好学', '成绩优异', '积极发言', '遵守纪律', '体育']);
  const [commentText, setCommentText] = useState('该生本学期表现优异，学习积极主动，课堂上能积极发言，展现出良好的求知欲。成绩在班级中名列前茅，是同学们学习的榜样。生活中诚实守信，乐于助人，能与同学友好相处，具备良好的团队精神。遵守学校纪律，行为规范。在体育方面有特长，积极参加学校活动。希望未来能继续保持，并在细节上更加精益求精，争取更大的进步！(AI 润色)');
  const [isLocked, setIsLocked] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="h-screen flex flex-col bg-[#F3F4F6] text-gray-800 font-sans min-w-[1300px] overflow-hidden">
      
      {/* 顶部导航 */}
      <header className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-200 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-[18px] font-bold text-gray-800 tracking-wide">班主任评语助手</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <User className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 面包屑 / 视图标题 */}
      <div className="px-6 py-2 bg-[#F3F4F6] border-b border-gray-200 flex items-center text-sm font-medium text-blue-600 shrink-0">
        <BarChart2 className="w-4 h-4 mr-2" /> AI 增强视图
      </div>

      {/* 主体三栏布局 */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        
        {/* 左侧：学生列表区 */}
        <div className="w-[340px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 shrink-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-[15px]">学生列表区</h2>
            <button className="bg-[#3B82F6] hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs flex items-center gap-1 shadow-sm transition-colors">
              返回表格视图 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="p-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索学生姓名" 
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
              />
            </div>
            
            <div className="flex items-center justify-between text-[13px] text-gray-700 bg-gray-50 px-2 py-2 rounded">
              <span>学生总数: 48</span>
              <span>已生成: 42</span>
              <span>AI润色: 25</span>
              <span>已锁定: 10</span>
            </div>

            <div className="flex items-center justify-between text-[13px] border-b border-gray-100 pb-2">
              <select className="border-none bg-transparent outline-none text-gray-600 cursor-pointer">
                <option>全部状态</option>
              </select>
              <button className="text-gray-600 hover:text-gray-900">未生成</button>
              <button className="text-gray-600 hover:text-gray-900">已生成</button>
              <button className="text-gray-600 hover:text-gray-900">AI润色</button>
              <select className="border-none bg-transparent outline-none text-gray-600 cursor-pointer">
                <option>已锁定</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-[40px_60px_1fr_60px] gap-2 px-4 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
              <div>序号</div>
              <div>姓名</div>
              <div>评语预览</div>
              <div className="text-right">状态</div>
            </div>
            <div className="flex flex-col pb-4">
              {MOCK_STUDENTS.map(s => (
                <div 
                  key={s.id}
                  onClick={() => setActiveStudent(s)}
                  className={`grid grid-cols-[40px_60px_1fr_60px] gap-2 px-4 py-3.5 text-sm cursor-pointer border-b border-gray-50 transition-colors ${
                    activeStudent.id === s.id ? 'bg-[#EBF3FF] border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="text-gray-500 font-mono">{s.no}</div>
                  <div className="font-medium text-gray-800">{s.name}</div>
                  <div className="truncate text-gray-500 text-[13px]" title={s.preview}>{s.preview}</div>
                  <div className={`text-right text-[12px] ${s.statusColor}`}>
                    ({s.status})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中间：学生标签与信息区 */}
        <div className="w-[380px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="font-bold text-gray-800 text-[15px]">学生标签与信息区</h2>
          </div>
          
          <div className="p-5 flex flex-col gap-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{activeStudent.name}</h3>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">类型:</span>
                  <select className="border border-gray-300 rounded px-2 py-1 outline-none text-gray-800 focus:border-blue-400 bg-white">
                    <option>优秀生</option>
                    <option>中等生</option>
                    <option>后进生</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">性别:</span>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="gender" defaultChecked className="accent-blue-500"/>男</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="gender" className="accent-blue-500"/>女</label>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-gray-600 text-sm whitespace-nowrap pt-2">补充说明:</span>
              <textarea 
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm h-20 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all bg-white"
                placeholder="老师可输入补充说明"
              ></textarea>
            </div>

            <div className="flex flex-col gap-4 border-t border-gray-100 pt-5">
              {Object.entries(TAG_DATA).map(([key, data]) => (
                <div key={key} className="flex items-start gap-3">
                  <span className="text-gray-700 text-sm w-16 shrink-0 pt-1.5">{data.label}:</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {data.tags.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 text-[13px] rounded transition-all ${
                            isSelected 
                              ? 'bg-[#EBF3FF] text-[#2563EB] border border-[#BFDBFE]' 
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-500'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[14px] font-bold text-gray-800">已选标签</h4>
                <button 
                  onClick={() => setSelectedTags([])}
                  className="text-[13px] text-gray-500 hover:text-gray-800 underline underline-offset-2"
                >
                  清空标签
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 text-[13px] bg-white border border-gray-200 rounded text-gray-700 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[14px] font-bold text-gray-800 mb-3">推荐标签组合</h4>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 text-[13px] bg-[#EBF3FF] text-[#2563EB] border border-[#BFDBFE] rounded shadow-sm">全面发展型</button>
                <button className="px-3 py-1.5 text-[13px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded shadow-sm">刻苦努力型</button>
                <button className="px-3 py-1.5 text-[13px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded shadow-sm">活跃开朗型</button>
              </div>
            </div>

          </div>
        </div>

        {/* 右侧：评语编辑与 AI 操作区 */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-gray-100 shrink-0 sticky top-0 bg-white z-10">
            <h2 className="font-bold text-gray-800 text-[15px]">评语编辑与 AI 操作区</h2>
          </div>

          <div className="p-5 flex flex-col gap-6">
            
            <div className="flex flex-col gap-3">
              <div className={`border-2 rounded-lg overflow-hidden transition-colors flex flex-col bg-[#F8FAFC] ${isLocked ? 'border-gray-200 bg-gray-50' : 'border-[#BFDBFE] focus-within:border-blue-400'}`}>
                <textarea
                  className="w-full h-48 p-4 text-[15px] leading-relaxed resize-none focus:outline-none bg-transparent text-gray-800"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isLocked}
                ></textarea>
                <div className="px-4 py-2 border-t border-gray-200 bg-white flex items-center justify-between text-[13px] text-gray-500 font-medium">
                  <span>当前状态: AI 润色</span>
                  <span>字数统计: {commentText.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 text-[14px] rounded shadow-sm transition-colors">规则生成</button>
                <button className="bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 text-[14px] rounded shadow-sm transition-colors">AI 润色</button>
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-[14px] rounded shadow-sm transition-colors">AI 重写</button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 px-4 py-2 text-[14px] rounded shadow-sm transition-colors">复制评语</button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-[14px] rounded shadow-sm transition-colors">清空评语</button>
                
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[14px] text-gray-700 font-medium cursor-pointer" onClick={() => setIsLocked(!isLocked)}>锁定 / 解锁</span>
                  <button 
                    onClick={() => setIsLocked(!isLocked)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${isLocked ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isLocked ? 'translate-x-5' : ''}`}></span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 text-[15px]">AI 设置</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-gray-700">语气:</span>
                  <select className="border border-gray-300 rounded py-1.5 px-3 text-[14px] w-40 outline-none focus:border-blue-400 bg-white">
                    <option>温和鼓励</option>
                    <option>正式稳重</option>
                    <option>亲切自然</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-gray-700">字数:</span>
                  <select className="border border-gray-300 rounded py-1.5 px-3 text-[14px] w-40 outline-none focus:border-blue-400 bg-white">
                    <option>150字左右</option>
                    <option>100字左右</option>
                    <option>200字左右</option>
                  </select>
                </div>
              </div>

              <button className="w-full relative bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-[15px] shadow-sm flex items-center justify-center transition-all mt-2">
                <Sparkles className="w-4 h-4 mr-2" /> 生成 / AI 操作
                <span className="absolute right-4 text-[13px] text-blue-100 font-normal">
                  AI 剩余次数: 95
                </span>
              </button>
            </div>

            <div className="mt-2 border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-800 text-[15px] mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" /> 历史版本
              </h3>
              <div className="relative pl-3 space-y-6">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gray-200"></div>
                
                <div className="relative">
                  <div className="absolute left-[-11px] top-1.5 w-2 h-2 rounded-full bg-gray-300 border-2 border-white"></div>
                  <div className="pl-4">
                    <div className="text-[14px] font-medium text-gray-700 mb-1">基础版</div>
                    <p className="text-[13px] text-gray-500 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
                      该生本学期表现优异，学习积极主动。 (规则生成)
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-[-11px] top-1.5 w-2 h-2 rounded-full bg-[#3B82F6] border-2 border-white shadow-[0_0_0_2px_#DBEAFE]"></div>
                  <div className="pl-4">
                    <div className="text-[14px] font-medium text-blue-600 mb-1">AI 润色版 (当前)</div>
                    <p className="text-[13px] text-gray-800 leading-relaxed">
                      该生本学期表现优异，学习积极主动，课堂上能积极发言，展现出良好的求知欲。成绩在班级中名列前茅，是同学们学习的榜样。生活中诚实守信...
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E5E7EB;
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #D1D5DB;
        }
      `}} />
    </div>
  );
}