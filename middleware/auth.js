const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, callback) => {
	const authHeader = req.headers["authorization"];

	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	// по текущему токену, ищем user-а и всю информацию о нем
	// и передаем дальше в контроллеры на те роуты, где
	// нужна проверка верификации
	jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
		if (err) {
			return res.status(403).json({ error: "Invalid Token" });
		}

		req.user = user;

		callback();
	});
};

module.exports = authenticateToken;
