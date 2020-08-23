module.exports = function(app) {
	const populateUser = require('../middleware/populate-user');
	const { onlyAuthenticated, onlyEditor } = require('../middleware/auth-check');
	const { createComment, updateComment, deleteComment } = require('../controllers/comments');
	
	app.post('/api/posts/:postId/comments', populateUser, onlyAuthenticated, createComment);
	app.patch('/api/posts/:postId/comments/:commentId', populateUser, onlyEditor, updateComment);
	app.delete('/api/posts/:postId/comments/:commentId', populateUser, onlyEditor, deleteComment);
};
