const { prisma } = require("../prisma/prisma-client");

const PostController = {
	createPost: async (req, res) => {
		const { content } = req.body;

		const authorId = req.user.userId;

		if (!content) {
			return res.status(400).json({ error: "Field content is required" });
		}

		try {
			const post = await prisma.post.create({
				data: {
					content: content,
					authorId: authorId,
				},
			});

			res.json(post);
		} catch (error) {
			console.log(error);

			res.status(500).json({
				error: "Internal server error",
			});
		}
	},

	getAllPosts: async (req, res) => {
		const userId = req.user.userId;

		try {
			const posts = await prisma.post.findMany({
				include: {
					likes: true,
					author: true,
					comments: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			// дополним информацию о постах пользователя информацией о тех, которые он лайкнул
			const postsWithOwnInfo = posts.map((post) => ({
				...post,
				likedByUser: post.likes.some((like) => like.userId === userId),
			}));

			res.json({ postsWithOwnInfo });
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	},

	getPostById: async (req, res) => {
		const { id } = req.params;
		const userId = req.user.userId;

		try {
			const post = await prisma.post.findFirst({
				where: {
					id: id,
				},
				include: {
					comments: {
						include: {
							user: true,
						},
					},
					likes: true,
					author: true,
				},
			});

			if (!post) {
				return res.status(400).json({ error: "Не существует такого поста" });
			}

			// дополнительно проверяю, лайкнул ли пользователь этот пост
			const postWithLikeInfo = {
				...post,
				likedByUser: post.likes.some((like) => like.userId === userId),
			};

			res.json({ postWithLikeInfo });
		} catch (error) {
			console.log(error);
			res.status(500).json("Internal server error");
		}
	},

	deletePost: async (req, res) => {
		const { id } = req.params;
		const userId = req.user.userId;

		try {
			const post = await prisma.post.findUnique({ where: { id } });

			if (!post) {
				return res.status(400).json({ error: "Post doesn't exist" });
			}
			
			if (post.authorId !== userId) {
				return res.status(403).json({
					error: "You do not have enought permissions to delete this post",
				});
			}

			const transaction = await prisma.$transaction([
				prisma.comment.deleteMany({ where: { postId: id } }),
				prisma.like.deleteMany({ where: { postId: id } }),
				prisma.post.delete({ where: { id } }),
			]);

			res.json(transaction);
		} catch (error) {
			console.log(error);
			res.status(500).json({
				error: "Internal Server Error",
			});
		}
	},
};

module.exports = PostController;
