#!/bin/bash

# Base URL
BASE_URL="http://localhost:3000/api"

# Helper function for printing
print_header() {
    echo "--------------------------------------------------"
    echo "$1"
    echo "--------------------------------------------------"
}

# 1. Get initial members
print_header "1. Get Members"
curl -s "$BASE_URL/members" | python3 -m json.tool

# 2. Create a new project
print_header "2. Create Project"
PROJECT_RES=$(curl -s -X POST "$BASE_URL/projects" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Project", "description": "Auto-generated project", "start_date": "2024-01-01", "end_date": "2024-12-31"}')
echo "$PROJECT_RES" | python3 -m json.tool
PROJECT_ID=$(echo "$PROJECT_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "null" ]; then
    echo "Failed to create project"
    exit 1
fi

# 3. Create a section
print_header "3. Create Section"
SECTION_RES=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/sections" \
    -H "Content-Type: application/json" \
    -d '{"name": "Development Phase"}')
echo "$SECTION_RES" | python3 -m json.tool
SECTION_ID=$(echo "$SECTION_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# 4. Create a task
print_header "4. Create Task"
TASK_RES=$(curl -s -X POST "$BASE_URL/sections/$SECTION_ID/tasks" \
    -H "Content-Type: application/json" \
    -d '{"name": "Setup Database", "type": "task", "order_index": 0}')
echo "$TASK_RES" | python3 -m json.tool
TASK_ID=$(echo "$TASK_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# 5. Update task
print_header "5. Update Task"
curl -s -X PUT "$BASE_URL/tasks/$TASK_ID" \
    -H "Content-Type: application/json" \
    -d '{"progress": 50}' | python3 -m json.tool

# 6. Get full project details
print_header "6. Get Project Details"
curl -s "$BASE_URL/projects/$PROJECT_ID" | python3 -m json.tool

# 7. Delete Task
print_header "7. Delete Task"
curl -s -X DELETE "$BASE_URL/tasks/$TASK_ID" | python3 -m json.tool

# 8. Delete Section
print_header "8. Delete Section"
curl -s -X DELETE "$BASE_URL/sections/$SECTION_ID" | python3 -m json.tool

echo "Verification Complete"
