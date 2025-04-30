import { initializeDatabase } from "./schema"

// This function can be called from a script or during app startup
export async function initializeApp() {
  try {
    await initializeDatabase()
    console.log("Application initialized successfully")
  } catch (error) {
    console.error("Failed to initialize application:", error)
  }
}

// If this file is executed directly
if (require.main === module) {
  initializeApp()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Initialization error:", error)
      process.exit(1)
    })
}
