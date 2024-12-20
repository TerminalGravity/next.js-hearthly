import { Recipe } from "@prisma/client";
import { Card } from "@tremor/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RecipeCardProps {
  recipe: Recipe & {
    affiliateLinks?: {
      affiliateUrl: string;
    }[];
  };
  showAddToEvent?: boolean;
}

export function RecipeCard({ recipe, showAddToEvent }: RecipeCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{recipe.name}</h3>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {recipe.description}
        </p>

        <div className="space-y-2">
          {recipe.link && (
            <Link
              href={recipe.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View Recipe
            </Link>
          )}

          {recipe.affiliateLinks?.[0] && (
            <Link
              href={recipe.affiliateLinks[0].affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Shop Ingredients
            </Link>
          )}
        </div>
      </div>

      {showAddToEvent && (
        <div className="border-t p-4">
          <Button variant="outline" className="w-full" size="sm">
            Add to Event
          </Button>
        </div>
      )}
    </Card>
  );
} 