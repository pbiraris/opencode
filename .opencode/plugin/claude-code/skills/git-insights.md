---
description: Analyze git repository history for insights and patterns
---

Analyze the git repository to identify patterns, hotspots, and insights about the codebase evolution.

## Analysis Areas

1. **Commit History**
   - Total number of commits
   - Commit frequency over time
   - Recent activity (last 30/60/90 days)
   - Commit message patterns

2. **Contributors**
   - Top contributors by commit count
   - Recent active contributors
   - Contribution distribution
   - Author activity patterns

3. **Code Hotspots**
   - Most frequently changed files
   - Files with highest churn rate
   - Recently volatile areas
   - Potential technical debt indicators

4. **Change Patterns**
   - Typical change size
   - Files that change together
   - Refactoring vs feature work
   - Bug fix patterns

5. **Repository Health**
   - Branch activity
   - Merge patterns
   - Long-lived branches
   - Stale code areas

## Git Commands to Use

```bash
# Commit count
git rev-list --count HEAD

# Top contributors
git shortlog -sn --all --no-merges

# Recent activity
git log --oneline --since="30 days ago"

# File change frequency
git log --format=format: --name-only --since="30 days ago" | grep -v "^$" | sort | uniq -c | sort -rn

# Code churn
git log --all --numstat --pretty="%H" --since="30 days ago"
```

## Output Format

```markdown
# Git Repository Insights

## Repository Statistics
- Total Commits: X
- Active Contributors: Y
- Analysis Period: [timeframe]

## Top Contributors
1. [Name]: X commits
2. [Name]: Y commits
[...]

## Recent Activity (Last 30 Days)
- Commits: X
- Files Changed: Y
- Lines Added: +Z
- Lines Removed: -W

## Code Hotspots
Files changed most frequently:
1. path/to/file.ts: X changes
2. [...]

## Insights
- [Pattern 1]: [Description]
- [Pattern 2]: [Description]

## Recommendations
- [Recommendation based on patterns]
- Consider refactoring hotspots
- Review frequently changing files
```

Provide actionable insights based on the repository history.
