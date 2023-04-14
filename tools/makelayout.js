const DEPTS = [
	"Atlantico",
	"Choco",
	"Narino",
	"Meta West",
	"Guaviare",
	"Putumayo",
	"Cesar",
	"Antioquia",
	"Santander",
	"Huila",
	"Arauca",
	"Meta East",
	"Vichada",
	"Guainia",
	"Vaupes",
	"Amazonas",
	"Ecuador",
	"Panama",
]

const LOCS = [
	"Sincelejo / Ayacucho",
	"Bucaramanga / Ayacucho",
	"Cucuta / Ayacucho",
	"Santa Marta / Ayacucho",
	"Bogota / Yopal",
	"Bogota / Neiva",
	"Bogota / San Jose",
	"Bucaramanga / Ibague / Bogota",
	"Cucuta / Arauca",
	"Neiva / Pasto",
	"Pasto / Tumaco",
	"Cali / Pasto",
	"Cali / Buenaventura",
	"Ibague / Cali",
	"Medellin / Ibague",
	"Cartagena / Sincelejo",
	"Sincelejo / Medellin",
	"Santa Marta / Cartagena",
]

const print = console.log

print('<?xml version="1.0" encoding="UTF-8"?>')
print('<svg')
print('\txmlns="http://www.w3.org/2000/svg"')
print('\txmlns:xlink="http://www.w3.org/1999/xlink"')
print('\txmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"')
print('\txmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"')
print('\twidth="1650" height="2550">')
print('<image xlink:href="map75.jpg" x="0" y="0" width="1650" height="2550" image-rendering="pixelated" sodipodi:insensitive="true" />')

const COLORS = {
	Govt: "cyan",
	AUC: "yellow",
	FARC: "red",
	Cartels: "limegreen",
}

let x = -700, y = 100

function advancex() {
	x += 150
}

function advancey() {
	x -= 150 * 4
	y += 100
}

for (let s of DEPTS) {
	// faction holdings - 100x80 ellipse
	print(`<text x="${x-100}" y="${y}" text-anchor="end" font-size="40">${s}</text>`)
	for (let f of [ "Govt", "AUC", "Cartels", "FARC" ]) {
		print(`<ellipse inkscape:label="${s} ${f}" cx="${x}" cy="${y}" rx="50" ry="40" fill="${COLORS[f]}" fill-opacity="0.5" />`)
		advancex()
	}
	// shipment holding box - 92x56 rect
	print(`<rect inkscape:label="${s} DRUGS" x="${x-50}" y="${y-40}" width="92" height="56" fill="white" fill-opacity="0.5" stroke="black" />`)
	advancey()
}

x = 1700
y = 100

for (let s of LOCS) {
	print(`<text x="${x+100}" y="${y+10}" font-size="40">${s}</text>`)
	print(`<circle inkscape:label="${s} COIN" cx="${x}" cy="${y}" r="15" fill="cyan" fill-opacity="0.5" stroke="black" />`)
	print(`<circle inkscape:label="${s} INSURGENTS" cx="${x+50}" cy="${y}" r="15" fill="red" fill-opacity="0.5" stroke="black" />`)
	y += 100
}

print('</svg>')
