const CATEGORY_COVERS: Record<string, { gradient: string; accent: string }> = {
  'Kỹ năng sống': { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#764ba2' },
  'Tiểu thuyết': { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', accent: '#f5576c' },
  'Khoa học': { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', accent: '#00c9d4' },
  'Tài chính': { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', accent: '#38c2a8' },
  'Lịch sử': { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', accent: '#d4a000' },
  'Văn học': { gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', accent: '#a18cd1' },
};

const DEFAULT_COVER = {
  gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
  accent: '#8b5cf6',
};

export function getCover(category: string) {
  return CATEGORY_COVERS[category] || DEFAULT_COVER;
}
