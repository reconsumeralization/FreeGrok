import { createTypeAlias } from "drizzle-zod"
import fs from "fs"
import path from "path"
import * as schema from "../db/schema"

// This script generates TypeScript types from Drizzle schema
async function main() {
  console.log("Generating TypeScript types from Drizzle schema...")

  try {
    // Create types directory if it doesn't exist
    const typesDir = path.join(__dirname, "../types")
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir)
    }

    // Generate types for each table
    const tables = Object.entries(schema)
      .filter(([_, value]) => typeof value === "object" && "name" in value)
      .map(([key, value]) => ({ key, value }))

    for (const { key, value } of tables) {
      if ("name" in value) {
        const zodSchema = createTypeAlias(value)
        const typeName = key.charAt(0).toUpperCase() + key.slice(1, -1) // Convert to singular and capitalize

        const typeContent = `
import { z } from "zod";

export const ${key}Schema = ${zodSchema};

export type ${typeName} = z.infer<typeof ${key}Schema>;
`

        fs.writeFileSync(path.join(typesDir, `${key}.ts`), typeContent)
        console.log(`Generated type for ${key}`)
      }
    }

    // Generate index file
    const indexContent = tables
      .map(({ key }) => {
        const typeName = key.charAt(0).toUpperCase() + key.slice(1, -1)
        return `export type { ${typeName} } from "./${key}";`
      })
      .join("\n")

    fs.writeFileSync(path.join(typesDir, "index.ts"), indexContent)

    console.log("Type generation completed successfully!")
  } catch (error) {
    console.error("Type generation failed:", error)
  }
}

main()

