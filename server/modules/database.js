/* the only line you likely need to change is
 mongoURI = 'mongodb://localhost:27017/prime_app';
 change `prime_app` to the name of your database, and you should be all set!
*/

const mongoose = require('mongoose');

/* Mongo Connection */
let mongoURI = '';

// process.env.MONGODB_URI will only be defined if you are running on Heroku
if (process.env.MONGODB_URI) {
  // Heroku will provide this when deployed
  // use the string value of the environment variable
  mongoURI = process.env.MONGODB_URI;
} else {
  // use the local database server
  mongoURI = 'mongodb://localhost:27017/jfuerst_scheduling';
}

mongoose.connect(mongoURI);

mongoose.connection.once('open', () => {
  console.log('Mongo connected');
});

mongoose.connection.on('error', (err) => {
  console.log('Error on mongoose connection: ', err);
});
