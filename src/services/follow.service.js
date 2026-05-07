const Follow = require('../models/followModel');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const { t } = require('../utils/i18n');


const followUser = async (currentUserId, targetUserId) => {

  if (currentUserId === targetUserId) {
    throw new AppError(t('YOU_CANNOT_FOLLOW_SELF'), 400);
  }

  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    throw new AppError(t('NOT_FOUND'), 404);
  }

  const alreadyExists = await Follow.exists({
    follower: currentUserId,
    following: targetUserId,
  });

  if (alreadyExists) {
    throw new AppError(t('Follow request already exists'), 400);
  }

  const status = targetUser.isPrivate
    ? 'pending'
    : 'accepted';

  const follow = await Follow.create({
    follower: currentUserId,
    following: targetUserId,
    status,
  });

  return follow;
};

const unfollowUser = async (currentUserId, targetUserId) => {

  const deletedFollow = await Follow.findOneAndDelete({
    follower: currentUserId,
    following: targetUserId,
  });

  if (!deletedFollow) {
    throw new AppError(t('Follow relationship not found'), 404);
  }

  return deletedFollow;
};

const acceptFollowRequest = async (
  currentUserId,
  followId
) => {

  const follow = await Follow.findById(followId);

  if (!follow) {
    throw new AppError(t('FOLLOW_REQUEST_NOT_FOUND'), 404);
  }

  if (follow.following.toString() !== currentUserId) {
    throw new AppError(t('Unauthorized'), 403);
  }

  follow.status = 'accepted';

  await follow.save();

  return follow;
};

const rejectFollowRequest = async (
  currentUserId,
  followId
) => {

  const follow = await Follow.findById(followId);

  if (!follow) {
    throw new AppError(t('FOLLOW_REQUEST_NOT_FOUND'), 404);
  }

  if (follow.following.toString() !== currentUserId) {
    throw new AppError(t('Unauthorized'), 403);
  }

  await follow.deleteOne();

  return true;
};

const getFollowers = async (userId) => {

  const followers = await Follow.find({
    following: userId,
    status: 'accepted',
  }).populate(
    'follower',
    'name username'
  );

  return followers;
};

const getFollowing = async (userId) => {

  const following = await Follow.find({
    follower: userId,
    status: 'accepted',
  }).populate(
    'following',
    'name username'
  );

  return following;
};

const getPendingFollowRequests = async (userId) => {

  const pendingRequests = await Follow.find({
    following: userId,
    status: 'pending',
  }).populate(
    'follower',
    'name username'
  ).sort({ createdAt: -1 });
  return pendingRequests;
};

module.exports = {
  followUser,
  unfollowUser,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowers,
  getFollowing,
  getPendingFollowRequests,
};