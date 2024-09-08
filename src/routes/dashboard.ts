import express from 'express';
import passport from '../config/passport';

const router = express.Router();

// Example of a protected route
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    message: 'Welcome to the dashboard!',
    user: req.user
  });
});

export default router;
