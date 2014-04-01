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
		exec("df -k " + (options.inodes ? '-i' : '') + "'" + drive.replace(/'/g,"'\\''") + "'", function(error, stdout, stderr) {
			if (error) return callback(fail(stderr, error));

			// assume default shell tab is 8
			var lines = stdout.replace(/\t/g,'        ').trimRight().split("\n");
			if (lines.length < 2) {
				return callback(fail("Unexpected output: " + stdout, -1));
			}

			// implementations have varying number of columns and columns names/values with spaces
			// also some use right-aligned colums - it's a mess
			var headersLine = lines[0];
			var dataLine = lines[lines.length-1];

			// looks for column name and then for value underneath
			// that overlaps either first or last character of the header name (for left or right alignment)
			function getValue(headersLine, dataLine, columnName) {
				var m = headersLine.match(new RegExp("^(.*?)\\b"+columnName+"\\b","i"));
				if (!m) return undefined;

				var start = m[1].length;
				var end = m[0].length;

				while(start > 0 && dataLine.charAt(start) != ' ') {
					start--;
				}
				while(end < dataLine.length-1 && dataLine.charAt(end) != ' ') {
					end++;
				}

				var value = parseInt(dataLine.substring(start, end), 10);
				if (isNaN(value)) return undefined;
				return value;
			}

			var results = {
				total: getValue(headersLine, dataLine, "1(?:024|K)?-?blocks"),
				used: getValue(headersLine, dataLine, "used"),
				free: getValue(headersLine, dataLine, "avail(?:able)?"),
				ifree: getValue(headersLine, dataLine, "ifree"),
				iused: getValue(headersLine, dataLine, "iused"),
			};

			if (results.total === undefined && results.used !== undefined && results.free !== undefined ) {
				results.total = results.used + results.free;
			}

			if (results.total) results.total *= 1024;
			if (results.used) results.used *= 1024;
			if (results.free) results.free *= 1024;

			if (results.ifree !== undefined && results.iused !== undefined ) {
				results.itotal = results.ifree + results.iused;
			}

			callback(null, results);
		});
	}
}

// Export public API
module.exports = {
	check: check,
};
