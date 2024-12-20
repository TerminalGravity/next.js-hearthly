import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/games/game-card";
import { Suspense } from "react";

interface GamesPageProps {
  searchParams: {
    search?: string;
    category?: string;
  };
}

export default async function GamesPage({
  searchParams,
}: GamesPageProps) {
  const { search, category } = searchParams;

  const games = await prisma.game.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        category
          ? { category: { equals: category, mode: "insensitive" } }
          : {},
      ],
    },
    include: {
      affiliateLinks: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get unique categories from all games
  const categories = await prisma.game.findMany({
    select: {
      category: true,
    },
    distinct: ["category"],
    orderBy: {
      category: "asc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Games</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and discover games for your next family gathering
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            type="search"
            placeholder="Search games..."
            className="max-w-sm"
            defaultValue={search}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              if (e.target.value) {
                params.set("search", e.target.value);
              } else {
                params.delete("search");
              }
              window.history.replaceState(null, "", `?${params.toString()}`);
            }}
          />

          <div className="flex flex-wrap gap-2">
            {categories.map(({ category: cat }) => (
              <button
                key={cat}
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  if (category === cat) {
                    params.delete("category");
                  } else {
                    params.set("category", cat);
                  }
                  window.location.search = params.toString();
                }}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-muted-foreground">
              Loading games...
            </div>
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                showAddToEvent
              />
            ))}
            {games.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground">
                No games found
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
} 