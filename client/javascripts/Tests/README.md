
Import Data
===========
If the database has not been populated yet with the supplied .json files, execute the following instructions:

1. Replace ```astory``` with the name of your database.
2. Import the data (per collection or in one step)
3. Done


Import seed per collection
```
mongoimport --db astory --collection users --file users.json
mongoimport --db astory --collection stories --file stories.json
mongoimport --db astory --collection scenarios --file scenarios.json
mongoimport --db astory --collection scenes --file scenes.json
```

Testing
--------
Client side testing uses Karma, assure karma is installed. If karma is not installed, install it with the following command:
```
sudo apt-get install karma
```
After installing karma, run the unit tests with the following command:
```
karma start javascripts/Tests/karma.config.js
```

