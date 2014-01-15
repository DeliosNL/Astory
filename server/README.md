
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
Server-side testing uses Jasmine-Node to run the server-side tests. If Jasmine-Node has not been installed yet, install it with the following command:
```
sudo npm install jasmine-node -g
```

In order to run the tests the "request" package needs to be install, install this globally with the following command:

```
sudo npm install request -g
```
After installing request, run the tests with the following command:
```
jasmine-node spec/
```

POSTMAN Api
------------
In order to test all the routes in POSTMAN rest client, import the following collection
```
https://www.getpostman.com/collections/41ace1b4171bb15a6a20
```
