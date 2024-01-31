import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import config from "../configs/config.js";
import oauthLogin from "../models/oauthLogin.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.secretId,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async function (accessToken, profile, cb) {
      try {
        const user = await oauthLogin.findOrCreate({
          where: { provider_id: profile.id },
          defaults: {
            provider_id: profile.id,
            provider: profile.provider,
            token: accessToken,
            name: profile.displayName,
            email: profile.emails[0]?.value,
            avatar: profile?.photos[0]?.value,
          },
        });
        return cb(err, profile);
      } catch (error) {}
      console.log(error);
    }
  )
);
