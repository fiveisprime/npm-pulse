SRC = $(wildcard controllers/*.js) $(wildcard site/api/controllers/*.js) \
	site/app.js

lint: $(SRC)
	@node_modules/.bin/jshint $^ \
	--verbose \
	--show-non-errors
