const { prisma } = require("../../prisma/prisma-client");

const getById = async (req, res) => {
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
};

module.exports = getById;
