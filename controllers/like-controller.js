const { prisma } = require("../prisma/prisma-client");

const LikeController = {
	like: async (req, res) => {
		const { postId } = req.body;
		const userId = req.user.userId;

		if (!postId) {
			return res.status(400).json({ error: "field postId is required" });
		}

		try {
			const post = await prisma.post.findUnique({
				where: {
					id: postId,
				},
			});

			if (!post) {
				return res.status(404).json({ error: "Post not found" });
			}

			const existingLike = await prisma.like.findFirst({
				where: {
					postId,
					userId,
				},
			});

			if (existingLike) {
				return res.status(400).json({ error: "You already liked this post" });
			}

			const like = await prisma.like.create({
				data: {
					postId,
					userId,
				},
			});

			res.json(like);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	unlike: async (req, res) => {
		const { id } = req.params; // айди поста в бд
		const userId = req.user.userId;

		if (!id) {
			return res.status(400).json({ error: "Cannot unlike unliked post" });
		}

		try {
			const existingLike = await prisma.like.findFirst({
				where: {
					postId: id,
					userId,
				},
			});

			if (!existingLike) {
				return res.status(400).json({ error: "like already deleted" });
			}

			const like = await prisma.like.deleteMany({
				where: {
					postId: id,
					userId,
				},
			});

			res.json(like);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "Internal server error" });
		}
	},
};

module.exports = LikeController;
