import { initializeDatabase } from "@/lib/init-db"
async function main() {
  console.log("Initializing database...")
  await initializeDatabase()
  console.log("Database initialization complete!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Initialization error:", error)
    process.exit(1)
  })
