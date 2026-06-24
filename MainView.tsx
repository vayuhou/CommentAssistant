import React, { useState, useMemo } from 'react';
import { 
  Download, Upload, UserPlus, Zap, Eraser, Trash2, Printer, FileSpreadsheet, FileText, 
  Search, Lock, Unlock, Copy, Sparkles, RefreshCw,
  Cloud, Calendar, Users, CheckCircle2
} from 'lucide-react';

const TAG_CATEGORIES = {
  learning: { title: '学习表现', tags: ['思维敏捷', '积极发言', '书写工整', '专注力强', '热爱阅读', '偶尔粗心'] },
  personality: { title: '性格品质', tags: ['乐于助人', '诚实守信', '开朗乐观', '沉稳内敛', '善良热心'] },
  behavior: { title: '行为习惯', tags: ['遵守纪律', '劳动积极', '尊师重道', '团结同学', '偶尔迟到'] },
  specialty: { title: '特长/建议', tags: ['钢琴十级', '体育健将', '艺术特长', '组织力强', '建议多提问'] }
};

const initialStudents = Array.from({ length: 15 }, (_, i) => ({
  id: `std_${i + 1}`,
  no: String(i + 1).padStart(2, '0'),
  name: ['张子轩', '李雨桐', '王强', '赵芳', '陈大文'][i % 5] + (i > 4 ? i : ''),
  type: ['优秀生', '中等生', '后进生'][i % 3],
  tags: {
    learning: i % 3 === 0 ? ['思维敏捷', '积极发言', '书写工整'] : ['思维敏捷', '积极发言'],
    personality: i % 2 === 0 ? ['乐于助人', '诚实守信'] : ['乐于助人'],
    behavior: ['遵守纪律'],
    specialty: ['钢琴十级']
  },
  comment: i === 0 ? '张子轩同学在校表现优异，思维敏捷，课上积极发言。乐于助人，是同学的好榜样。...' : '',
  status: i === 0 ? '已生成' : '未生成',
  locked: false,
}));

