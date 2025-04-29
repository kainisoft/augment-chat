#!/bin/bash
# Script to create a new documentation file from a template

# Check if required arguments were provided
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <template_type> <output_path> [document_title]"
  echo "Template types: standard, plan"
  exit 1
fi

TEMPLATE_TYPE="$1"
OUTPUT_PATH="$2"
TITLE="${3:-New Document}"

# Set the template path based on the template type
case "$TEMPLATE_TYPE" in
  standard)
    TEMPLATE_PATH="docs/TEMPLATE.md"
    ;;
  plan)
    TEMPLATE_PATH="docs/PLAN_TEMPLATE.md"
    ;;
  *)
    echo "Error: Unknown template type: $TEMPLATE_TYPE"
    echo "Available template types: standard, plan"
    exit 1
    ;;
esac

# Check if the template exists
if [ ! -f "$TEMPLATE_PATH" ]; then
  echo "Error: Template not found: $TEMPLATE_PATH"
  exit 1
fi

# Check if the output file already exists
if [ -f "$OUTPUT_PATH" ]; then
  read -p "File already exists. Overwrite? (y/n): " OVERWRITE
  if [ "$OVERWRITE" != "y" ]; then
    echo "Operation cancelled."
    exit 0
  fi
fi

# Create the output directory if it doesn't exist
OUTPUT_DIR=$(dirname "$OUTPUT_PATH")
mkdir -p "$OUTPUT_DIR"

# Copy the template to the output path
cp "$TEMPLATE_PATH" "$OUTPUT_PATH"

# Replace the document title placeholder with the actual title
sed -i '' "s/\[Document Title\]/$TITLE/g" "$OUTPUT_PATH"
sed -i '' "s/\[Feature\/Component\] Implementation Plan/$TITLE Implementation Plan/g" "$OUTPUT_PATH"

# Update the creation date
TODAY=$(date +%Y-%m-%d)
sed -i '' "s/YYYY-MM-DD/$TODAY/g" "$OUTPUT_PATH"

echo "Document created: $OUTPUT_PATH"
echo ""
echo "Next steps:"
echo "1. Fill in the content sections"
echo "2. Update the Table of Contents if needed"
echo "3. Add related documents"
echo "4. Update the Document Information section with correct author details"
