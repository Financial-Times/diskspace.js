'use strict';
var os = require('os');
var child_process = require('child_process');

function check(drive, callback) {
	function fail(msg, statusCode) {
		var err = new Error(msg);
		err.statusCode = statusCode;
		return err;
	}

	if (!drive) return callback(fail('Drive argument is required', 'NOTFOUND'));

	if (os.type() == 'Windows_NT') {
		child_process.exec('"' + __dirname + '\\drivespace.exe" drive-' + drive, function(error, stdout, stderr) {
			if (error) return callback(fail(stderr, error));

			var disk_info = stdout.split(',');

			callback(null, {
				total: disk_info[0],
				free: disk_info[1],
				status: disk_info[2],
			});
		});
	} else {
		child_process.exec("df -k '" + drive.replace(/'/g,"'\\''") + "'", function(error, stdout, stderr) {
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
