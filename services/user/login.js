const bcrypt = require("bcryptjs");
const { prisma } = require("../../prisma/prisma-client");
const jwt = require("jsonwebtoken");

/** Сервис, содержащий бизнес логику входа в учетную запись*/
const login = async (req, res) => {
	const { email, password } = req.body;

	// Проверка на отсутствие email или пароля
	if (!email || !password) {
		return res.status(400).json({
			error: "Поля пароль и email обязательные",
		});
	}

	try {
		// ищем пользователя с таким email в бд
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});

		// нет пользователя(он еще не регистрировался)
		if (!user) {
			return res.status(400).json({
				error: "Пользователя с таким email не существует",
			});
		}

		// Обрабатываем пароль - сравниваем то что прислали в бади и то что мы нашли в бд
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

module.exports = login;
