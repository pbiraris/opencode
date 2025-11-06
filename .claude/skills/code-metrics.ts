/**
 * Code Metrics Skill
 *
 * Calculates code metrics like lines of code, complexity,
 * and file statistics for the project.
 */

import fs from "fs/promises"
import path from "path"

interface CodeMetrics {
  totalFiles: number
  totalLines: number
  codeLines: number
  commentLines: number
  blankLines: number
  fileTypes: Record<string, number>
  largestFiles: Array<{ file: string; lines: number }>
}

async function codeMetrics(
  args: { directory?: string; extensions?: string[] },
  context: { sessionID: string; agent: string }
): Promise<string> {
  const projectDir = args.directory || process.cwd()
  const extensions = args.extensions || [".ts", ".js", ".tsx", ".jsx", ".py", ".java", ".go"]

  const metrics: CodeMetrics = {
    totalFiles: 0,
    totalLines: 0,
    codeLines: 0,
    commentLines: 0,
    blankLines: 0,
    fileTypes: {},
    largestFiles: [],
  }

  try {
    await analyzeDirectory(projectDir, metrics, extensions)

    // Generate report
    let report = "# Code Metrics Report\n\n"
    report += `## Overview\n\n`
    report += `- **Total Files**: ${metrics.totalFiles}\n`
    report += `- **Total Lines**: ${metrics.totalLines.toLocaleString()}\n`
    report += `- **Code Lines**: ${metrics.codeLines.toLocaleString()}\n`
    report += `- **Comment Lines**: ${metrics.commentLines.toLocaleString()}\n`
    report += `- **Blank Lines**: ${metrics.blankLines.toLocaleString()}\n\n`

    report += `## File Types\n\n`
    for (const [ext, count] of Object.entries(metrics.fileTypes).sort((a, b) => b[1] - a[1])) {
      report += `- ${ext}: ${count} files\n`
    }

    report += `\n## Largest Files (Top 10)\n\n`
    metrics.largestFiles
      .sort((a, b) => b.lines - a.lines)
      .slice(0, 10)
      .forEach(({ file, lines }) => {
        report += `- ${file}: ${lines} lines\n`
      })

    report += `\n## Code Quality Indicators\n\n`
    const commentRatio = ((metrics.commentLines / metrics.codeLines) * 100).toFixed(1)
    report += `- **Comment Ratio**: ${commentRatio}% (target: 10-20%)\n`
    report += `- **Average File Size**: ${Math.round(metrics.totalLines / metrics.totalFiles)} lines\n`

    return report
  } catch (error) {
    return `Error calculating metrics: ${error instanceof Error ? error.message : String(error)}`
  }
}

async function analyzeDirectory(
  dir: string,
  metrics: CodeMetrics,
  extensions: string[]
): Promise<void> {
  // Skip common directories that shouldn't be analyzed
  const skipDirs = ["node_modules", ".git", "dist", "build", "coverage", ".next", "out"]

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        if (!skipDirs.includes(entry.name)) {
          await analyzeDirectory(fullPath, metrics, extensions)
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (extensions.includes(ext)) {
          await analyzeFile(fullPath, ext, metrics)
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
}

async function analyzeFile(filePath: string, ext: string, metrics: CodeMetrics): Promise<void> {
  try {
    const content = await fs.readFile(filePath, "utf-8")
    const lines = content.split("\n")

    metrics.totalFiles++
    metrics.totalLines += lines.length
    metrics.fileTypes[ext] = (metrics.fileTypes[ext] || 0) + 1

    let codeLines = 0
    let commentLines = 0
    let blankLines = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed === "") {
        blankLines++
      } else if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("#") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*")
      ) {
        commentLines++
      } else {
        codeLines++
      }
    }

    metrics.codeLines += codeLines
    metrics.commentLines += commentLines
    metrics.blankLines += blankLines

    metrics.largestFiles.push({
      file: filePath,
      lines: lines.length,
    })
  } catch (error) {
    // Skip files we can't read
  }
}

// Skill metadata
codeMetrics.description = "Calculate code metrics and statistics for the project"

export default codeMetrics
