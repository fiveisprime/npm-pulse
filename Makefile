SRC = $(wildcard controllers/*.js) $(wildcard api/api/**/*.js) api/app.js

lint: $(SRC)
	@node node_modules/.bin/jshint $^ \
	--verbose \
	--show-non-errors
