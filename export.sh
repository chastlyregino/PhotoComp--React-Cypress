#!/bin/bash

# Configuration
# Directories to scan
SCAN_PATHS=("src" "cypress", "tests" "docs")
OUTPUT_FILE="codebase-export.txt"

# File extensions to include (no dot prefix in find command)
FILE_EXTENSIONS=("ts" "tsx" "js" "jsx" "json" "md" "yaml" "yml")

# Specific files to include from root directory - ONLY these will be taken from root
ROOT_FILES=("tsconfig.json" "README.md" "package.json" "dynamodb-cloudformation.yaml" "jest.config.js" cypress.config.ts jest.config.ts jest.setup.ts eslint.config.js index.html vite.config.ts tsconfig.app.json tsconfig.jest.json tsconfig.node.json)

# Directories to exclude
EXCLUDE_DIRS=("node_modules" "dist" "build" "coverage" ".git")

# Specific files to exclude (add any unwanted files here)
EXCLUDE_FILES=("package-lock.json" ".gitignore" ".prettierrc" ".eslintrc")

# Clear previous output file if it exists
> "$OUTPUT_FILE"

# Process specific root files first
for file in "${ROOT_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing root file: $file"
    
    # Append filename to output file
    echo "./$file:" >> "$OUTPUT_FILE"
    echo "{" >> "$OUTPUT_FILE"
    
    # Append file contents
    cat "$file" >> "$OUTPUT_FILE"
    
    # Close the file content section
    echo "}" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  else
    echo "Warning: Root file not found: $file"
  fi
done

# Counter for processed files
count=${#ROOT_FILES[@]}
skipped=0

# Process each path
for path in "${SCAN_PATHS[@]}"; do
  echo "Scanning directory: $path"
  
  # Build the find command with file extensions and exclusions
  FIND_CMD="find $path"
  
  # Add directory exclusions
  for dir in "${EXCLUDE_DIRS[@]}"; do
    FIND_CMD="$FIND_CMD -not -path '*/$dir/*'"
  done
  
  # Add file extensions
  EXT_PATTERN=""
  for ext in "${FILE_EXTENSIONS[@]}"; do
    if [ -z "$EXT_PATTERN" ]; then
      EXT_PATTERN="-name \"*.$ext\""
    else
      EXT_PATTERN="$EXT_PATTERN -o -name \"*.$ext\""
    fi
  done
  
  FIND_CMD="$FIND_CMD \( $EXT_PATTERN \) -type f"
  
  # Execute the find command to get all matching files
  files=$(eval "$FIND_CMD")
  
  # Process each file
  for file in $files; do
    # Check if this file should be excluded
    exclude=false
    for exclude_file in "${EXCLUDE_FILES[@]}"; do
      if [[ "$file" == *"$exclude_file"* ]]; then
        exclude=true
        ((skipped++))
        echo "Skipping excluded file: $file"
        break
      fi
    done
    
    # Skip processing if file is in exclusion list
    if [ "$exclude" = true ]; then
      continue
    fi
    
    echo "Processing: $file"
    
    # Append filename to output file
    echo "$file:" >> "$OUTPUT_FILE"
    echo "{" >> "$OUTPUT_FILE"
    
    # Append file contents
    cat "$file" >> "$OUTPUT_FILE"
    
    # Close the file content section
    echo "}" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    ((count++))
  done
done

echo "Export complete!"
echo "Files processed: $count"
echo "Files skipped: $skipped"
echo "Output file: $OUTPUT_FILE"