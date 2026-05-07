const router = require('express').Router();

const followctrl = require('../controllers/follow.controller');

const { protect } = require('../middlewares');

router.use(protect);

router.post(
  '/users/:id/follow',
  followctrl.followUser
);

router.delete(
  '/users/:id/unfollow',
  followctrl.unfollowUser
);

router.patch(
  '/follow/:followId/accept',
  followctrl.acceptFollowRequest
);

router.delete(
  '/follow/:followId/reject',
  followctrl.rejectFollowRequest
);

router.get(
  '/users/:id/followers',
  followctrl.getFollowers
);

router.get(
  '/users/:id/following',
  followctrl.getFollowing
);

router.get('/follow/requests', followctrl.getPendingFollowRequests);

module.exports = router;