import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialStudents, STATUS_LABELS } from './data';
import { generateComment, generateMotto, resetGenerationMemory } from './rules';
import type { ActivationState, PdfElement, PdfLayoutConfig, Student, TagKey } from './types';
import { createId } from './id';

const STORAGE_KEY = 'comment-assistant-project-v1';
const deviceId = localStorage.getItem('comment-assistant-device') || createId();
localStorage.setItem('comment-assistant-device', deviceId);

const emptyActivation: ActivationState = { code:'', active:false, expired:false, expiresAt:'', totalAiQuota:0, usedAiCount:0, remainingAiCount:0, deviceId, trialRemaining:3 };
const defaultLayout: PdfLayoutConfig = { preset: '4分', rows: 2, cols: 2, marginTop: 10, marginLeft: 10, gapX: 3, gapY: 3, showBackground: true, backgroundUrl: '/4/简约.png', zoom: .72 };
const defaultElements: PdfElement[] = [
  { id: 'name', type: 'variable', field: 'studentName', name: '学生姓名', text: '{学生姓名}', x: 24, y: 22, w: 230, h: 34, fontSize: 18, fontWeight: 'bold', fontStyle: 'normal', underline: false, align: 'center', lineHeight: 1.4, color: '#1f2937' },
  { id: 'motto', type: 'variable', field: 'motto', name: '盼你', text: '{盼你}', x: 26, y: 47, w: 250, h: 28, fontSize: 13, fontWeight: 'bold', fontStyle: 'normal', underline: false, align: 'left', lineHeight: 1.4, color: '#dc2626' },
  { id: 'comment', type: 'variable', field: 'comment', name: '评语内容', text: '{评语内容}', x: 26, y: 68, w: 250, h: 175, fontSize: 13, fontWeight: 'normal', fontStyle: 'normal', underline: false, align: 'left', lineHeight: 1.7, color: '#374151' },
  { id: 'sign', type: 'text', name: '固定文本', text: '爱你的老师', x: 150, y: 250, w: 125, h: 28, fontSize: 13, fontWeight: 'normal', fontStyle: 'normal', underline: false, align: 'right', lineHeight: 1.4, color: '#4b5563' },
];
const legacyTags: Record<string,string> = { 学习认真:'勤奋努力',思维敏捷:'思维活跃',积极发言:'思维活跃',专注力强:'学习之星',开朗乐观:'阳光开朗',沉稳内敛:'温柔细腻',善良热心:'乐于助人',自信大方:'阳光开朗',遵守纪律:'守纪模范',劳动积极:'劳动光荣',尊师重道:'懂礼貌',团结同学:'人缘极好',做事认真:'责任感强',时间观念强:'惜时如金',钢琴特长:'才艺小星',体育出色:'运动健将',艺术特长:'才艺小星',组织力强:'责任感强',表达能力强:'小主持人',动手能力强:'科技达人',偶尔粗心:'战胜粗心',课堂参与不足:'胆小害羞',作业有时拖拉:'作业拖拉',需要增强自信:'胆小害羞',时间管理待提升:'惜时如金',建议多提问:'学习之星',坚持课外阅读:'阅读打卡',加强体育锻炼:'运动健将',制定学习计划:'惜时如金',勇于展示自己:'小主持人' };
function migrateStudents(items: Student[]){return items.map(s=>({...s,motto:s.motto||(s.comment?generateMotto(s):undefined),tags:Object.fromEntries(Object.entries(s.tags).map(([k,v])=>[k,[...new Set((v||[]).map(t=>legacyTags[t]||t))]])) as Student['tags']}))}
function migrateLayout(saved?:PdfLayoutConfig){if(!saved)return defaultLayout;const preset=saved.preset||'4分';const folder=preset.replace('分','');let backgroundUrl=saved.backgroundUrl;if(backgroundUrl?.startsWith('/')&&!backgroundUrl.startsWith('data:'))backgroundUrl=`/${folder}/${backgroundUrl.split('/').pop()}`;return{...defaultLayout,...saved,backgroundUrl:backgroundUrl||defaultLayout.backgroundUrl}}
function migrateElements(saved?:PdfElement[]){if(!saved?.length)return defaultElements;if(saved.some(e=>e.field==='motto'))return saved;return [saved[0],defaultElements[1],...saved.slice(1)]}

