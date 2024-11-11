from app import create_app, db
from sqlalchemy import text  # Import this at the top
from Seeding.seed import seed
import os


app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # db.drop_all()
        # if not app.debug or os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        #     seed('./Seeding/seeding.json')

    app.run(debug=False)
