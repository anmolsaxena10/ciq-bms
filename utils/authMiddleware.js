const basicAuth = require('express-basic-auth');
const bcrypt = require('bcrypt');
// const saltRounds = 10;

function loginAuthorizer(admin = false){
    function authorizer(username, password) {
        const userMatches = basicAuth.safeCompare(username, 'admin')
        const passwordMatches = basicAuth.safeCompare(password, '1234')

        // get user and verify like this
        // bcrypt.compare(myPlaintextPassword, hash).then(function(result) {
        //     // result == true
        // });

        return userMatches & passwordMatches & admin;
    }
    
    return basicAuth({ 
        authorizer: authorizer,
        challenge: true
    });
}

module.exports = loginAuthorizer;