import json
from app.extentions import db

def seed(file_path='./seeding.json'):
    with open(file_path, "r", encoding="UTF-8") as f:
        data = json.load(f, object_pairs_hook=dict)

    for class_name, records in data.items():
        model = db.Model.registry._class_registry.get(class_name)

        if not isinstance(model, type):
            print(f"Warning: Model '{class_name}' not found. Skipping.")
            continue

        # Filter records for valid fields before creating objects
        valid_columns = {col.name for col in model.__table__.columns}

        objects = []
        for record in records:
            filtered_record = {k: v for k, v in record.items() if k in valid_columns}
            objects.append(model(**filtered_record))

        try:
            db.session.bulk_save_objects(objects)
            print(f"Seeded {len(objects)} records into '{class_name}'.")
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding '{class_name}': {e}")

    db.session.commit()
    print("Seeding completed successfully.")
