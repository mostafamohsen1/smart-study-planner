const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { poolPromise, sql } = require('./db');
const jwtConfig = require('./jwt');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtConfig.secret
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        const pool = await poolPromise;
        const result = await pool.request()
          .input('UserID', sql.Int, jwt_payload.id)
          .execute('sp_GetUserById');
        
        const user = result.recordset[0];
        
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        console.error('Error in passport strategy:', error);
        return done(error, false);
      }
    })
  );
}; 