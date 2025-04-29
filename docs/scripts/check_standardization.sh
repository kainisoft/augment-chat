#!/bin/bash
# Script to check which documentation files have been standardized

# Define the required sections for standardized documents
REQUIRED_SECTIONS=(
  "## Overview"
  "## Table of Contents"
  "## Related Documents"
  "## Document Information"
)

# Find all markdown files in the docs directory
find_docs() {
  find docs -name "*.md" -not -path "*/node_modules/*" | sort
}

# Check if a file contains all required sections
check_file() {
  local file="$1"
  local missing_sections=()
  
  for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" "$file"; then
      missing_sections+=("$section")
    fi
  done
  
  if [ ${#missing_sections[@]} -eq 0 ]; then
    echo "✅ $file"
    return 0
  else
    echo "❌ $file (Missing: ${missing_sections[*]})"
    return 1
  fi
}

# Main function
main() {
  echo "Checking documentation standardization..."
  echo ""
  
  local total_files=0
  local standardized_files=0
  
  while read -r file; do
    # Skip template files and the standard itself
    if [[ "$file" == "docs/TEMPLATE.md" || 
          "$file" == "docs/PLAN_TEMPLATE.md" || 
          "$file" == "docs/DOCUMENTATION_STANDARD.md" ||
          "$file" == "docs/README.md" ]]; then
      continue
    fi
    
    ((total_files++))
    
    if check_file "$file"; then
      ((standardized_files++))
    fi
  done < <(find_docs)
  
  echo ""
  echo "Summary:"
  echo "- Total documentation files: $total_files"
  echo "- Standardized files: $standardized_files"
  echo "- Non-standardized files: $((total_files - standardized_files))"
  echo "- Progress: $((standardized_files * 100 / total_files))%"
}

# Run the main function
main
