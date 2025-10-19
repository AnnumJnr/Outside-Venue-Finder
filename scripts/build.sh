#!/bin/bash

# Build Script for Outside Django App
# This script prepares the Django application for testing

set -e  # Exit on error

echo "🏗️  Starting build process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Python version
echo -e "${BLUE}Checking Python version...${NC}"
python --version

# Upgrade pip
echo -e "${BLUE}Upgrading pip...${NC}"
pip install --upgrade pip

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
pip install -r requirements.txt

# Check for missing migrations
echo -e "${BLUE}Checking for missing migrations...${NC}"
python manage.py makemigrations --check --dry-run

# Check Django configuration
echo -e "${BLUE}Checking Django configuration...${NC}"
python manage.py check

# Collect static files (for production)
echo -e "${BLUE}Collecting static files...${NC}"
python manage.py collectstatic --noinput --clear || echo "Static files collection skipped"

echo -e "${GREEN}✅ Build completed successfully!${NC}"