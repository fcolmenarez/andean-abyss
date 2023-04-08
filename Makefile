default: data.js rules.js
data.js: tools/gendata.js
	node tools/gendata.js
default rules.js: events.txt
	sed '/const CODE /,$$d' < rules.js > /tmp/rules.js
	node tools/gencode.js >> /tmp/rules.js
	cp /tmp/rules.js rules.js
