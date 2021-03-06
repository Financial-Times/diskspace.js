[![build status](https://secure.travis-ci.org/keverw/diskspace.js.png)](http://travis-ci.org/keverw/diskspace.js)
# diskspace.js #
This is a simple module for Node.js to check disk space usages in bytes.

This also depends on a console application for Windows called [DriveSpace](https://github.com/keverw/drivespace) written in C# and requires .NET Framework 3.5 when using this on a Windows system. This included in the NPM package, but you can look at the DriveSpace code also if you wish.

## Setup ##

To set up diskspace.js on your Node.js server use npm.

    npm install diskspace

## Example Usage ##
```
var diskspace = require('diskspace');
diskspace.check('C', function (err, result)
{
	console.log("Bytes free: ", result.free, " out of ", result.total);
});
```
On Windows you change C to the drive letter you want to check. On Linux you use the mount path eg `/`.

* `total` is how much the drive has totally.
* `free` is how much free space you have.
* `status` (optional) isn't really that useful unless you want to debug.

##Other Notes##
This will fail on hard drives bigger than 9 petabytes. Thanks [@SteveStreza](https://twitter.com/#!/SteveStreza) [[1]](https://twitter.com/#!/SteveStreza/status/197939419842482176) [[2]](https://twitter.com/#!/SteveStreza/status/197939715993907200)
