#!/usr/bin/env python3
import json
import os
from pathlib import Path

def generate_algorithm_list():
    """Generate algorithm list from all lesson files"""
    lessons_dir = Path('mentor/lessons')
    lesson_files = []
    
    if not lessons_dir.exists():
        print(f"Error: {lessons_dir} does not exist")
        return
    
    # Get all JSON lesson files
    for file in lessons_dir.glob('*.json'):
        # Skip non-lesson files
        skip_files = ['algorithm-list.json']
        if file.name in skip_files:
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
            # Add with default values
            lesson_files.append({
                'id': lesson_id,
                'title': lesson_id.replace('-', ' ').title(),
                'difficulty': 'medium',
                'pattern': 'algorithm'
            })
    
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
    print(f"Generated algorithm list with {total} algorithms")
    print(f"{'='*60}")
    print(f"\nCategories:")
    for category, algorithms in sorted(categories.items()):
        print(f"  {category:25} {len(algorithms):3} algorithms")
    
    print(f"\nSaved to: {output_file.absolute()}")
    return categories, total

if __name__ == '__main__':
    generate_algorithm_list()


