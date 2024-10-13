const UserController = require("./user-controller").default;
const PostController = require("./post-controller").default;
const CommentController = require("./comment-controller").default;
const FollowController = require("./follow-controller").default;

module.exports = {
	UserController,
	PostController,
	CommentController,
	LikeController,
	FollowController,
};
