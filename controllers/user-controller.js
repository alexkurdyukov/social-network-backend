const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { prisma } = require("../prisma/prisma-client");
const Jdenticon = require("jdenticon");
const jwt = require("jsonwebtoken");

const UserController = {
	register: async (req, res) => {
		const { email, password, name } = req.body;

		if (!email || !password || !name) {
			return res.status(400).json({ error: "Все поля обязательны" });
		}

		try {
			const existedUser = await prisma.user.findUnique({ where: { email } });
			if (existedUser) {
				return res.status(400).json({
					error: "Пользователь уже существует",
				});
			}

			// захэшировали пароль
			const hashedPassword = await bcrypt.hash(password, 10);

			// генерируем дефолтную картинку
			const png = Jdenticon.toPng(name, 200);
			const avatarName = `${name}_${Date.now()}.png`;
			const avatarPath = path.join(__dirname, "/../uploads", avatarName);
			fs.writeFileSync(avatarPath, png);

			const user = await prisma.user.create({
				data: {
					email: email,
					password: hashedPassword,
					name: name,
					avatarUrl: `/uploads/${avatarPath}`,
				},
			});

			res.json(user);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	login: async (req, res) => {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				error: "Поля пароль и email обязательные",
			});
		}
		try {
			const user = await prisma.user.findUnique({
				where: {
					email: email,
				},
			});

			if (!user) {
				return res.status(400).json({
					error: "Пользователя с таким email не существует",
				});
			}

			const isValidPassword = await bcrypt.compare(password, user.password);
			if (!isValidPassword) {
				return res.status(400).json({ error: "Неверный логин или пароль" });
			}

			// подписываем пользователя на подписку на jwt токен
			const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

			res.json({ token: token });
		} catch (e) {
			console.error(e);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	getUserById: async (req, res) => {
		const { id } = req.params;

		const userId = req.user.userId;

		try {
			const user = await prisma.user.findUnique({
				where: { id },
				include: {
					followers: true,
					following: true,
				},
			});

			if (!user) {
				return res.status(404).json({ error: "Пользователь не найден" });
			}

			/**  Так как запрос будет слаться со стороны авторизованного пользователя
			то получая в authMiddleware айди пользователя, мы можем узнать
			подписал ли тот, кто авторизован на пользователя с id, которое
			получаем из квери */

			const isFollowing = await prisma.follows.findFirst({
				where: {
					AND: [{ followerId: userId }, { followingId: id }],
				},
			});

			res.json({ ...user, isFollowing: Boolean(isFollowing) });
		} catch (e) {
			return res.status(500).json({ error: "Internal server error" });
		}
	},

	updateUser: async (req, res) => {
		const { id } = req.params;
		const { email, name, dateOfBirth, bio, location } = req.body;

		let filePath;
		if (req.file && req.file.path) {
			filePath = req.file.path;
		}

		if (id !== req.user.userId) {
			return res.status(403).json({
				error: "You have not enought permissions to update another user",
			});
		}

		try {
			if (email) {
				const existedUser = await prisma.user.findFirst({
					where: { email: email },
				});

				if (existedUser && existedUser.id !== id) {
					return res
						.status(400)
						.json({ error: "User with this email is exist" });
				}
			}

			const user = await prisma.user.update({
				where: { id },
				data: {
					email: email || undefined,
					name: name || undefined,
					avatarUrl: filePath ? `/${filePath}` : undefined,
					dateOfBirth: dateOfBirth || undefined,
					bio: bio || undefined,
					location: location || undefined,
				},
			});

			res.json(user);
		} catch (e) {
			console.error(e);
			res.status(500).json({ error: "Internal Server Error" });
		}
	},

	current: async (req, res) => {
		/** На основе token получаем user */
		try {
			const user = await prisma.user.findUnique({
				where: { id: req.user.userId },
				include: {
					followers: {
						include: {
							follower: true,
						},
					},
					following: {
						include: {
							following: true,
						},
					},
				},
			});

			if (!user) {
				return res.status(400).json({ error: "User not found" });
			}

			res.json(user);
		} catch (e) {
			console.log(e);
			res.status(500).json({ error: "Internal Server Error" });
		}
	},
};

module.exports = UserController;
