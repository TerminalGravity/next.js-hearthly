import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { Suspense } from "react";

interface RecipesPageProps {
  searchParams: {
    search?: string;
    tag?: string;
  };
}

export default async function RecipesPage({
  searchParams,
}: RecipesPageProps) {
  const { search, tag } = searchParams;

  const recipes = await prisma.recipe.findMany({
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
        tag ? { tags: { has: tag } } : {},
      ],
    },
    include: {
      affiliateLinks: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get unique tags from all recipes
  const allTags = await prisma.recipe.findMany({
    select: {
      tags: true,
    },
  });

  const uniqueTags = Array.from(
    new Set(allTags.flatMap((recipe) => recipe.tags))
  ).sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Recipes</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and discover recipes for your next family gathering
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            type="search"
            placeholder="Search recipes..."
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
            {uniqueTags.map((t) => (
              <button
                key={t}
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  if (tag === t) {
                    params.delete("tag");
                  } else {
                    params.set("tag", t);
                  }
                  window.location.search = params.toString();
                }}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  tag === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-muted-foreground">
              Loading recipes...
            </div>
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showAddToEvent
              />
            ))}
            {recipes.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground">
                No recipes found
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
} 