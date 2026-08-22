import json
import os
from pathlib import Path

# Get all lesson files from mentor/lessons directory
lessons_dir = Path('mentor/lessons')
lesson_files = []

if lessons_dir.exists():
    for file in lessons_dir.glob('*.json'):
        # Skip non-lesson files
        if file.name in ['algorithm-list.json', 'ALGORITHM_STATUS_LIST.txt', 'CONSOLIDATED_ALGORITHM_LIST.txt']:
            continue
        
        lesson_id = file.stem
        
        # Read the lesson file to get metadata
        try:
            with open(file, 'r', encoding='utf-8') as f:
                lesson_data = json.load(f)
                
                lesson_info = {
                    'id': lesson_id,
                    'title': lesson_data.get('title', lesson_id.replace('-', ' ').title()),
                    'difficulty': lesson_data.get('difficulty', 'medium'),
                    'pattern': lesson_data.get('pattern', 'algorithm')
                }
                
                lesson_files.append(lesson_info)
        except Exception as e:
            print(f"Error reading {file.name}: {e}")
            # Add with default values
            lesson_files.append({
                'id': lesson_id,
                'title': lesson_id.replace('-', ' ').title(),
                'difficulty': 'medium',
                'pattern': 'algorithm'
            })

# Sort by title
lesson_files.sort(key=lambda x: x['title'])

# Categorize algorithms based on pattern
categories = {
    'array-basics': [],
    'two-pointers': [],
    'sliding-window': [],
    'binary-search': [],
    'linked-list': [],
    'tree': [],
    'graph': [],
    'backtracking': [],
    'dynamic-programming': [],
    'sorting': [],
    'greedy': [],
    'string': [],
    'hash-map': [],
    'stack': [],
    'queue': [],
    'heap': [],
    'other': []
}

# Pattern to category mapping
pattern_mapping = {
    'array': 'array-basics',
    'two-pointers': 'two-pointers',
    'sliding-window': 'sliding-window',
    'binary-search': 'binary-search',
    'linked-list': 'linked-list',
    'tree': 'tree',
    'graph': 'graph',
    'backtracking': 'backtracking',
    'dynamic-programming': 'dynamic-programming',
    'sorting': 'sorting',
    'greedy': 'greedy',
    'string': 'string',
    'hash-map': 'hash-map',
    'stack': 'stack',
    'queue': 'queue',
    'heap': 'heap'
}

# Categorize each lesson
for lesson in lesson_files:
    pattern = lesson['pattern']
    category = pattern_mapping.get(pattern, 'other')
    categories[category].append(lesson)

# Remove empty categories
categories = {k: v for k, v in categories.items() if v}

# Save to algorithm-list.json
output_file = 'mentor/algorithm-list.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(categories, f, indent=2, ensure_ascii=False)

print(f"Generated algorithm list with {len(lesson_files)} algorithms")
print(f"\nCategories:")
for category, algorithms in categories.items():
    print(f"  {category}: {len(algorithms)} algorithms")

print(f"\nSaved to: {output_file}")


