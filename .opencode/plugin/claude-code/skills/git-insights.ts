/**
 * Git Insights Skill
 *
 * Analyzes git repository history for insights about
 * code changes, contributors, and hotspots.
 */

import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

interface GitInsights {
  totalCommits: number
  contributors: Record<string, number>
  recentActivity: string[]
  hotspots: string[]
}

async function gitInsights(
  args: { directory?: string; days?: number },
  context: { sessionID: string; agent: string }
): Promise<string> {
  const projectDir = args.directory || process.cwd()
  const days = args.days || 30

  try {
    // Get commit count
    const { stdout: commitCount } = await execAsync("git rev-list --count HEAD", {
      cwd: projectDir,
    })

    // Get contributors
    const { stdout: contributorsOutput } = await execAsync(
      'git shortlog -sn --all --no-merges | head -10',
      { cwd: projectDir }
    )

    // Get recent activity
    const { stdout: recentActivity } = await execAsync(
      `git log --oneline --since="${days} days ago" --pretty=format:"%h %s" | head -20`,
      { cwd: projectDir }
    )

    // Get file change frequency (hotspots)
    const { stdout: hotspots } = await execAsync(
      `git log --format=format: --name-only --since="${days} days ago" | grep -v "^$" | sort | uniq -c | sort -rn | head -10`,
      { cwd: projectDir }
    )

    // Generate report
    let report = "# Git Repository Insights\n\n"

    report += `## Repository Statistics\n\n`
    report += `- **Total Commits**: ${commitCount.trim()}\n`
    report += `- **Analysis Period**: Last ${days} days\n\n`

    report += `## Top Contributors\n\n`
    const contributors = contributorsOutput
      .trim()
      .split("\n")
      .filter((line) => line.trim())
    contributors.forEach((contributor) => {
      report += `- ${contributor.trim()}\n`
    })

    report += `\n## Recent Activity (Last 20 Commits)\n\n`
    const activities = recentActivity
      .trim()
      .split("\n")
      .filter((line) => line.trim())
    if (activities.length > 0) {
      activities.forEach((activity) => {
        report += `- ${activity}\n`
      })
    } else {
      report += "_No recent activity in the last ${days} days_\n"
    }

    report += `\n## Code Hotspots (Most Changed Files)\n\n`
    const hotspotList = hotspots
      .trim()
      .split("\n")
      .filter((line) => line.trim())
    if (hotspotList.length > 0) {
      hotspotList.forEach((hotspot) => {
        const match = hotspot.trim().match(/(\d+)\s+(.+)/)
        if (match) {
          report += `- ${match[2]}: ${match[1]} changes\n`
        }
      })
    } else {
      report += "_No changes in the last ${days} days_\n"
    }

    report += `\n## Insights\n\n`
    report += `- Hotspots may indicate areas that need refactoring or better test coverage\n`
    report += `- High change frequency could suggest unstable or rapidly evolving code\n`
    report += `- Review hotspots for potential technical debt\n`

    return report
  } catch (error) {
    return `Error analyzing git repository: ${error instanceof Error ? error.message : String(error)}\n\nMake sure you're in a git repository.`
  }
}

// Skill metadata
gitInsights.description = "Analyze git repository for insights and statistics"

export default gitInsights
