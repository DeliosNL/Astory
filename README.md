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
Import data
-----------
This is optional, this step is only necessary if you want to run the provided unit tests and POSTMAN requests. See the seperate README's in the server and client/Tests map.

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

