const badSecret = `
----------------------------

*** WARNING ***
Your application is not very secure.
You need to set SERVER_SESSION_SECRET to a better secret
Please follow the README and add a .env file

It should be
- longer than 8 characters
- not "superDuperSecret"

If this warning is showing on Heroku,
add or change your SERVER_SESSION_SECRET environment variable!

----------------------------`;

const noBaseApiUrl = `
----------------------------

*** WARNING ***
To run in develop mode, you need REACT_APP_API_BASE_URL
You don't have REACT_APP_API_BASE_URL
Please follow the README and add a .env file  

----------------------------`;

const exampleBadSecret = 'superDuperSecret';

module.exports = {
  badSecret,
  noBaseApiUrl,
  exampleBadSecret,
};
