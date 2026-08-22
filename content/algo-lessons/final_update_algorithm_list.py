#!/usr/bin/env python3
"""
Update algorithm list and lessons.json with all 104 approved algorithms
"""
import json
from pathlib import Path

def main():
    lessons_dir = Path('mentor/lessons')
    lesson_files = []
    
    if not lessons_dir.exists():
        print(f"Error: {lessons_dir} does not exist")
        return
    
    # Get all JSON lesson files
    for file in sorted(lessons_dir.glob('*.json')):
        if file.name == 'algorithm-list.json':
            continue
        
        lesson_id = file.stem
        
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
    
    # Categorize algorithms
    categories = {
        'array-basics': [], 'two-pointers': [], 'sliding-window': [],
        'binary-search': [], 'linked-list': [], 'tree': [], 'graph': [],
        'backtracking': [], 'dynamic-programming': [], 'sorting': [],
        'greedy': [], 'string': [], 'hash-map': [], 'stack': [],
        'queue': [], 'heap': [], 'other': []
    }
    
    for lesson in lesson_files:
        pattern = lesson['pattern']
        category = pattern_mapping.get(pattern, 'other')
        if category in categories:
            categories[category].append(lesson)
        else:
            categories['other'].append(lesson)
    
    # Sort each category
    for category in categories:
        categories[category].sort(key=lambda x: x['title'])
    
    # Remove empty categories
    categories = {k: v for k, v in categories.items() if v}
    
    # Save algorithm-list.json
    algo_list_file = Path('mentor/algorithm-list.json')
    with open(algo_list_file, 'w', encoding='utf-8') as f:
        json.dump(categories, f, indent=2, ensure_ascii=False)
    
    # Update lessons.json
    lessons_metadata = []
    for lesson in lesson_files:
        lessons_metadata.append({
            'id': lesson['id'],
            'title': lesson['title'],
            'difficulty': lesson['difficulty'],
            'pattern': lesson['pattern'],
            'language': 'javascript',
            'status': 'complete'
        })
    
    lessons_metadata.sort(key=lambda x: x['title'])
    
    lessons_json_file = Path('mentor/lessons.json')
    with open(lessons_json_file, 'w', encoding='utf-8') as f:
        json.dump({'lessons': lessons_metadata}, f, indent=2, ensure_ascii=False)
    
    total = sum(len(algs) for algs in categories.values())
    print(f"\n{'='*60}")
    print(f"✅ Updated algorithm-list.json with {total} algorithms")
    print(f"✅ Updated lessons.json with {len(lessons_metadata)} lessons")
    print(f"{'='*60}")
    print(f"\nCategories:")
    for category, algorithms in sorted(categories.items()):
        print(f"  {category:25} {len(algorithms):3} algorithms")
    print(f"\nTotal: {total} algorithms")

if __name__ == '__main__':
    main()


