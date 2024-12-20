import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.affiliateLink.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.game.deleteMany();

  // Create recipes
  const recipes = await Promise.all([
    prisma.recipe.create({
      data: {
        name: "Classic Lasagna",
        tags: ["Italian", "Pasta", "Main Course", "Family Favorite"],
        description: "A hearty Italian dish perfect for large family gatherings. Layers of pasta, meat sauce, and cheese.",
        link: "https://www.example.com/lasagna",
      },
    }).then(async (recipe) => {
      await prisma.affiliateLink.create({
        data: {
          itemType: "recipe",
          itemId: recipe.id,
          affiliateUrl: "https://www.amazon.com/lasagna-ingredients",
        },
      });
      return recipe;
    }),
    prisma.recipe.create({
      data: {
        name: "BBQ Pulled Pork",
        tags: ["BBQ", "Meat", "Main Course", "Slow Cooker"],
        description: "Tender pulled pork in a sweet and tangy BBQ sauce. Perfect for sandwiches and feeding a crowd.",
        link: "https://www.example.com/pulled-pork",
      },
    }).then(async (recipe) => {
      await prisma.affiliateLink.create({
        data: {
          itemType: "recipe",
          itemId: recipe.id,
          affiliateUrl: "https://www.amazon.com/bbq-ingredients",
        },
      });
      return recipe;
    }),
    prisma.recipe.create({
      data: {
        name: "Summer Fruit Salad",
        tags: ["Fruit", "Dessert", "Healthy", "Quick"],
        description: "A refreshing mix of seasonal fruits with a honey-lime dressing.",
        link: "https://www.example.com/fruit-salad",
      },
    }),
  ]);

  // Create games
  const games = await Promise.all([
    prisma.game.create({
      data: {
        name: "Family Trivia",
        category: "Trivia",
        description: "A customizable trivia game where families can create questions about their shared memories and history.",
        link: "https://www.example.com/family-trivia",
      },
    }).then(async (game) => {
      await prisma.affiliateLink.create({
        data: {
          itemType: "game",
          itemId: game.id,
          affiliateUrl: "https://www.amazon.com/trivia-game",
        },
      });
      return game;
    }),
    prisma.game.create({
      data: {
        name: "Pictionary",
        category: "Drawing",
        description: "The classic drawing and guessing game that's fun for all ages.",
        link: "https://www.example.com/pictionary",
      },
    }).then(async (game) => {
      await prisma.affiliateLink.create({
        data: {
          itemType: "game",
          itemId: game.id,
          affiliateUrl: "https://www.amazon.com/pictionary",
        },
      });
      return game;
    }),
    prisma.game.create({
      data: {
        name: "Charades",
        category: "Acting",
        description: "Act out words and phrases while others try to guess. No props needed!",
        link: "https://www.example.com/charades",
      },
    }),
  ]);

  console.log({ recipes, games });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 