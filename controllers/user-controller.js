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
		} catch (e) {}
	},

	getUserById: async (req, res) => {
		res.send("getUserBy");
	},
	updateUser: async (req, res) => {
		res.send("updateUser");
	},
	current: async (req, res) => {
		res.send("current");
	},
};

module.exports = UserController;
