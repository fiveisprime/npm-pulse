SRC = $(wildcard lib/*.js) site/public/js/npm-pulse.js site/app.js

lint: $(SRC)
	@node_modules/.bin/jshint $^ \
	--verbose \
	--show-non-errors
