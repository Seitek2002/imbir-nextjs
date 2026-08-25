// GET /api/interviews/ — публичный список видео-интервью врачей. Обложка
// карточки — это фото врача (доступно только на чтение), отдельного поля под
// обложку интервью на бэке нет.
export type PublicInterview = {
  id: number;
  title: string;
  video_url: string;
  priority: 0 | 1 | 2 | 3;
  doctor_id: number;
  doctor_name: string;
  doctor_specialty: string;
  doctor_photo: string;
};
