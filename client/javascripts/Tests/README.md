
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

Unit testing
--------
Client side unit testing uses Karma, assure karma is installed. If karma is not installed, install it with the following command:
```
npm install karma -g
```
After installing karma, run the unit tests with the following command:
```
karma start javascripts/Tests/karma.config.js
```


E2E testing
-------------
Start of by making sure karma-ng-scenario is installed, install it by using the following command:
```
sudo npm install karma-ng-scenario -g
```
Edit the karma-e2e.conf.js file, change the "proxies" setting to match your chosen port number
```
proxies : {
    '/': 'http://localhost:*YOUR PORT HERE*/'
}
```
Finally, run the e2e tests with the following command:
```
karma start karma-e2e.conf.js

```
-------------