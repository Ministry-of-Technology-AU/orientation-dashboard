/**
 * Seeds the `modules` and `games` tables from the mock data (the single source of
 * truth in src/mock-data/modules.ts) plus the markdown bodies in public/modules/.
 *
 * Each Module has many Game rows; the type-specific payload (quiz questions,
 * connections groups, wordle word/hint/attempts) lives in Game.config (JSON).
 *
 * Idempotent: modules are upserted by id and a module's games are fully resynced
 * (deleted + recreated) on every run, so it's safe to run repeatedly.
 *
 * Run with:  npm run db:seed
 */
import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { mockModules } from "../src/mock-data/modules";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function readContent(slug: string): Promise<string> {
  try {
    return await fs.readFile(
      path.join(process.cwd(), "public", "modules", `${slug}.md`),
      "utf-8"
    );
  } catch {
    return "";
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — add it to .env before seeding.");
  }

  for (const m of mockModules) {
    const content = await readContent(m.slug);

    await prisma.module.upsert({
      where: { id: m.id },
      create: {
        id: m.id,
        slug: m.slug,
        title: m.title,
        icon: m.iconName,
        description: m.description,
        isMandatory: m.isMandatory,
        orderIndex: m.orderIndex,
        journeyMilestone: m.journeyMilestone,
        content: content || m.description,
      },
      update: {
        slug: m.slug,
        title: m.title,
        icon: m.iconName,
        description: m.description,
        isMandatory: m.isMandatory,
        orderIndex: m.orderIndex,
        journeyMilestone: m.journeyMilestone,
        content: content || m.description,
      },
    });

    // Full resync of this module's games so removed/renamed games don't linger.
    await prisma.game.deleteMany({ where: { moduleId: m.id } });
    if (m.games.length > 0) {
      await prisma.game.createMany({
        data: m.games.map((g, i) => ({
          id: g.id,
          moduleId: m.id,
          type: g.type,
          title: g.title,
          difficulty: g.difficulty,
          pointsValue: g.pointsValue,
          estimatedMins: g.estimatedMins,
          orderIndex: i,
          config: g.config as unknown as Prisma.InputJsonValue,
        })),
      });
    }

    const types = m.games.map((g) => g.type).join(", ") || "none";
    console.log(
      `✓ ${m.title}  (id=${m.id}, slug=${m.slug})  games: ${types}  content:${content ? `${content.length}b` : "—"}`
    );
  }

  const [moduleCount, gameCount] = await Promise.all([
    prisma.module.count(),
    prisma.game.count(),
  ]);
  console.log(`\nDone. Modules: ${moduleCount}, Games: ${gameCount}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
