import * as XLSX from 'xlsx';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import type { Student, TagKey } from './types';
import { createStudent, TAG_CATEGORIES } from './data';

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
const date = () => new Date().toISOString().slice(0,10);

export function exportExcel(students: Student[]) {
  const rows = students.map(s=>({序号:s.no,姓名:s.name,性别:s.gender,类型:s.type,学习标签:s.tags.learning.join('、'),性格标签:s.tags.personality.join('、'),行为习惯标签:s.tags.behavior.join('、'),'特长/建议标签':[...s.tags.specialty,...s.tags.improvement,...s.tags.suggestion].join('、'),盼你:s.motto||'',评语:s.comment,状态:s.status,是否锁定:s.locked?'是':'否',备注:s.note}));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'期末评语'); XLSX.writeFile(wb,`期末评语_${date()}.xlsx`);
}
export function downloadTemplate() {
  const ws=XLSX.utils.aoa_to_sheet([['姓名','性别','类型','学习表现','性格品质','行为习惯','特长/建议','备注','标签'],['张三','男','优秀生','学习之星、勤奋努力','乐于助人、阳光开朗','守纪模范、责任感强','阅读打卡、坚持练字','示例备注','也可把全部标签写在这一列']]); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'学生名单'); XLSX.writeFile(wb,'学生名单导入模板.xlsx');
}

const TAG_SPLIT_RE = /[、,，;；\n\r\t]+/;
const tagKeys: TagKey[] = ['learning','personality','behavior','specialty','improvement','suggestion'];
const tagToKey = new Map<string, TagKey>();
for (const key of tagKeys) {
  for (const tag of TAG_CATEGORIES[key].tags) {
    if (!tagToKey.has(tag)) tagToKey.set(tag, key);
  }
}

function cell(row: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const value = row[name];
    if (value !== undefined && String(value).trim()) return String(value).trim();
  }
  return '';
}

function splitTags(value: unknown) {
  return String(value || '').split(TAG_SPLIT_RE).map(t=>t.trim()).filter(Boolean);
}

function addTags(target: Student['tags'], key: TagKey, tags: string[]) {
  const bucket = target[key];
  for (const tag of tags) {
    if (tag && !bucket.includes(tag)) bucket.push(tag);
  }
}

function parseTags(row: Record<string, unknown>) {
  const tags: Student['tags'] = { learning: [], personality: [], behavior: [], specialty: [], improvement: [], suggestion: [] };
  addTags(tags, 'learning', splitTags(cell(row, ['学习表现','学习标签','学习'])));
  addTags(tags, 'personality', splitTags(cell(row, ['性格品质','性格标签','性格','学生特点'])));
  addTags(tags, 'behavior', splitTags(cell(row, ['行为习惯','行为标签','行为'])));
  addTags(tags, 'specialty', splitTags(cell(row, ['特长/建议','特长建议','特长标签','建议标签','特长','建议'])));

  for (const tag of splitTags(cell(row, ['标签','全部标签','综合标签']))) {
    const key = tagToKey.get(tag) || 'specialty';
    addTags(tags, key, [tag]);
  }
  return tags;
}

export async function importStudents(file: File, existingCount: number) {
  const wb=XLSX.read(await file.arrayBuffer()); const rows=XLSX.utils.sheet_to_json<Record<string,unknown>>(wb.Sheets[wb.SheetNames[0]],{defval:''});
  return rows.map((r,i)=>createStudent(cell(r,['姓名','名字','name']),existingCount+i,{gender:(['男','女'].includes(cell(r,['性别','gender']))?cell(r,['性别','gender']):'未知') as Student['gender'],type:(['优秀生','中等生','后进生'].includes(cell(r,['类型','类别','type']))?cell(r,['类型','类别','type']):'未分类') as Student['type'],note:cell(r,['备注','说明','note']),tags:parseTags(r)})).filter(s=>s.name);
}
export async function exportWord(students: Student[]) {
  const children=[new Paragraph({text:'期末评语',heading:HeadingLevel.TITLE}),...students.filter(s=>s.comment).flatMap((s,i)=>[new Paragraph({children:[new TextRun({text:`${i+1}. ${s.name}`,bold:true,size:28})],spacing:{before:240,after:100}}),...(s.motto?[new Paragraph({children:[new TextRun({text:`盼你：${s.motto}`,bold:true,color:'C62828'})],spacing:{after:100}})]:[]),new Paragraph({text:s.comment,spacing:{after:180},indent:{firstLine:420}})])];
  download(await Packer.toBlob(new Document({sections:[{children}]})),`期末评语_${date()}.docx`);
}
export function exportProject(data: unknown) { download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),`班主任评语项目_${date()}.json`); }
export async function readProject(file: File) { return JSON.parse(await file.text()); }
