const express = require("express");
const router = express.Router();
const multer = require("multer");
const UserController = require("../controllers/user-controller");
const uploadDestination = "uploads";
const authenticateToken = require("../middleware/auth");

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

module.exports = router;
