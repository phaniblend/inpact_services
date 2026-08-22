#!/usr/bin/env python3
"""
Update algorithm list and lessons.json with all 104 approved algorithms
"""
import json
import os
from pathlib import Path

def generate_algorithm_list():
    """Generate algorithm-list.json from all lesson files"""
    lessons_dir = Path('mentor/lessons')
    lesson_files = []
    
    if not lessons_dir.exists():
        print(f"Error: {lessons_dir} does not exist")
        return None
    
    # Get all JSON lesson files
    for file in sorted(lessons_dir.glob('*.json')):
        # Skip non-lesson files
        if file.name == 'algorithm-list.json':
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
            print(f"Warning: Error reading {file.name}: {e}")
            continue
    
    print(f"Found {len(lesson_files)} lesson files")
    
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
    
    # Categorize each lesson
    for lesson in lesson_files:
        pattern = lesson['pattern']
        category = pattern_mapping.get(pattern, 'other')
        if category in categories:
            categories[category].append(lesson)
        else:
            categories['other'].append(lesson)
    
    # Sort each category by title
    for category in categories:
        categories[category].sort(key=lambda x: x['title'])
    
    # Remove empty categories
    categories = {k: v for k, v in categories.items() if v}
    
    # Save to algorithm-list.json
    output_file = Path('mentor/algorithm-list.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(categories, f, indent=2, ensure_ascii=False)
    
    total = sum(len(algs) for algs in categories.values())
    print(f"\n{'='*60}")
    print(f"Generated algorithm-list.json with {total} algorithms")
    print(f"{'='*60}")
    print(f"\nCategories:")
    for category, algorithms in sorted(categories.items()):
        print(f"  {category:25} {len(algorithms):3} algorithms")
    
    print(f"\nSaved to: {output_file.absolute()}")
    return categories, lesson_files

def update_lessons_json(lesson_files):
    """Update mentor/lessons.json with metadata from all lesson files"""
    lessons_json_path = Path('mentor/lessons.json')
    
    # Create lessons array with metadata only
    lessons_metadata = []
    for lesson in lesson_files:
        lessons_metadata.append({
            'id': lesson['id'],
            'title': lesson['title'],
            'difficulty': lesson['difficulty'],
            'pattern': lesson['pattern'],
            'language': 'javascript',  # Default
            'status': 'complete'  # All approved lessons are complete
        })
    
    # Sort by title
    lessons_metadata.sort(key=lambda x: x['title'])
    
    # Create lessons.json structure
    lessons_data = {
        'lessons': lessons_metadata
    }
    
    with open(lessons_json_path, 'w', encoding='utf-8') as f:
        json.dump(lessons_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nUpdated mentor/lessons.json with {len(lessons_metadata)} lessons")
    print(f"Saved to: {lessons_json_path.absolute()}")

if __name__ == '__main__':
    print("Generating algorithm list from lesson files...")
    result = generate_algorithm_list()
    
    if result:
        categories, lesson_files = result
        print("\nUpdating lessons.json...")
        update_lessons_json(lesson_files)
        print("\n✅ All algorithm data updated successfully!")
        print(f"\nTotal algorithms: {len(lesson_files)}")


