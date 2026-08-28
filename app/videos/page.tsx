import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import { VideoCard } from "@/widgets/videos-swiper";

import { fetchInterviews } from "@/entities/interview";

import { ROUTES } from "@/shared/config";

// Тот же интервал, что у блока «Блог» на главной — тоже публичный контент с
// бэка, без ISR страница застыла бы на состоянии сборки.
export const revalidate = 300;

export default async function VideosPage() {
  const interviews = await fetchInterviews(24);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header title="Интервью" backTo={ROUTES.HOME} />

      <div className="flex-1 w-full max-w-360 mx-auto px-4 md:px-10 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Интервью с врачами
          </h1>
          <p className="text-secondary text-base md:text-lg">
            Наши специалисты делятся знаниями, советами и отвечают на частые
            вопросы
          </p>
        </div>

        {interviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {interviews.map((interview, index) => (
              <VideoCard
                key={interview.id}
                title={interview.title}
                authorName={interview.authorName}
                authorRole={interview.authorRole}
                thumbnail={interview.thumbnail}
                youtubeUrl={interview.youtubeUrl}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted py-16 text-center">
            Пока нет ни одного интервью
          </p>
        )}
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
