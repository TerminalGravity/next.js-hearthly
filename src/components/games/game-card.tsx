import { Game } from "@prisma/client";
import { Card } from "@tremor/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GameCardProps {
  game: Game & {
    affiliateLinks?: {
      affiliateUrl: string;
    }[];
  };
  showAddToEvent?: boolean;
}

export function GameCard({ game, showAddToEvent }: GameCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{game.name}</h3>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {game.category}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {game.description}
        </p>

        <div className="space-y-2">
          {game.link && (
            <Link
              href={game.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Learn More
            </Link>
          )}

          {game.affiliateLinks?.[0] && (
            <Link
              href={game.affiliateLinks[0].affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Buy Game
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