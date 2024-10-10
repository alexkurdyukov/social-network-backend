const bcrypt = require("bcryptjs");
const { prisma } = require("../prisma/prisma-client");
const jwt = require("jsonwebtoken");

const loginUser = async (email, password) => {
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
};

module.exports = loginUser;
