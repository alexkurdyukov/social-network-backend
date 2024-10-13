const express = require("express");
const router = express.Router();
const multer = require("multer");
const authenticateToken = require("../middleware/auth");
const UserController = require("../controllers/user-controller");
const PostController = require("../controllers/post-controller");
const CommentController = require("../controllers/comment-controller");
const LikeController = require("../controllers/like-controller");
const FollowController = require("../controllers/follow-controller");

const uploadDestination = "uploads";

// создаем хранилище img файлов
const storage = multer.diskStorage({
	destination: uploadDestination,
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

const uploads = multer({ storage: storage });

// роуты для работы с User
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticateToken, UserController.current);
router.get("/users/:id", authenticateToken, UserController.getUserById);
router.put("/users/:id", authenticateToken, UserController.updateUser);

// роуты для работы с Posts
router.post("/posts", authenticateToken, PostController.createPost);
router.get("/posts", authenticateToken, PostController.getAllPosts);
router.get("/posts/:id", authenticateToken, PostController.getPostById);
router.delete("/posts/:id", authenticateToken, PostController.deletePost);

// роуты для работы с комментариями
router.post("/comments", authenticateToken, CommentController.createComment);
router.delete(
	"/comments/:id",
	authenticateToken,
	CommentController.deleteComment
);

// роуты для работы с лайками
router.post("/likes", authenticateToken, LikeController.like);
router.delete("/likes/:id", authenticateToken, LikeController.unlike);

// пруиы для подписок
router.post("/follow", authenticateToken, FollowController.follow);
router.delete("/follow/:id", authenticateToken, FollowController.unfollow);

module.exports = router;
