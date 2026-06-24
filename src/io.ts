import * as XLSX from 'xlsx';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import type { Student } from './types';
import { createStudent } from './data';

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
const date = () => new Date().toISOString().slice(0,10);

export function exportExcel(students: Student[]) {
  const rows = students.map(s=>({序号:s.no,姓名:s.name,性别:s.gender,类型:s.type,学习标签:s.tags.learning.join('、'),性格标签:s.tags.personality.join('、'),行为习惯标签:s.tags.behavior.join('、'),'特长/建议标签':[...s.tags.specialty,...s.tags.improvement,...s.tags.suggestion].join('、'),盼你:s.motto||'',评语:s.comment,状态:s.status,是否锁定:s.locked?'是':'否',备注:s.note}));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'期末评语'); XLSX.writeFile(wb,`期末评语_${date()}.xlsx`);
}
export function downloadTemplate() {
  const ws=XLSX.utils.aoa_to_sheet([['姓名','性别','类型','备注','标签'],['张三','男','优秀生','示例备注','学习认真、乐于助人']]); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'学生名单'); XLSX.writeFile(wb,'学生名单导入模板.xlsx');
}
export async function importStudents(file: File, existingCount: number) {
  const wb=XLSX.read(await file.arrayBuffer()); const rows=XLSX.utils.sheet_to_json<Record<string,unknown>>(wb.Sheets[wb.SheetNames[0]],{defval:''});
  return rows.map((r,i)=>createStudent(String(r['姓名']||r['名字']||r['name']||'').trim(),existingCount+i,{gender:(['男','女'].includes(String(r['性别']))?String(r['性别']):'未知') as Student['gender'],type:(['优秀生','中等生','后进生'].includes(String(r['类型']))?String(r['类型']):'未分类') as Student['type'],note:String(r['备注']||'')})).filter(s=>s.name);
}
export async function exportWord(students: Student[]) {
  const children=[new Paragraph({text:'期末评语',heading:HeadingLevel.TITLE}),...students.filter(s=>s.comment).flatMap((s,i)=>[new Paragraph({children:[new TextRun({text:`${i+1}. ${s.name}`,bold:true,size:28})],spacing:{before:240,after:100}}),...(s.motto?[new Paragraph({children:[new TextRun({text:`盼你：${s.motto}`,bold:true,color:'C62828'})],spacing:{after:100}})]:[]),new Paragraph({text:s.comment,spacing:{after:180},indent:{firstLine:420}})])];
  download(await Packer.toBlob(new Document({sections:[{children}]})),`期末评语_${date()}.docx`);
}
export function exportProject(data: unknown) { download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),`班主任评语项目_${date()}.json`); }
export async function readProject(file: File) { return JSON.parse(await file.text()); }
