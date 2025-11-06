---
description: Calculate code metrics and statistics for the project
---

Calculate comprehensive code metrics and statistics for the project.

## Metrics to Calculate

1. **Lines of Code (LOC)**
   - Total lines
   - Code lines (excluding comments and blanks)
   - Comment lines
   - Blank lines
   - Calculate per file and aggregate

2. **File Statistics**
   - Total number of files by extension
   - Largest files (top 10)
   - Average file size
   - File distribution by directory

3. **Complexity Metrics**
   - Identify large functions (>50 lines)
   - Identify deep nesting (>4 levels)
   - Calculate cyclomatic complexity if possible
   - Flag potential code smells

4. **Code Quality Indicators**
   - Comment-to-code ratio (target: 10-20%)
   - Average function length
   - File size distribution
   - Duplication indicators

5. **Language Distribution**
   - Percentage by language/file type
   - Primary vs secondary languages

## Analysis Approach

Use available tools:
- `find` for file discovery
- `wc -l` for line counts
- `grep` for pattern matching
- File reading for detailed analysis

## Output Format

```markdown
# Code Metrics Report

## Overview
- Total Files: X
- Total Lines: Y
- Code Lines: Z
- Comment Lines: W

## File Type Distribution
- TypeScript: X files (Y%)
- JavaScript: X files (Y%)
- [etc.]

## Largest Files
1. path/to/file.ts: 1,234 lines
2. [etc.]

## Quality Indicators
- Comment Ratio: X%
- Average File Size: Y lines
- Files >300 lines: Z

## Code Hotspots
[Files/areas that may need attention]

## Recommendations
[Suggestions for improvement]
```

Provide insights and recommendations based on the metrics.
