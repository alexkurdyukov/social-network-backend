const { prisma } = require("../../prisma/prisma-client");

const update = async (req, res) => {
	const { id } = req.params;
	const { email, name, dateOfBirth, bio, location } = req.body;

	let filePath;
	if (req.file && req.file.path) {
		filePath = req.file.path;
	}

	// если айди, который получили из middleware не совпадает с id из params, то один пользователь пытается обновить поля другого => блочим
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
				return res.status(400).json({ error: "User with this email is exist" });
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
};

module.exports = update;
