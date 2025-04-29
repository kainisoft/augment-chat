#!/bin/bash
# Script to help standardize an existing documentation file

# Check if a file path was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <path_to_document>"
  exit 1
fi

DOC_PATH="$1"

# Check if the file exists
if [ ! -f "$DOC_PATH" ]; then
  echo "Error: File not found: $DOC_PATH"
  exit 1
fi

# Extract the document title (first h1 header)
TITLE=$(grep -m 1 "^# " "$DOC_PATH" | sed 's/^# //')

# Create a temporary file
TEMP_FILE=$(mktemp)

# Add the document title
echo "# $TITLE" > "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Add the Overview section
echo "## Overview" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "[Overview content goes here. Provide a brief introduction explaining the purpose of this document and its scope.]" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Add the Table of Contents section
echo "## Table of Contents" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "- [Overview](#overview)" >> "$TEMP_FILE"

# Extract all h2 headers and add them to the table of contents
grep "^## " "$DOC_PATH" | grep -v "^## Overview" | grep -v "^## Table of Contents" | while read -r header; do
  header_text=$(echo "$header" | sed 's/^## //')
  header_anchor=$(echo "$header_text" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
  echo "- [$header_text](#$header_anchor)" >> "$TEMP_FILE"
done

echo "" >> "$TEMP_FILE"

# Copy the content of the original file, skipping the title
sed '1,1d' "$DOC_PATH" > "$TEMP_FILE.content"

# Check if the file already has a Document Information section
if grep -q "^## Document Information" "$TEMP_FILE.content"; then
  # If it exists, use the content from the original file
  cat "$TEMP_FILE.content" >> "$TEMP_FILE"
else
  # If it doesn't exist, add the Document Information section
  cat "$TEMP_FILE.content" >> "$TEMP_FILE"
  echo "" >> "$TEMP_FILE"
  echo "## Document Information" >> "$TEMP_FILE"
  echo "- **Author**: [Author Name]" >> "$TEMP_FILE"
  echo "- **Created**: $(date +%Y-%m-%d)" >> "$TEMP_FILE"
  echo "- **Last Updated**: $(date +%Y-%m-%d)" >> "$TEMP_FILE"
  echo "- **Version**: 1.0.0" >> "$TEMP_FILE"
fi

# Create a backup of the original file
cp "$DOC_PATH" "${DOC_PATH}.bak"

# Replace the original file with the standardized version
mv "$TEMP_FILE" "$DOC_PATH"

# Clean up
rm -f "$TEMP_FILE.content"

echo "Document standardized: $DOC_PATH"
echo "A backup of the original file was created: ${DOC_PATH}.bak"
echo ""
echo "Next steps:"
echo "1. Review and update the Overview section"
echo "2. Verify the Table of Contents links"
echo "3. Add any missing sections according to the documentation standard"
echo "4. Update the Document Information section with correct details"
