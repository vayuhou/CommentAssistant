export type StudentStatus = 'empty' | 'base_generated' | 'ai_polished' | 'ai_rewritten' | 'edited' | 'locked' | 'failed';
export type StudentType = '优秀生' | '中等生' | '后进生' | '未分类';
export type TagKey = 'learning' | 'personality' | 'behavior' | 'specialty' | 'improvement' | 'suggestion';

export type CommentHistory = {
  id: string;
  type: 'base' | 'ai_polish' | 'ai_rewrite' | 'manual';
  content: string;
  createdAt: string;
};

export type Student = {
  id: string;
  no: string;
  name: string;
  gender: '男' | '女' | '未知';
  type: StudentType;
  note: string;
  tags: Record<TagKey, string[]>;
  comment: string;
  motto?: string;
  baseComment?: string;
  aiComment?: string;
  status: StudentStatus;
  locked: boolean;
  history: CommentHistory[];
  createdAt: string;
  updatedAt: string;
};

export type ActivationState = {
  code: string;
  active: boolean;
  expired: boolean;
  expiresAt: string;
  totalAiQuota: number;
  usedAiCount: number;
  remainingAiCount: number;
  deviceId: string;
};

export type PdfElement = {
  id: string;
  type: 'variable' | 'text';
  field?: 'studentName' | 'motto' | 'comment';
  name: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  underline: boolean;
  align: 'left' | 'center' | 'right';
  lineHeight: number;
  color: string;
};

export type PdfLayoutConfig = {
  preset: string;
  rows: number;
  cols: number;
  marginTop: number;
  marginLeft: number;
  gapX: number;
  gapY: number;
  showBackground: boolean;
  backgroundUrl?: string;
  zoom: number;
};
