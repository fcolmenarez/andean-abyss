default: data.js rules.js play.js
data.js: tools/gendata.js
	node tools/gendata.js
rules.js: events.txt
	sed '/const CODE /,$$d' < rules.js > /tmp/rules.js
	node tools/gencode.js >> /tmp/rules.js
	cp /tmp/rules.js rules.js
play.js: tools/layout.svg tools/genlayout.py
	sed -n -e '1,/BEGIN LAYOUT DATA/p' < play.js > /tmp/play.js
	python3 tools/genlayout.py >> /tmp/play.js
	sed -n -e '/END LAYOUT DATA/,$$p' < play.js >> /tmp/play.js
	cp /tmp/play.js play.js
