#!/bin/bash

# Test Script for Outside Django App
# Runs all tests and generates coverage report

set -e  # Exit on error

echo "🧪 Starting test suite..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run Django system checks
echo -e "${BLUE}Running Django system checks...${NC}"
python manage.py check

# Run migrations (for test database)
echo -e "${BLUE}Running migrations...${NC}"
python manage.py migrate --noinput

# Run tests with coverage
echo -e "${BLUE}Running test suite...${NC}"

if command -v coverage &> /dev/null; then
    echo -e "${BLUE}Running tests with coverage...${NC}"
    coverage run --source='.' manage.py test tests
    
    echo -e "${BLUE}Generating coverage report...${NC}"
    coverage report
    
    echo -e "${BLUE}Generating HTML coverage report...${NC}"
    coverage html
    
    echo -e "${GREEN}Coverage report generated in htmlcov/index.html${NC}"
else
    echo -e "${YELLOW}Coverage not installed, running tests without coverage...${NC}"
    python manage.py test tests
fi

# Check for common issues
echo -e "${BLUE}Checking for common issues...${NC}"

# Check for missing migrations
python manage.py makemigrations --check --dry-run || {
    echo -e "${RED}❌ You have unapplied migrations!${NC}"
    exit 1
}

# Security checks
echo -e "${BLUE}Running security checks...${NC}"
python manage.py check --deploy --fail-level WARNING || echo -e "${YELLOW}⚠️  Some deployment checks failed${NC}"

echo -e "${GREEN}✅ All tests passed!${NC}"