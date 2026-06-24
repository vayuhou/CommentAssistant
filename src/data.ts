import type { Student, TagKey } from './types';

export const TAG_CATEGORIES: Record<TagKey, { title: string; tags: string[] }> = {
  learning: { title: '学习表现', tags: ['学习之星', '勤奋努力', '思维活跃', '热爱阅读', '书写工整', '计算能手', '战胜粗心', '基础薄弱', '作业拖拉', '字迹潦草'] },
  personality: { title: '性格品质', tags: ['乐于助人', '懂礼貌', '人缘极好', '阳光开朗', '诚实守信', '温柔细腻', '爱告状', '脾气急躁', '有些娇气', '胆小害羞'] },
  behavior: { title: '行为习惯', tags: ['守纪模范', '责任感强', '讲究卫生', '惜时如金', '午休捣乱', '挑食浪费', '上课说话', '上课走神', '坐不住', '丢三落四'] },
  specialty: { title: '特长/建议', tags: ['运动健将', '才艺小星', '劳动光荣', '小主持人', '科技达人', '坚持练字', '少看手机', '阅读打卡', '多做家务', '注意安全'] },
  improvement: { title: '需要改进', tags: ['战胜粗心', '基础薄弱', '作业拖拉', '字迹潦草', '上课说话', '上课走神', '坐不住', '丢三落四'] },
  suggestion: { title: '老师建议', tags: ['坚持练字', '少看手机', '阅读打卡', '多做家务', '注意安全'] },
};

export const STATUS_LABELS = {
  empty: '未生成', base_generated: '已生成', ai_polished: 'AI润色', ai_rewritten: 'AI重写', edited: '手动编辑', locked: '已锁定', failed: '处理失败',
} as const;

const now = () => new Date().toISOString();

export function createStudent(name: string, index: number, partial: Partial<Student> = {}): Student {
  const created = now();
  return {
    id: crypto.randomUUID(), no: String(index + 1).padStart(2, '0'), name, gender: '未知', type: '未分类', note: '',
    tags: { learning: [], personality: [], behavior: [], specialty: [], improvement: [], suggestion: [] },
    comment: '', status: 'empty', locked: false, history: [], createdAt: created, updatedAt: created, ...partial,
  };
}

export function initialStudents(): Student[] {
  const names = ['张子轩', '李雨桐', '王强', '赵芳', '陈大文'];
  return names.map((name, i) => createStudent(name, i, {
    type: (['优秀生', '中等生', '后进生', '优秀生', '中等生'] as const)[i],
    gender: i % 2 ? '女' : '男',
    tags: {
      learning: i % 2 ? ['勤奋努力', '热爱阅读'] : ['思维活跃', '书写工整'],
      personality: i % 2 ? ['乐于助人'] : ['诚实守信', '阳光开朗'],
      behavior: ['守纪模范'], specialty: i === 0 ? ['才艺小星'] : [], improvement: [], suggestion: ['阅读打卡'],
    },
  }));
}
