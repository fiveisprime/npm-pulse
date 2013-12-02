SRC = $(wildcard controllers/*.js)

lint: $(SRC)
	@node node_modules/.bin/jshint $^ \
	--verbose \
	--show-non-errors
