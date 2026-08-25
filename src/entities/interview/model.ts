import { type PublicInterview, getInterviews } from "@/shared/api";

export type Interview = {
  id: string;
  title: string;
  authorName: string;
  authorRole: string;
  // У врача может не быть фото — тогда карточка идёт без обложки.
  thumbnail?: string;
  youtubeUrl: string;
  doctorId: string;
};

const adaptInterview = (api: PublicInterview): Interview => ({
  id: String(api.id),
  title: api.title,
  authorName: api.doctor_name,
  authorRole: api.doctor_specialty,
  thumbnail: api.doctor_photo || undefined,
  youtubeUrl: api.video_url,
  doctorId: String(api.doctor_id),
});

// Интервью — публичный контент: при сбое запроса показываем пустой раздел, а
// не роняем страницу (та же логика, что у fetchBlogPosts).
export const fetchInterviews = async (limit = 12): Promise<Interview[]> => {
  try {
    const { data } = await getInterviews({ page_size: limit });
    return [...data]
      .sort((a, b) => b.priority - a.priority)
      .map(adaptInterview);
  } catch {
    return [];
  }
};

// Интервью конкретного врача: бэк не даёт фильтр по врачу в /api/interviews/,
// поэтому тянем список большим page_size и фильтруем на клиенте — limit здесь
// ограничивает только итоговую выдачу, а не то, сколько записей запрашивать.
export const fetchDoctorInterviews = async (
  doctorId: string,
  limit = 12,
): Promise<Interview[]> => {
  const all = await fetchInterviews(100);
  return all
    .filter((interview) => interview.doctorId === doctorId)
    .slice(0, limit);
};
