const { prisma } = require("../prisma/prisma-client");

const FollowController = {
	follow: async (req, res) => {
		const { followingId } = req.body; // достаем id пользователя, на которого хотим подписаться
		const userId = req.user.userId; // достаем userId - айди пользователя, который хочет подписаться

		if (followingId === userId) {
			return res
				.status(400)
				.json({ error: "You cannot subscribe on yourself" });
		}

		try {
			const existingSubscription = await prisma.follows.findFirst({
				where: {
					followerId: userId,
					followingId,
				},
			});

			if (existingSubscription) {
				return res.status(400).json({ error: "You already follows this user" });
			}

			await prisma.follows.create({
				data: {
					follower: { connect: { id: userId } },
					following: { connect: { id: followingId } },
				},
			});
		} catch (e) {
			console.log(e);
			res.status(500).json({ error: "Internal server error" });
		}
	},
	unfollow: async (req, res) => {
		const { followingId } = req.params;
		const userId = req.user.userId;
		try {
			const follow = await prisma.follows.findFirst({
				where: {
					AND: [{ followerId: userId }, { followingId: followingId }],
				},
			});

			if (!follow) {
				return res
					.status(400)
					.json({ error: "You try to delete unexisted subscribe" });
			}

			await prisma.follows.delete({
				where: { id: follow.id },
			});

			res.status(200).json({ msg: "Follow succesfully deleted" });
		} catch (e) {
			console.log(e);
			res.status(500).json({ error: "Internal server error" });
		}
	},
};

module.exports = FollowController;
