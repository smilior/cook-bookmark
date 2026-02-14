import { db } from "./index";
import { category } from "./schema";

const defaultCategories = [
  "和食",
  "洋食",
  "中華",
  "韓国料理",
  "エスニック",
  "デザート",
  "その他",
];

async function seed() {
  console.log("Seeding categories...");

  for (const name of defaultCategories) {
    const id = crypto.randomUUID();
    await db
      .insert(category)
      .values({
        id,
        name,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
