import { readdir, stat, rename, mkdir } from 'fs/promises'
import path from 'path'

async function ensureDistDirectory(directory) {
  try {
    await mkdir(directory, { recursive: true })
    console.log(`Created 'dist' directory at: ${directory}`)
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(`Error creating 'dist' directory:`, error)
      throw error
    }
  }
}

async function renameJsToMjs(directory) {
  try {
    const files = await readdir(directory)
    for (const file of files) {
      const filePath = path.join(directory, file)
      const fileStat = await stat(filePath)

      if (fileStat.isDirectory()) {
        await renameJsToMjs(filePath) // Recursively handle directories
      } else if (file.endsWith('.js')) {
        const newFilePath = path.join(directory, file.replace(/\.js$/, '.mjs'))
        await rename(filePath, newFilePath)
        console.log(`Renamed ${file} to ${path.basename(newFilePath)}`)
      }
    }
  } catch (error) {
    console.error('Error renaming files:', error)
  }
}

async function main() {
  try {
    const projectDir = 'C:/Users/Hp/desktop/carefinder' // Specify your project directory here
    const distDir = path.join(projectDir, 'dist')

    console.log('Dist Directory:', distDir)

    await ensureDistDirectory(distDir)
    await renameJsToMjs(distDir)
  } catch (error) {
    console.error('Error in main:', error)
  }
}

await main()
