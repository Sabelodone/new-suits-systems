from app import create_app, db
from sqlalchemy import text  # Import this at the top

app = create_app()

# Create the database (if not created)
with app.app_context():
    print("Creating databases tables...")
    db.create_all()
    print("Database tables created")

    def test_connection():
        try:
            with app.app_context():
                # Attempt to connect and execute a simple query
                db.session.execute(text('SELECT 1'))  # Simple query to check connection
                print("Database connection successful!")
        except Exception as e:
            print(f"Database connection failed: {e}")

    import random
    from app.models.gender import Gender

    '''for i in range(0, 10):
        random_num = random.randrange(1, 1000)
        gender = Gender(name='female')
        try:
            gender.save()
            print("yes")
        except Exception as e:
            print(f"Error: {e}")
        print(gender)
        print('--')'''

    test_connection()

if __name__ == '__main__':
    app.run(debug=True)

