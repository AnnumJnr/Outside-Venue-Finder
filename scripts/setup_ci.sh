#!/bin/bash

# CI Environment Setup Script
# Prepares the CI environment for testing

set -e

echo "🔧 Setting up CI environment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Install system dependencies (if needed)
echo -e "${BLUE}Installing system dependencies...${NC}"

# Update package lists (Ubuntu/Debian)
if command -v apt-get &> /dev/null; then
    sudo apt-get update -qq
fi

# Install Python dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
pip install coverage  # For test coverage

# Install additional testing tools
pip install flake8  # Code linting
pip install black   # Code formatting check

# Create .env for testing (if it doesn't exist)
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating test .env file...${NC}"
    cat > .env << EOF
SECRET_KEY=test-secret-key-for-ci
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
FOURSQUARE_API_KEY=
GOOGLE_PLACES_API_KEY=
EOF
fi

# Run migrations
echo -e "${BLUE}Running migrations...${NC}"
python manage.py migrate --noinput

# Create categories for testing
echo -e "${BLUE}Setting up test data...${NC}"
python manage.py setup_categories || echo "Categories already exist"

echo -e "${GREEN}✅ CI environment setup complete!${NC}"