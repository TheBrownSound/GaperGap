sourceFile = js/src/Main.js
outputDir = js/
name = GaperGapGame

compile:
	fuse -i $(sourceFile) -o $(outputDir)$(name).js
	fuse -i $(sourceFile) -o $(outputDir)$(name).min.js -m -c

watch:
	fuse -i $(sourceFile) -o $(outputDir)$(name).js -w

server:
	python -m SimpleHTTPServer