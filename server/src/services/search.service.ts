import { prisma } from '../prisma';

export class SearchService {
  static async globalSearch(query: string, userId?: string) {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { papers: [], subjects: [], departments: [] };
    }

    const [papers, subjects, departments] = await Promise.all([
      prisma.questionPaper.findMany({
        where: {
          OR: [
            { title: { contains: trimmed, mode: 'insensitive' } },
            { subject: { name: { contains: trimmed, mode: 'insensitive' } } },
            { subject: { code: { contains: trimmed, mode: 'insensitive' } } },
          ],
        },
        include: {
          subject: { select: { id: true, code: true, name: true } },
          department: { select: { id: true, name: true } },
          _count: { select: { downloads: true, bookmarks: true } },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subject.findMany({
        where: {
          OR: [
            { name: { contains: trimmed, mode: 'insensitive' } },
            { code: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
        include: {
          department: { select: { id: true, name: true } },
          _count: { select: { papers: true } },
        },
        take: 5,
        orderBy: { name: 'asc' },
      }),
      prisma.department.findMany({
        where: {
          name: { contains: trimmed, mode: 'insensitive' },
        },
        include: {
          _count: { select: { subjects: true, papers: true } },
        },
        take: 5,
        orderBy: { name: 'asc' },
      }),
    ]);

    const papersWithBookmark = userId && papers.length > 0
      ? await (async () => {
          const paperIds = papers.map((p) => p.id);
          const bookmarks = await prisma.bookmark.findMany({
            where: { userId, paperId: { in: paperIds } },
            select: { paperId: true },
          });
          const bookmarkedIds = new Set(bookmarks.map((b) => b.paperId));
          return papers.map((p) => ({ ...p, isBookmarked: bookmarkedIds.has(p.id) }));
        })()
      : papers.map((p) => ({ ...p, isBookmarked: false }));

    return {
      papers: papersWithBookmark,
      subjects,
      departments,
    };
  }
}