type SavedState = { students: Student[]; activation: ActivationState; layout: PdfLayoutConfig; elements: PdfElement[]; selectedIds: string[]; activeStudentId?: string; showStudentName?: boolean };
type Store = SavedState & {
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>; setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setActiveStudentId: (id: string) => void; setLayout: React.Dispatch<React.SetStateAction<PdfLayoutConfig>>; setElements: React.Dispatch<React.SetStateAction<PdfElement[]>>;
  updateStudent: (id: string, patch: Partial<Student>, historyType?: 'base'|'ai_polish'|'ai_rewrite'|'manual') => void;
  addStudent: (student: Student) => void; deleteStudents: (ids: string[]) => void; toggleTag: (id: string, category: TagKey, tag: string) => void;
  generate: (ids: string[], target?: number) => Promise<{success:number;skipped:number}>; runAi: (id: string, mode:'polish'|'rewrite', tone?:string,target?:number) => Promise<void>;
  activate: (code: string) => Promise<boolean>; restoreHistory: (id:string, content:string) => void; statusLabel: (s: Student) => string;
  toast: string; setToast: (value:string) => void;
  showStudentName: boolean; setShowStudentName: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const saved = useMemo(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as SavedState | null; } catch { return null; } }, []);
  const [students, setStudents] = useState<Student[]>(saved?.students?.length ? migrateStudents(saved.students) : initialStudents());
  const [activation, setActivation] = useState<ActivationState>(saved?.activation?.code&&saved.activation.code!=='PY-DEMO-2026-LOCAL'?{...saved.activation,active:false,deviceId,trialRemaining:saved.activation.trialRemaining??3}:emptyActivation);
  const [layout, setLayout] = useState<PdfLayoutConfig>(migrateLayout(saved?.layout));
  const [elements, setElements] = useState(migrateElements(saved?.elements));
  const [showStudentName, setShowStudentName] = useState(saved?.showStudentName ?? true);
  const [selectedIds, setSelectedIds] = useState<string[]>(saved?.selectedIds || []);
  const [activeStudentId, setActiveStudentId] = useState(saved?.activeStudentId || students[0]?.id);
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ students, activation, layout, elements, selectedIds, activeStudentId, showStudentName }));
  }, [students, activation, layout, elements, selectedIds, activeStudentId, showStudentName]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);
  useEffect(() => {
    const refresh=async()=>{
      if(activation.code){const response=await fetch('/api/license/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:activation.code,deviceId})});const result=await response.json().catch(()=>({}));if(response.ok&&result.data?.activation?.active){setActivation(result.data.activation);return}}
      const response=await fetch('/api/trial/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({deviceId})});const result=await response.json().catch(()=>({}));setActivation({...emptyActivation,trialRemaining:result.data?.trial?.remaining??0});
    };refresh().catch(()=>setActivation(current=>({...current,active:false})));
  }, []);

  const updateStudent: Store['updateStudent'] = (id, patch, historyType) => setStudents(prev => prev.map(s => {
    if (s.id !== id) return s;
    const history = historyType && patch.comment !== undefined ? [...s.history, { id: createId(), type: historyType, content: patch.comment, createdAt: new Date().toISOString() }] : s.history;
    return { ...s, ...patch, history, updatedAt: new Date().toISOString() };
  }));
  const addStudent = (student: Student) => setStudents(prev => [...prev, { ...student, no: String(prev.length + 1).padStart(2, '0') }]);
  const deleteStudents = (ids: string[]) => setStudents(prev => prev.filter(s => !ids.includes(s.id)).map((s,i)=>({...s,no:String(i+1).padStart(2,'0')})));
  const toggleTag = (id: string, category: TagKey, tag: string) => setStudents(prev => prev.map(s => s.id !== id || s.locked ? s : ({ ...s, tags: { ...s.tags, [category]: s.tags[category].includes(tag) ? s.tags[category].filter(t=>t!==tag) : [...s.tags[category], tag] }, updatedAt: new Date().toISOString() })));
  const generate: Store['generate'] = async (ids, target = 150) => {
    const trialResponse=await fetch('/api/trial/consume',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({deviceId})});const trialResult=await trialResponse.json().catch(()=>({}));
    if(!trialResponse.ok){if(trialResult.code==='TRIAL_EXHAUSTED')setActivation(a=>({...a,active:false,trialRemaining:0}));throw new Error(trialResult.error||'生成权限检查失败')}
    if(!activation.active)setActivation(a=>({...a,trialRemaining:trialResult.data?.trial?.remaining??a.trialRemaining}));
    let success = 0, skipped = 0;
    if (ids.length > 1) resetGenerationMemory();
    setStudents(prev => prev.map(s => {
      if (!ids.includes(s.id)) return s; if (s.locked) { skipped++; return s; }
      const comment = generateComment(s, target, showStudentName); success++;
      return { ...s, motto:generateMotto(s), comment, baseComment: comment, status: 'base_generated', history: [...s.history, { id: createId(), type: 'base', content: comment, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() };
    }));
    return { success, skipped };
  };
  const runAi: Store['runAi'] = async (id, mode, tone='温和鼓励', target=150) => {
    const student = students.find(s=>s.id===id);
    if (!student || student.locked) throw new Error('该学生已锁定或不存在');
    if (!activation.active || activation.expired || activation.remainingAiCount <= 0) throw new Error('激活状态无效或 AI 次数不足');
    let comment = '';
    const response = await fetch(`/api/comment/ai-${mode}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ student, baseComment:student.comment, tone, targetLength:target, showStudentName, licenseCode:activation.code, deviceId }) });
    const result = await response.json().catch(()=>({}));
    if (response.ok) { comment = result.data?.comment || ''; if(result.data?.activation)setActivation(result.data.activation); }
    else { if(['LICENSE_REQUIRED','DEVICE_MISMATCH','LICENSE_EXPIRED','AI_QUOTA_EXHAUSTED'].includes(result.code))setActivation(a=>({...a,active:false,remainingAiCount:result.code==='AI_QUOTA_EXHAUSTED'?0:a.remainingAiCount})); throw new Error(result.error || 'AI 服务请求失败'); }
    if (!comment) throw new Error('AI 返回内容为空');
    updateStudent(id, { motto:generateMotto(student), comment, aiComment: comment, status: mode==='polish'?'ai_polished':'ai_rewritten' }, mode==='polish'?'ai_polish':'ai_rewrite');
  };
  const activate = async (code: string) => {
    const response=await fetch('/api/license/activate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,deviceId})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||'激活失败');
    if(!result.data?.activation)return false;setActivation(result.data.activation);return true;
  };
  const restoreHistory = (id:string, content:string) => updateStudent(id,{comment:content,status:'edited'},'manual');
  const value: Store = { students,setStudents,activation,layout,setLayout,elements,setElements,selectedIds,setSelectedIds,activeStudentId,setActiveStudentId,updateStudent,addStudent,deleteStudents,toggleTag,generate,runAi,activate,restoreHistory,statusLabel:s=>s.locked?'已锁定':STATUS_LABELS[s.status],toast,setToast,showStudentName,setShowStudentName };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() { const value = useContext(AppContext); if (!value) throw new Error('AppProvider missing'); return value; }
