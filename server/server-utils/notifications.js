import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";

export const setNotificationsToUnread = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user.unreadNotification) {
      user.unreadNotification = true;
      await user.save();
    }
  } catch (error) {
    console.error(error);
  }
};

export const newLikeNotification = async (
  userToNotifyId,
  userWhoLikedId,
  postId
) => {
  try {
    const userToNofify = await Notification.findOne({ user: userToNotifyId });
    const notification = {
      type: "like",
      user: userWhoLikedId,
      post: postId,
      date: Date.now(),
    };

    userToNofify.notifications.unshift(notification);
    await userToNofify.save();

    await setNotificationsToUnread(userToNotifyId);
  } catch (error) {
    console.error(error);
  }
};

export const removeLikeNotification = async (
  userToNotifyId,
  userWhoLikedId,
  postId
) => {
  try {
    await Notification.findOneAndUpdate(
      { user: userToNotifyId },
      {
        $pull: {
          notifications: {
            type: "like",
            user: userWhoLikedId,
            post: postId,
          },
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

export const newCommentNotification = async (
  userToNotifyId,
  userWhoCommentedId,
  postId,
  commentId,
  commentText
) => {
  try {
    const userToNotify = await Notification.findOne({ user: userToNotifyId });
    const notification = {
      type: "comment",
      user: userWhoCommentedId,
      post: postId,
      commentId,
      text: commentText,
      date: Date.now(),
    };

    userToNotify.notifications.unshift(notification);
    await userToNotify.save();

    await setNotificationsToUnread(userToNotifyId);
  } catch (error) {
    console.error(error);
  }
};

export const newReplyNotification = async (
  userToNotifyId,
  userWhoCommentedId,
  postId,
  commentId,
  commentText
) => {
  try {
    const userToNotify = await Notification.findOne({ user: userToNotifyId });
    const notification = {
      type: "reply",
      user: userWhoCommentedId,
      post: postId,
      commentId,
      text: commentText,
      date: Date.now(),
    };

    userToNotify.notifications.unshift(notification);
    await userToNotify.save();

    await setNotificationsToUnread(userToNotifyId);
  } catch (error) {
    console.error(error);
  }
};

export const removeCommentNotification = async (
  userToNotifyId,
  userWhoCommentedId,
  postId,
  commentId
) => {
  try {
    await Notification.findOneAndUpdate(
      { user: userToNotifyId },
      {
        $pull: {
          notifications: {
            type: "comment",
            user: userWhoCommentedId,
            post: postId,
            commentId,
          },
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

export const removeReplyNotification = async (
  userToNotifyId,
  userWhoCommentedId,
  postId,
  commentId
) => {
  try {
    await Notification.findOneAndUpdate(
      { user: userToNotifyId },
      {
        $pull: {
          notifications: {
            type: "reply",
            user: userWhoCommentedId,
            post: postId,
            commentId,
          },
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

export const newFollowerNotification = async (
  userToNotifyId,
  userWhoFollowedId
) => {
  try {
    const userToNotify = await Notification.findOne({ user: userToNotifyId });
    const notification = {
      type: "follow",
      user: userWhoFollowedId,
      date: Date.now(),
    };

    userToNotify.notifications.unshift(notification);
    await userToNotify.save();

    await setNotificationsToUnread(userToNotifyId);
  } catch (error) {
    console.error(error);
  }
};

export const removeFollowerNotification = async (
  userToNotifyId,
  userWhoFollowedId
) => {
  try {
    await Notification.findOneAndUpdate(
      { user: userToNotifyId },
      {
        $pull: { notifications: { type: "follow", user: userWhoFollowedId } },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

export const newBadgeNotification = async (userToNotifyId, badgeTitle) => {
  try {
    const userToNotify = await Notification.findOne({ user: userToNotifyId });
    const notification = {
      type: "badge",
      text: badgeTitle,
      date: Date.now(),
    };

    userToNotify.notifications.unshift(notification);
    await userToNotify.save();

    await setNotificationsToUnread(userToNotifyId);
  } catch (error) {
    console.error(error);
  }
};
