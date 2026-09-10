import type { ExamMonth } from '@utils/types';

export const EXAM_MONTHS: ExamMonth[] = ['JANUARY', 'MAY', 'AUGUST', 'NOVEMBER'];

export const getExamYears = (count: number = 10): number[] =>
  Array.from({ length: count }, (_, i) => new Date().getFullYear() - i);

export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
