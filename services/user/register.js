const Jdenticon = require("jdenticon");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { prisma } = require("../../prisma/prisma-client");

/** Сервис, содержащий бизнес логику регистрации пользователя(добавление в бд новой учетной записи) */
const register = async (req, res) => {
	const { email, password, name } = req.body;

	if (!email || !password || !name) {
		return res.status(400).json({ error: "All field required" });
	}

	try {
		const existedUser = await prisma.user.findUnique({ where: { email } });
		if (existedUser) {
			return res.status(400).json({
				error: "User already exist",
			});
		}

		// захэшировали пароль
		const hashedPassword = await bcrypt.hash(password, 10);

		// генерируем дефолтную картинку
		const png = Jdenticon.toPng(name, 200);
		const avatarName = `${name}_${Date.now()}.png`;
		const avatarPath = path.join(__dirname, "../../uploads", avatarName);
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
};

module.exports = register;
