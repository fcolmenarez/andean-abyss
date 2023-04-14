list = []

def flush():
	global mode, name, x, y, w, h
	if mode == 'rect':
		list.append((name, round(x+w/2), round(y+h/2)))
	if mode == 'circle':
		list.append((name, round(x), round(y)))
	mode = None

def readsvg(filename):
	global mode, name, x, y, w, h
	mode = None
	name = None
	x = y = w = h = 0
	for line in open(filename).readlines():
		line = line.strip()
		if line == "<rect":
			flush()
			mode = 'rect'
			x = y = w = h = 0
			name = None
		elif line == "<ellipse" or line == "<circle":
			flush()
			mode = 'circle'
			x = y = w = h = 0
			name = None
		elif line == "<text":
			flush()
			mode = None
		if line.startswith('x="'): x = round(float(line.split('"')[1]))
		if line.startswith('y="'): y = round(float(line.split('"')[1]))
		if line.startswith('width="'): w = round(float(line.split('"')[1]))
		if line.startswith('height="'): h = round(float(line.split('"')[1]))
		if line.startswith('cx="'): x = round(float(line.split('"')[1]))
		if line.startswith('cy="'): y = round(float(line.split('"')[1]))
		if line.startswith('inkscape:label="'): name = line.split('"')[1]
	flush()

readsvg("tools/boxes.svg")
readsvg("tools/layout.svg")

def print_list():
	print("const LAYOUT = {")
	for (name,x,y) in list:
		xc = round((x+w/2.0))
		yc = round((y+h/2.0))
		print(f'\t"{name}": [{x}, {y}],')
	print("}")

print_list()
