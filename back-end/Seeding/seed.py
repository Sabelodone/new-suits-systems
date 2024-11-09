import json
from config import db

def seed(file_path='./seeding.json'):
    with open(file_path) as f:
        data = json.load(f)

    for class_name, records in data.items():
        model = db.Model._decl_class_registry.get(class_name)
        
        if model is None:
            print(f"Warning: No model found for '{class_name}'. Skipping.")
            continue
        
        # Create objects in bulk
        objects = [model(**record) for record in records]

        try:
            # Use bulk save
            db.session.bulk_save_objects(objects)
            print(f"Seeded {len(objects)} records into '{class_name}'.")
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding data for '{class_name}': {e}")

    try:
        # Commit once after all data is seeded
        db.session.commit()
        print("All data seeded successfully.")
    except Exception as e:
        db.session.rollback()
        print(f"Final commit failed: {e}")
