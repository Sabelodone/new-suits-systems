from app import create_app, db

app = create_app()

# Create the database (if not created)
with app.app_context():
    db.create_all()

    import random
    from app.models.gender import Gender

    for i in range(0, 10):
        random_num = random.randrange(1, 1000)
        gender = Gender(name='female')
        gender.save()
        print(gender)
        print('--')

if __name__ == '__main__':
    app.run(debug=True)
