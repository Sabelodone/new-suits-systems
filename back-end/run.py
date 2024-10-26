from app import create_app, db

app = create_app()

# Create the database (if not created)
with app.app_context():
    print("Creating databases tables...")
    db.create_all()
    print("Database tables created")

if __name__ == '__main__':
    app.run(debug=True)

