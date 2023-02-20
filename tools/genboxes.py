mode = None

list = []

x = y = w = h = 0
name = None

def flush():
	global x, y, w, h, name
	if mode == 'rect':
		list.append((x,y,w,h,'box',name))
	if mode == 'circle':
		x = cx - rx
		y = cy - ry
		w = rx * 2
		h = ry * 2
		list.append((x,y,w,h,'circle',name))
	x = y = w = h = 0
	name = None

for line in open("tools/boxes.svg").readlines():
	line = line.strip()
	if line == "<rect":
		flush()
		mode = 'rect'
		x = y = w = h = 0
	elif line == "<ellipse":
		flush()
		mode = 'circle'
		cx = cy = rx = ry = 0
	if line.startswith('x="'): x = round(float(line.split('"')[1]))
	if line.startswith('y="'): y = round(float(line.split('"')[1]))
	if line.startswith('width="'): w = round(float(line.split('"')[1]))
	if line.startswith('height="'): h = round(float(line.split('"')[1]))
	if line.startswith('cx="'): cx = round(float(line.split('"')[1]))
	if line.startswith('cy="'): cy = round(float(line.split('"')[1]))
	if line.startswith('rx="'): rx = round(float(line.split('"')[1]))
	if line.startswith('ry="'): ry = round(float(line.split('"')[1]))
	if line.startswith('inkscape:label="'): name = line.split('"')[1]
flush()

def print_list():
	print("const boxes = {")
	for (x,y,w,h,c,name) in list:
		print(f'"{name}": [{x},{y},{w},{h}],')
	print("}")

def print_list2():
	print("const centers = {")
	for (x,y,w,h,c,name) in list:
		xc = round((x+w/2.0))
		yc = round((y+h/2.0))
		print(f'"{name}": [{xc},{yc}],')
	print("}")

def print_html():
	# print('<html><style>')
	# print('.box{position:absolute;background-color:#f008;border:2px solid blue;}')
	# print('.circle{position:absolute;background-color:#0f08;border-radius:50%;border:2px solid blue;}')
	# print('img{position:absolute;display:block}')
	# print('</style>')
	# print('<div style="position:relative;width:1275px;heigth:1650px;">')
	# print('<img src="map75.png">')
	for (x,y,w,h,c,name) in list:
		x = round(x)
		y = round(y)
		w = round(w)
		h = round(h)
		print(f'<div class="{c}" style="top:{y}px;left:{x}px;width:{w}px;height:{h}px">{name}</div>')
	# print('</div>')

#print_html()
print_list2()
