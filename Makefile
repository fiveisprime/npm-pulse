SRC = server.js

lint: $(SRC)
	@node node_modules/.bin/jshint $^ \
	--verbose
