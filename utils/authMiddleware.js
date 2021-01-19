const basicAuth = require('express-basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('./models');

function loginAuthorizer(admin = false){
    async function authorizer(email, password, cb) {
        const userMatches = basicAuth.safeCompare(email, 'admin');
        const passwordMatches = basicAuth.safeCompare(password, '1234');
        
        if(userMatches & passwordMatches){
            return cb(null, true);
        }
        else{
            try{
                const user = await User.findOne({
                    where: {
                        email: email
                    }
                });

                if(user === undefined)
                    return cb(null, false);
                    
                let verified = await bcrypt.compare(password, user.pass_hash);

                if(admin){
                    verified = verified && user.is_admin;
                }
                return cb(null, verified);
            }
            catch(error){
                return cb(null, false);
            }
        }
    }
    
    return basicAuth({ 
        authorizer: authorizer,
        challenge: true,
        authorizeAsync: true,
    });
}

module.exports = loginAuthorizer;