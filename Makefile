SRC = $(wildcard **/*.js)

lint: $(SRC)
	@node node_modules/.bin/jshint $^ \
	--verbose
