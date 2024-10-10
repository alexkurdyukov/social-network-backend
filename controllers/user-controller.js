const {
	login,
	register,
	getUserById,
	update,
	getCurrent,
} = require("../services/user/index");

const UserController = {
	register: (req, res) => {
		register(req, res);
	},

	login: (req, res) => {
		login(req, res);
	},

	getUserById: (req, res) => {
		getUserById(req, res);
	},

	updateUser: (req, res) => {
		update(req, res);
	},

	current: (req, res) => {
		getCurrent(req, res);
	},
};

module.exports = UserController;
