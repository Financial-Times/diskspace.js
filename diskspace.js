'use strict';
var os = require('os');
var child_process = require('child_process');

function check(drive, options, callback) {
	if (callback === undefined) {
		callback = options;
		options = {}
	}

	function fail(msg, statusCode) {
		var err = new Error(msg);
		err.statusCode = statusCode;
		return err;
	}

	if (!drive) return callback(fail('Drive argument is required', 'NOTFOUND'));

	var exec = options.exec || child_process.exec.bind(child_process);
	if (os.type() == 'Windows_NT') {
		var drivespacePath = options.drivespacePath || __dirname + '\\drivespace.exe';
		exec('"' + drivespacePath + '" drive-' + drive, function(error, stdout, stderr) {
			if (error) return callback(fail(stderr, error));

			var disk_info = stdout.split(',');

			callback(null, {
				total: disk_info[0],
				free: disk_info[1],
				status: disk_info[2],
			});
		});
	} else {
		exec("df -k '" + drive.replace(/'/g,"'\\''") + "'", function(error, stdout, stderr) {
			if (error) return callback(fail(stderr, error));

			var lines = stdout.trim().split("\n");
			var disk_info = lines[lines.length - 1].split(/[\s\n\r]+/);

			callback(null, {
				total: disk_info[1] * 1024,
				free: disk_info[3] * 1024,
			});
		});
	}
}

// Export public API
module.exports = {
	check: check,
};
