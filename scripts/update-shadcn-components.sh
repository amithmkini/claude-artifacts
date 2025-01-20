#!/bin/bash

# update-shadcn-components.sh
# Script to bulk update all shadcn/ui components

# Set error handling
set -e
# Check if components.json exists
if [ ! -f "components.json" ]; then
    echo "Error: components.json not found"
    echo "Please run this script from your project root"
    exit 1
fi

# Get components path from components.json and replace @ with src
COMPONENTS_PATH=$(cat components.json | grep -o '"components": "[^"]*"' | cut -d'"' -f4 | sed 's/@/src/')

if [ ! -d "$COMPONENTS_PATH/ui" ]; then
    echo "Error: $COMPONENTS_PATH/ui directory not found" 
    echo "Please check your components.json configuration"
    exit 1
fi

# Log start of updates
echo "Starting shadcn/ui components update..."
echo "Checking components in src/components/ui/..."

# Initialize counter
updated=0
failed=0

# Update each component
for file in src/components/ui/*.tsx; do
    # Extract component name
    component=$(basename "$file" .tsx)
    
    echo "Updating component: $component"
    
    # Try to update the component
    if npx shadcn@latest add -y -o "$component"; then
        updated=$((updated + 1))
        echo "✓ Successfully updated $component"
    else
        failed=$((failed + 1))
        echo "✗ Failed to update $component"
    fi
done

# Print summary
echo "Update complete!"
echo "Successfully updated: $updated components"
if [ $failed -gt 0 ]; then
    echo "Failed to update: $failed components"
    exit 1
fi