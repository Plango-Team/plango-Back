const { catchAsync, sendSuccess } = require('../utils/helpers');
const followService = require('../services/follow.service');
const { t } = require('../utils/i18n');

const followUser = catchAsync(async (req, res) => {

  const follow = await followService.followUser(
    req.user._id.toString(),
    req.params.id
  );

  sendSuccess(res, 201, t(req.lang, 'FOLLOW_SUCCESS'), { data: follow });
});

const unfollowUser = catchAsync(async (req, res) => {

  await followService.unfollowUser(
    req.user._id.toString(),
    req.params.id
  );

  sendSuccess(res, 200, t(req.lang, 'UNFOLLOW_SUCCESS'));
});

const acceptFollowRequest = catchAsync(async (req, res) => {

  const follow =
    await followService.acceptFollowRequest(
      req.user._id.toString(),
      req.params.followId
    );

  sendSuccess(res, 200, t(req.lang, 'ACCEPT_FOLLOW_REQUEST'), { data: follow });
});

const rejectFollowRequest = catchAsync(async (req, res) => {

  await followService.rejectFollowRequest(
    req.user._id.toString(),
    req.params.followId
  );

  sendSuccess(res, 200, t(req.lang, 'REJECT_FOLLOW_REQUEST'));
});

   

const getFollowers = catchAsync(async (req, res) => {

  const followers =
    await followService.getFollowers(req.params.id);

  sendSuccess(res, 200, t(req.lang, 'FOLLOWERS_RETRIEVED'), { data: followers });
});

const getFollowing = catchAsync(async (req, res) => {

  const following =
    await followService.getFollowing(req.params.id);

  sendSuccess(res, 200, t(req.lang, 'FOLLOWING_RETRIEVED'), { data: following });
});



const getPendingFollowRequests = catchAsync(async (req, res) => {

  const pendingRequests =
    await followService.getPendingFollowRequests(req.params.id);

  sendSuccess(res, 200, t(req.lang, 'PENDING_FOLLOW_REQUESTS_RETRIEVED'), { data: pendingRequests });
});

module.exports = {
  followUser,
  unfollowUser,
    acceptFollowRequest,
    rejectFollowRequest,
    getFollowers,
    getFollowing,
    getPendingFollowRequests
};