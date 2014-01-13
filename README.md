Description
===========
This is the repository of the "Astory" project for the CRIA (Create a Rich Internet Application coruse). Astory is a rich internet application which allows it's users to create their own story and share it with others. 

Setup
=====
Installation for development
----------------------------

Clone the repository with
```
git clone https://github.com/DeliosNL/Astory.git
```

Configuration
----------
Open```server/config/config.js```,  change the database and port

Example
```javascript
module.exports = {
    development: {
        db: 'mongodb://localhost/astory',
        port: 8500
    }, test: {

    }, production: {

    }
};
```
Import Data
===========
This step is necessary for testing, if testing is not necessary this step can be skipped.
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


supervisor
----------
Make sure you have supervisor installed - with the global option

```sh
npm install -g supervisor
```

Use it with
```sh
supervisor --no-restart-on error server/app.js
```



