// GET /api/interviews/ — публичный список видео-интервью врачей. Обложка
// карточки — это фото врача (доступно только на чтение), отдельного поля под
// обложку интервью на бэке нет.
export type PublicInterview = {
  doctor_id: number;
  doctor_name: string;
  doctor_photo: string;
  doctor_specialty: string;
  id: number;
  priority: 0 | 1 | 2 | 3;
  title: string;
  video_url: string;
};
