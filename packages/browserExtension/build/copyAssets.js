import copy from "recursive-copy";

var options = {
	overwrite: true
};

copy('./src/assets', './dist', options)