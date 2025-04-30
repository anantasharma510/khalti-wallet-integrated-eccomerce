import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function uploadImage(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a unique filename
    const filename = `${uuidv4()}-${file.name.replace(/\s/g, "-")}`
    const path = join(process.cwd(), "public", "uploads", filename)

    // Save the file
    await writeFile(path, buffer)

    // Return the URL
    return `/uploads/${filename}`
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}
