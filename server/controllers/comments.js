const validator = require('validator');
const Post = require('../models/post');

function handleCommentContent(req, res) {
	const content = req.body.content;
	if ((!content) || (typeof(content) !== 'string'))
		res.status(400).send('Illegal post comment!');
	else return validator.escape(content);
}

function createComment(req, res, next) {
	const comment = {
		content: handleCommentContent(req, res),
		tenant: req.headers.tenant,
		author: req.user.name,
	};
	
	Post.findByIdAndUpdate(req.params.postId, { $push: { comments: comment } }).
	//Don't include a URI since a comment is not an independent resource
	then(function(document) {
		const comments = document.comments;
		res.status(201).send('Comment created: ' + comments[comments.length-1]._id);
	}).catch(err => next(err));
}

function updateComment(req, res, next) {
	Post.findByIdAndUpdate(req.params.postId, { $set: 
	{ 'comments.$[comm].content': handleCommentContent(req, res) } },
	{ 
		arrayFilters: 
		[{ 'comm._id': req.params.commentId, 'comm.tenant': req.headers.tenant }]
	//How can I know if the document was updated???
	}).then(() => res.sendStatus(204)).catch(err => next(err));
}

function deleteComment(req, res, next) {
	Post.findByIdAndUpdate(req.params.postId, { $pull: { comments: 
	{ _id: req.params.commentId, tenant: req.headers.tenant } } }).
	//How can I know if the document was updated???
	then(() => res.sendStatus(204)).catch(err => next(err));
}

module.exports = { createComment, updateComment, deleteComment };
