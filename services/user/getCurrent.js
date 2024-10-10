const { prisma } = require("../../prisma/prisma-client");

const getCurrent = async (req, res) => {
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
};

module.exports = getCurrent;
