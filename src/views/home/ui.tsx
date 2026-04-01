import { FilterBar } from "@/features";
import { Header, Hero } from "@/widgets";

export const HomePage = () => {
  return (
    <main>
      <Header searchable />
      <FilterBar />
      <Hero />
    </main>
  );
};
