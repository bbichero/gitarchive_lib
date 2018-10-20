/**
 * @fileoverview Wrapper to execute git command
 *
 * @return { stdout, stderr }
 */

const util = require('util')
const exec = util.promisify(require('child_process').exec)

function Git (repositoryPath)
{
	this.repository = {
		path: repositoryPath
	};

	return this;
}

Git.prototype.init = async function () {
	const command = 'git init .'
	return this._exec(command)
};

Git.prototype.config = async function (key, value) {
	const command = 'git config ' + key + ' "' + value + '"';
	return this._exec(command)
}

Git.prototype.add = async function (fileName) {
	const command = 'git add ' + (!fileName ? '.' : fileName);
	return this._exec(command);
};

Git.prototype.commit = async function (log) {
	var defaultMsg = 'No message specified';

	const command = 'git commit -m "'+ ( log ? log : defaultMsg ) +'"';
	return this._exec(command);
};

Git.prototype.status = function () {
	const command = 'git status';
	return this._exec(command);
};

Git.prototype.headHash = function () {
	const command = 'git rev-parse HEAD';
	return this._exec(command);
};

Git.prototype.raw = function (commitHash, fileName) {
	const command = 'git show ' + commitHash + ':' + fileName;
	return this._exec(command);
};

Git.prototype.diff = function (first_commit, second_commit, fileName) {
	const command = 'git diff -u ' + first_commit + ' ' + second_commit + ' -- ' + fileName;
	return this._exec(command);
};

Git.prototype._exec = async function (command)
{
	const final_command = command.replace(/^git/, 'git --git-dir="'+this.repository.path+'/.git" --work-tree="'+this.repository.path+'"');
	const options = { encoding: 'utf8', /*timeout: timeout, */killSignal: 'SIGKILL'};
	let stdio // { stdout, stderr }

	// TOOD: consider using spawn instead of exec
	// see more at https://medium.freecodecamp.org/node-js-child-processes-everything-you-need-to-know-e69498fe970a
	try { stdio = await exec(final_command, options) }
	catch (e) { stdio = { stdout: e.stdout, stderr: e.stderr, error: e }; }

	return stdio;
};

module.exports = Git;
