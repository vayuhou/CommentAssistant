import React from 'react';
import { FileText, Zap, Users, CheckCircle2, Calendar, ArrowLeft } from 'lucide-react';
import { useApp } from '../store';

export function Header({title='班主任评语助手',onBack}:{title?:string;onBack?:()=>void}) {
  const {students,activation}=useApp(); const generated=students.filter(s=>s.comment).length;
  return <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
    <div className="flex items-center gap-2">{onBack&&<button onClick={onBack} className="p-1.5 rounded hover:bg-gray-100" aria-label="返回表格视图"><ArrowLeft size={18}/></button>}<div className="flex items-center justify-center w-7 h-7 bg-blue-500 rounded text-white"><FileText size={16}/></div><h1 className="text-[18px] font-bold">{title}</h1></div>
    <div className="flex items-center gap-2 text-xs max-w-[68vw] overflow-x-auto shrink"><Badge color={activation.active?'green':'red'}>{activation.active?'当前激活':'试用模式'}</Badge>{activation.active?<><Badge><Calendar size={13}/>有效期至：{activation.expiresAt?activation.expiresAt.slice(0,10):'—'}</Badge><Badge color="blue"><Zap size={13}/>AI剩余：{activation.remainingAiCount}次</Badge></>:<Badge color="blue"><Zap size={13}/>免费生成：{activation.trialRemaining}次</Badge>}<Badge><Users size={13}/>学生：{students.length}</Badge><Badge color="green"><CheckCircle2 size={13}/>已生成：{generated}</Badge></div>
  </header>;
}
function Badge({children,color='gray'}:{children:React.ReactNode;color?:string}){const map:Record<string,string>={green:'bg-green-50 text-green-600 border-green-100',blue:'bg-blue-50 text-blue-600 border-blue-100',red:'bg-red-50 text-red-600 border-red-100',gray:'bg-gray-50 text-gray-600 border-gray-200'};return <span className={`flex items-center gap-1 px-3 py-1 rounded-full border ${map[color]}`}>{children}</span>}
export function Toast(){const {toast}=useApp();return toast?<div className="fixed z-[100] left-1/2 top-5 -translate-x-1/2 rounded-lg bg-gray-900 text-white px-5 py-2.5 shadow-xl text-sm">{toast}</div>:null}
export function Modal({title,children,onClose}:{title:string;children:React.ReactNode;onClose:()=>void}){return <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-5" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"><div className="px-5 py-4 border-b font-bold flex justify-between"><span>{title}</span><button onClick={onClose}>×</button></div><div className="p-5">{children}</div></div></div>}
