import jwt from 'jsonwebtoken';
import express from 'express';
import passport from '../config/passport';
import type { User } from '../types';
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), 
  (req, res) => {
    // Generate JWT after successful Google login
    const { user, googleTokens } = req.user as { user: User, googleTokens: any };
    if (user) {
      const tokenUser = {
        ...user,
        accessToken: googleTokens.accessToken,
        refreshToken: googleTokens.refreshToken
      }
      const token = jwt.sign(tokenUser, process.env.JWT_SECRET!, { expiresIn: '1h' });

      // Send the token and user data to the frontend
      res.json({
        token,
        user
      });

    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
   
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});


export default router;