export default function App() {
  const [students, setStudents] = useState(initialStudents);
  const [selectedIds, setSelectedIds] = useState(['std_1']);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部状态');
  const [typeFilter, setTypeFilter] = useState('全部类型');

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) setSelectedIds([]);
    else setSelectedIds(filteredStudents.map(s => s.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleTag = (studentId, category, tag) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId || s.locked) return s;
      const currentTags = s.tags[category];
      const newTags = currentTags.includes(tag) 
        ? currentTags.filter(t => t !== tag) 
        : [...currentTags, tag];
      return { ...s, tags: { ...s.tags, [category]: newTags } };
    }));
  };

  const handleCommentChange = (studentId, value) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId || s.locked) return s;
      return { ...s, comment: value, status: value ? '手动编辑' : '未生成' };
    }));
  };

  const handleAction = (studentId, actionType) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      if (actionType === 'lock') return { ...s, locked: !s.locked };
      if (s.locked) return s; // 其他操作防锁定
      
      if (actionType === 'generate') return { ...s, comment: '基于当前标签生成的评语...', status: '已生成' };
      if (actionType === 'ai_polish') return { ...s, comment: '🚀 AI 润色后的评语...', status: 'AI润色' };
      if (actionType === 'ai_rewrite') return { ...s, comment: '🔄 AI 完全重写的评语...', status: '已生成' };
      if (actionType === 'delete') return { ...s, comment: '', status: '未生成', tags: { learning: [], personality: [], behavior: [], specialty: [] } };
      return s;
    }));
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchName = s.name.includes(searchTerm);
      const matchStatus = statusFilter === '全部状态' || s.status === statusFilter || (statusFilter === '已生成' && s.status !== '未生成');
      const matchType = typeFilter === '全部类型' || s.type === typeFilter;
      return matchName && matchStatus && matchType;
    });
  }, [students, searchTerm, statusFilter, typeFilter]);

  const stats = {
    total: students.length,
    generated: students.filter(s => s.status !== '未生成').length,
    locked: students.filter(s => s.locked).length
  };

  const renderTags = (student, categoryKey) => {
    return (
      <div className="flex flex-wrap gap-2 py-2">
        {student.tags[categoryKey].map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(student.id, categoryKey, tag)}
            disabled={student.locked}
            className={`px-3 py-1 text-[13px] rounded-full transition-colors whitespace-nowrap border ${
              true /* 在设计图中，展示出来的都是已选中的样式，若要选其他标签需点击下拉或弹窗，这里简化为展示已有 */
                ? 'bg-[#EBF3FF] text-[#3B82F6] border-[#BFDBFE]' 
                : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
            } ${student.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tag}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#F4F5F7] font-sans text-gray-800 min-w-[1400px] overflow-hidden">
      
      {/* 顶部工具栏 1: Logo 与 状态统计 (还原设计图样式) */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 bg-blue-500 rounded text-white shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <h1 className="text-[18px] font-bold text-gray-800 tracking-wide">班主任评语助手</h1>
        </div>

        <div className="flex items-center gap-3 text-[13px]">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
            <div className="w-2 h-2 rounded-full bg-green-500"></div> 当前激活状态
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-gray-400" /> 有效期至：2024-12-31
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            <Zap className="w-3.5 h-3.5 text-blue-500" /> AI剩余：850次
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-200">
            <Users className="w-3.5 h-3.5 text-gray-400" /> 学生总数：{stats.total}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> 已生成：{stats.generated}
          </div>
        </div>
      </header>

      {/* 顶部工具栏 2: 全局操作按钮 (还原设计图的按钮分组与颜色) */}
      <div className="flex items-center gap-2.5 px-6 py-3 bg-[#F8F9FB] border-b border-gray-200 shrink-0">
        <button className="flex items-center gap-1.5 px-4 py-1.5 text-[14px] text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 shadow-sm">
          <Download className="w-4 h-4 text-gray-500" /> 下载模板
        </button>
        <button className="flex items-center gap-1.5 px-4 py-1.5 text-[14px] text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 shadow-sm">
          <Upload className="w-4 h-4 text-gray-500" /> 导入名单
        </button>
        <button className="flex items-center gap-1.5 px-4 py-1.5 text-[14px] text-green-600 bg-white border border-gray-200 rounded hover:bg-green-50 shadow-sm ml-2">
          <UserPlus className="w-4 h-4" /> 添加学生
        </button>
        <button className="flex items-center gap-1.5 px-5 py-1.5 text-[14px] text-white bg-blue-500 border border-blue-600 rounded hover:bg-blue-600 shadow-sm font-medium">
          <Zap className="w-4 h-4" /> 一键生成全部
        </button>
        <button className="flex items-center gap-1.5 px-4 py-1.5 text-[14px] text-yellow-600 bg-white border border-gray-200 rounded hover:bg-yellow-50 shadow-sm ml-2">
          <Eraser className="w-4 h-4" /> 清空所有标签
        </button>
        <button className="flex items-center gap-1.5 px-4 py-1.5 text-[14px] text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 shadow-sm">
          <Trash2 className="w-4 h-4" /> 删除所有学生
        </button>
        
        <div className="ml-auto flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-1.5 text-[14px] text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 shadow-sm">
            <Printer className="w-4 h-4 text-gray-500" /> 排版打印PDF
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 text-[14px] text-green-600 bg-white border border-gray-200 rounded hover:bg-green-50 shadow-sm">
            <FileSpreadsheet className="w-4 h-4" /> 导出评语表格版
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 text-[14px] text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 shadow-sm">
            <FileText className="w-4 h-4 text-gray-500" /> 导出评语Word版
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-auto p-5 relative">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-max relative">
          
          {/* 筛选与搜索 */}
          <div className="flex items-center gap-6 p-4 border-b border-gray-100 shrink-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="按姓名搜索学生..." 
                className="pl-9 pr-4 py-1.5 w-60 text-[14px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-700">状态筛选：</span>
              <select className="text-[14px] border border-gray-300 rounded px-3 py-1.5 bg-white outline-none w-32" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option>全部状态</option>
                <option>未生成</option>
                <option>已生成</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-700">类型筛选：</span>
              <select className="text-[14px] border border-gray-300 rounded px-3 py-1.5 bg-white outline-none w-32" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option>全部类型</option>
                <option>优秀生</option>
                <option>中等生</option>
                <option>后进生</option>
              </select>
            </div>
          </div>

          {}
          <div className="flex-1 relative">
            <table className="w-full text-left border-collapse table-fixed min-w-[1300px]">
              <thead className="bg-[#F8F9FB] shadow-[0_1px_0_0_#e5e7eb]">
                <tr>
                  <th className="px-4 py-4 w-12 text-center align-middle">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer" checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0} onChange={toggleSelectAll} />
                  </th>
                  <th className="px-2 py-4 w-16 text-[15px] font-semibold text-gray-800 text-center align-middle">序号</th>
                  <th className="px-4 py-4 w-24 text-[15px] font-semibold text-gray-800 align-middle">姓名</th>
                  <th className="px-4 py-4 w-24 text-[15px] font-semibold text-gray-800 align-middle">类型</th>
                  <th className="px-3 py-4 w-32 text-[15px] font-semibold text-gray-800 align-middle">学习表现</th>
                  <th className="px-3 py-4 w-32 text-[15px] font-semibold text-gray-800 align-middle">性格品质</th>
                  <th className="px-3 py-4 w-32 text-[15px] font-semibold text-gray-800 align-middle">行为习惯</th>
                  <th className="px-3 py-4 w-32 text-[15px] font-semibold text-gray-800 align-middle">特长/建议</th>
                  <th className="px-4 py-4 min-w-[280px] text-[15px] font-semibold text-gray-800 align-middle">生成的评语</th>
                  <th className="px-4 py-4 w-[200px] text-[15px] font-semibold text-gray-800 text-center align-middle">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredStudents.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  // 完美复刻设计图选中行效果：浅蓝色背景 + 蓝色内阴影边框
                  const rowClasses = isSelected 
                    ? "relative bg-[#F4F8FF] shadow-[inset_0_0_0_1px_#60A5FA]" 
                    : "relative border-b border-gray-200 hover:bg-gray-50";

                  const typeColors = {
                    '优秀生': 'text-green-600',
                    '中等生': 'text-orange-500',
                    '后进生': 'text-red-500'
                  };

                  return (
                    <tr key={student.id} className={rowClasses}>
                      {/* 复选框 */}
                      <td className="px-4 py-5 text-center align-middle border-r border-gray-100/50">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer" checked={isSelected} onChange={() => toggleSelect(student.id)} />
                      </td>
                      {/* 序号 */}
                      <td className="px-2 py-5 text-[15px] text-gray-900 text-center align-middle border-r border-gray-100/50">{student.no}</td>
                      {/* 姓名 */}
                      <td className="px-4 py-5 text-[15px] text-gray-900 align-middle border-r border-gray-100/50">{student.name}</td>
                      {/* 类型 */}
                      <td className={`px-4 py-5 text-[14px] align-middle border-r border-gray-100/50 ${typeColors[student.type]}`}>
                        {student.type} <span className="text-gray-400 text-[10px] ml-1">▼</span>
                      </td>
                      
                      {/* 标签列 */}
                      <td className="px-3 align-middle border-r border-gray-100/50">{renderTags(student, 'learning')}</td>
                      <td className="px-3 align-middle border-r border-gray-100/50">{renderTags(student, 'personality')}</td>
                      <td className="px-3 align-middle border-r border-gray-100/50">{renderTags(student, 'behavior')}</td>
                      <td className="px-3 align-middle border-r border-gray-100/50">{renderTags(student, 'specialty')}</td>
                      
                      {/* 生成的评语 (带状态角标) */}
                      <td className="px-4 py-3 align-middle border-r border-gray-100/50">
                        <div className="relative w-full">
                          <textarea 
                            className={`w-full h-24 p-3 pr-16 text-[14px] leading-relaxed border rounded focus:outline-none focus:border-blue-400 resize-none ${student.locked ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-800'}`}
                            placeholder="等待生成评语..."
                            value={student.comment}
                            onChange={(e) => handleCommentChange(student.id, e.target.value)}
                            disabled={student.locked}
                          />
                          <div className="absolute bottom-3 right-3">
                            <span className={`text-[12px] px-2 py-0.5 rounded ${
                              student.status === '未生成' ? 'bg-gray-100 text-gray-400' : 
                              student.status === '已生成' ? 'bg-gray-200 text-gray-600' :
                              student.status === 'AI润色' ? 'bg-orange-100 text-orange-600' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {student.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      {}
                      <td className="px-4 py-3 align-middle">
                        <div className="grid grid-cols-2 gap-2 w-[180px] mx-auto">
                          <button onClick={() => handleAction(student.id, 'generate')} disabled={student.locked} className="flex items-center justify-center gap-1 py-1.5 px-2 border border-gray-200 bg-white rounded text-[13px] text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors disabled:opacity-50">
                            <Zap className="w-3.5 h-3.5 text-blue-500" /> 生成
                          </button>
                          <button onClick={() => handleAction(student.id, 'ai_polish')} disabled={student.locked} className="flex items-center justify-center gap-1 py-1.5 px-2 border border-gray-200 bg-white rounded text-[13px] text-gray-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-colors disabled:opacity-50">
                            <Sparkles className="w-3.5 h-3.5 text-orange-400" /> AI润色
                          </button>
                          <button onClick={() => handleAction(student.id, 'ai_rewrite')} disabled={student.locked} className="flex items-center justify-center gap-1 py-1.5 px-2 border border-gray-200 bg-white rounded text-[13px] text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                            <RefreshCw className="w-3.5 h-3.5 text-gray-500" /> AI重写
                          </button>
                          <button className="flex items-center justify-center gap-1 py-1.5 px-2 border border-gray-200 bg-white rounded text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
                            <Copy className="w-3.5 h-3.5 text-gray-500" /> 复制
                          </button>
                          <button onClick={() => handleAction(student.id, 'lock')} className={`flex items-center justify-center gap-1 py-1.5 px-2 border border-gray-200 bg-white rounded text-[13px] transition-colors ${student.locked ? 'text-gray-700 bg-gray-100' : 'text-gray-700 hover:bg-gray-50'}`}>
                            {student.locked ? <Lock className="w-3.5 h-3.5 text-yellow-500" /> : <Unlock className="w-3.5 h-3.5 text-yellow-500" />} {student.locked ? '已锁定' : '锁定'}
                          </button>
                          <button onClick={() => handleAction(student.id, 'delete')} disabled={student.locked} className="flex items-center justify-center gap-1 py-1.5 px-2 border border-red-100 bg-red-50 rounded text-[13px] text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                            <Trash2 className="w-3.5 h-3.5 text-red-500" /> 删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {}
            {selectedIds.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-[#EBF3FF] border-t border-blue-200 py-3 px-6 flex items-center gap-5 z-20 text-[14px]">
                <span className="text-gray-800">已选择 <strong className="text-blue-600">{selectedIds.length}</strong> 位学生：</span>
                <button className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 px-3 border-r border-gray-300">
                  <Zap className="w-4 h-4 text-blue-500" /> 批量生成
                </button>
                <button className="flex items-center gap-1.5 text-gray-700 hover:text-orange-600 px-3 border-r border-gray-300">
                  <Sparkles className="w-4 h-4 text-orange-400" /> 批量 AI 润色
                </button>
                <button className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 px-3 border-r border-gray-300">
                  <RefreshCw className="w-4 h-4 text-gray-500" /> 批量 AI 重写
                </button>
                <button className="flex items-center gap-1.5 text-gray-700 hover:text-orange-600 px-3 border-r border-gray-300">
                  <Eraser className="w-4 h-4 text-yellow-500" /> 批量清空标签
                </button>
                <button className="flex items-center gap-1.5 text-gray-700 hover:text-red-600 px-3">
                  <Trash2 className="w-4 h-4 text-red-500" /> 批量删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <footer className="bg-[#F4F5F7] px-6 py-3 flex items-center justify-between text-[13px] text-gray-500 shrink-0">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-gray-400" /> 数据已自动保存到本地
        </div>
        <div className="flex items-center gap-4">
          <span>当前学生数：{stats.total} 人</span>
          <span className="text-gray-300">|</span>
          <span>当前已生成数量：{stats.generated} 人</span>
          <span className="text-gray-300">|</span>
          <span>当前锁定数量：{stats.locked} 人</span>
        </div>
      </footer>

    </div>
  );
}