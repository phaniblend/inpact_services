import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from update_all_algorithm_data import generate_algorithm_list, update_lessons_json

if __name__ == '__main__':
    print("Generating algorithm list from lesson files...")
    result = generate_algorithm_list()
    
    if result:
        categories, lesson_files = result
        print("\nUpdating lessons.json...")
        update_lessons_json(lesson_files)
        print("\n✅ All algorithm data updated successfully!")
        print(f"\nTotal algorithms: {len(lesson_files)}")


