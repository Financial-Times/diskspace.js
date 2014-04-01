'use strict';
var diskspace = require('./diskspace.js'); //use just diskspace if installed via NPM
var assert = require('assert');

diskspace.check('/', {inodes:true, exec:function(cmd,cb){
	cb(null,
	"Filesystem     1k-blocks      Used Available Capacity  iused    ifree %iused  Mounted on\n"+
	"/dev/disk1     234643592 137112448  97019144    59% 17203054 12127393   59%   /\n"
	);
}}, function(err, res){
	assert.equal(res.used, 137112448*1024);
	assert.equal(res.free, 97019144*1024);
	assert.equal(res.total, 234643592*1024);
	assert.equal(res.iused, 17203054);
	assert.equal(res.ifree, 12127393);
});

diskspace.check('/', {inodes:true, exec:function(cmd,cb){
	cb(null,
	"Filesystem            Inodes   IUsed   IFree IUse% Mounted on\n"+
	"/dev/vdb             16777216 2679222 14097994   16% /slowdisk\n"
	);
}}, function(err, res){
	assert.equal(res.iused, 2679222);
	assert.equal(res.ifree, 14097994);
	assert.equal(res.itotal, 14097994+2679222);
	assert.ok(res.used === undefined);
});

diskspace.check('/', {inodes:true, exec:function(cmd,cb){
	cb(null,
	"Filesystem            Inodes   IUsed   IFree IUse% Mounted on\n"+
	"/dev/vdc             7077888 2662227 4415661   38% /home\n"+
	"dev02-shell01.example.com:/slowdisk/foo bar\n"+
	"                     16777216 2679222 14097994   16% /opt/foo bar\n"
	);
}}, function(err, res){
	assert.equal(res.iused, 2679222);
	assert.equal(res.ifree, 14097994);
	assert.ok(res.total === undefined);
});

