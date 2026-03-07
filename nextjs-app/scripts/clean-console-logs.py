#!/usr/bin/env python3
"""
Sprint 0.1: Remove debug console.log from production code.
Keeps console.error in catch blocks (legitimate error handling).
Keeps console.warn for important warnings in API routes.
Only removes console.log() calls that are clearly debug statements.
"""
import os
import re

ROOT = "/Users/rodrigoamorim/Downloads/inclusao-ominsfera-supabse 3/inclusao-github/nextjs-app"

# Files to clean (app/ and components/ only — not lib/ which has legitimate logging)
DIRS_TO_CLEAN = [
    os.path.join(ROOT, "app"),
    os.path.join(ROOT, "components"),
]

# Skip patterns
SKIP_PATTERNS = [
    "node_modules",
    "__tests__",
    "e2e/",
    ".next/",
]

# Only clean .ts and .tsx files
EXTENSIONS = (".ts", ".tsx")

# Pattern: lines that start with optional whitespace + console.log(
# This captures single-line console.log statements
CONSOLE_LOG_PATTERN = re.compile(r'^(\s*)console\.log\(.*\);?\s*$')
# Also catch the // [cleaned] lines from previous attempt 
CLEANED_PATTERN = re.compile(r'^.*//.*\[cleaned\].*console\.log.*$')

stats = {"files": 0, "lines_removed": 0}

def should_skip(filepath):
    for sp in SKIP_PATTERNS:
        if sp in filepath:
            return True
    return False

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    removed = 0
    
    for line in lines:
        stripped = line.strip()
        # Remove console.log lines
        if CONSOLE_LOG_PATTERN.match(stripped):
            removed += 1
            continue
        # Remove [cleaned] leftovers
        if CLEANED_PATTERN.match(line):
            removed += 1
            continue
        new_lines.append(line)
    
    if removed > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        stats["files"] += 1
        stats["lines_removed"] += removed
        print(f"  ✅ {os.path.relpath(filepath, ROOT)}: -{removed} lines")

for dir_path in DIRS_TO_CLEAN:
    for root, dirs, files in os.walk(dir_path):
        for fname in files:
            if not fname.endswith(EXTENSIONS):
                continue
            fpath = os.path.join(root, fname)
            if should_skip(fpath):
                continue
            clean_file(fpath)

print(f"\n📊 Total: {stats['files']} files cleaned, {stats['lines_removed']} console.log lines removed")
