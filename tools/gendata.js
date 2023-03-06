let fs = require("fs")

let data = {}

const GOVT = 0
const FARC = 1
const AUC = 2
const CARTELS = 3

const BASE = 0
const GUERRILLA = 1
const TROOPS = 2
const POLICE = 3

function to_ascii(s) {
	return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

const IMAP = { G: GOVT, F: FARC, A: AUC, C: CARTELS }
let order = null
let card_name = [ null ]
let card_order = [ null ]
function def_order(s) {
	order = [ IMAP[s[0]], IMAP[s[1]], IMAP[s[2]], IMAP[s[3]] ]
}
function def_card(number, name) {
	card_name[number] = name
	card_order[number] = order
}
def_order("GFAC")
def_card(1, "1st Division")
def_card(2, "Ospina & Mora")
def_card(3, "Tapias")
def_order("GFCA")
def_card(4, "Caño Limón - Coveñas")
def_card(5, "Occidental & Ecopetrol")
def_card(6, "Oil Spill")
def_order("GAFC")
def_card(7, "7th Special Forces")
def_card(8, "Fuerza Aérea Colombiana")
def_card(9, "High Mountain Battalions")
def_order("GACF")
def_card(10, "Blackhawks")
def_card(11, "National Defense & Security Council")
def_card(12, "Plan Colombia")
def_order("GCFA")
def_card(13, "Plan Meteoro")
def_card(14, "Tres Esquinas")
def_card(15, "War Tax")
def_order("GCAF")
def_card(16, "Coffee Prices")
def_card(17, "Madrid Donors")
def_card(18, "NSPD-18")
def_order("FGAC")
def_card(19, "General Offensive")
def_card(20, "Mono Jojoy")
def_card(21, "Raúl Reyes")
def_order("FGCA")
def_card(22, "Alfonso Cano")
def_card(23, "DoD Contractors")
def_card(24, "Operación Jaque")
def_order("FAGC")
def_card(25, "Ejército de Liberación Nacional")
def_card(26, "Gramaje")
def_card(27, "Misil Antiaéreo")
def_order("FACG")
def_card(28, "Hugo Chávez")
def_card(29, "Kill Zone")
def_card(30, "Peace Commission")
def_order("FCGA")
def_card(31, "Betancourt")
def_card(32, "Secuestrados")
def_card(33, "Sucumbíos")
def_order("FCAG")
def_card(34, "Airdropped AKs")
def_card(35, "Crop Substitution")
def_card(36, "Zona de Convivencia")
def_order("AGFC")
def_card(37, "Former Military")
def_card(38, "National Coordination Center")
def_card(39, "Soldados Campesinos")
def_order("AGCF")
def_card(40, "Demobilization")
def_card(41, "Mancuso")
def_card(42, "Senado & Cámara")
def_order("AFGC")
def_card(43, "Calima Front")
def_card(44, "Colombia Nueva")
def_card(45, "Los Derechos Humanos")
def_order("AFCG")
def_card(46, "Limpieza")
def_card(47, "Pinto & del Rosario")
def_card(48, "Unión Sindical Obrera")
def_order("ACGF")
def_card(49, "Bloques")
def_card(50, "Carabineros")
def_card(51, "Pipeline Repairs")
def_order("ACFG")
def_card(52, "Castaño")
def_card(53, "Criminal Air Force")
def_card(54, "Deserters & Defectors")
def_order("CGFA")
def_card(55, "DEA Agents")
def_card(56, "Drogas La Rebaja")
def_card(57, "Op Millennium")
def_order("CGAF")
def_card(58, "General Serrano")
def_card(59, "Salcedo")
def_card(60, "The Chess Player")
def_order("CFGA")
def_card(61, "Air Bridge")
def_card(62, "Amazonía")
def_card(63, "Narco-War")
def_order("CFAG")
def_card(64, "Cocaine Labs")
def_card(65, "Poppies")
def_card(66, "Tingo María")
def_order("CAGF")
def_card(67, "Mexican Traffickers")
def_card(68, "Narco-Subs")
def_card(69, "Riverines & Fast Boats")
def_order("CAFG")
def_card(70, "Ayahuasca Tourism")
def_card(71, "Darién")
def_card(72, "Sicarios")

def_order("GFAC")
def_card(73, "Propaganda!")
def_card(74, "Propaganda!")
def_card(75, "Propaganda!")
def_card(76, "Propaganda!")

let spaces = [ ]
let space_name = [ ]

function add(list, item) {
	if (!list.includes(item))
		list.push(item)
}

function def_space(type, pop, name) {
	spaces.push({ type, id: to_ascii(name), pop, adjacent: [] })
	space_name.push(name)
}

function def_town(name) {
	spaces.push({ type: "town", id: to_ascii(name), adjacent: [] })
	space_name.push(name)
}

function def_loc(type, econ, cities, depts) {
	let name = cities.join(" / ")
	let loc_names = cities.concat(depts)
	for (let n of loc_names)
		if (space_name.indexOf(n) < 0)
			console.log("not a space: " + n)
	let loc_spaces = loc_names.map(n => space_name.indexOf(n))
	let ix = spaces.length
	spaces.push({ type, id: to_ascii(name), econ, adjacent: loc_spaces.filter(x => x >= 0) })
	for (let loc of loc_spaces)
		if (loc >= 0)
			add(spaces[loc].adjacent, ix)
	space_name.push(name)
	return ix
}

function adjacent(an, bn) {
	ax = space_name.indexOf(an)
	bx = space_name.indexOf(bn)
	add(spaces[ax].adjacent, bx)
	add(spaces[bx].adjacent, ax)
}

// Cities

data.first_space = 0
data.first_pop = 0

data.first_city = spaces.length

def_space("city", 8, "Bogotá")
def_space("city", 3, "Cali")
def_space("city", 3, "Medellín")
def_space("city", 2, "Bucaramanga")
def_space("city", 2, "Ibagué")
def_space("city", 2, "Santa Marta")
def_space("city", 1, "Cartagena")
def_space("city", 1, "Cúcuta")
def_space("city", 1, "Neiva")
def_space("city", 1, "Pasto")
def_space("city", 1, "Sincelejo")

data.last_city = spaces.length-1

// Departments

data.first_dept = spaces.length

def_space("forest", 1, "Atlántico")
def_space("forest", 1, "Chocó")
def_space("forest", 1, "Nariño")
def_space("forest", 1, "Meta West")
def_space("forest", 1, "Guaviare")
def_space("forest", 1, "Putumayo")
def_space("mountain", 1, "Cesar")
def_space("mountain", 2, "Antioquia")
def_space("mountain", 2, "Santander")
def_space("mountain", 2, "Huila")
def_space("grassland", 1, "Arauca")
def_space("grassland", 1, "Meta East")

data.last_pop = spaces.length-1

def_space("grassland", 0, "Vichada")
def_space("forest", 0, "Guainía")
def_space("forest", 0, "Vaupés")
def_space("forest", 0, "Amazonas")

data.last_dept = spaces.length-1

// Foreign Countries

data.first_foreign = spaces.length

def_space("foreign", 0, "Panamá")
def_space("foreign", 0, "Ecuador")
def_space("foreign", 0, "Brasil")
def_space("foreign", 0, "Perú")
def_space("foreign", 0, "Venezuela")

data.last_foreign = spaces.length-1

// LoC

data.first_loc = spaces.length

def_loc("road", 1, [ "Santa Marta", "Cartagena"], [ "Atlántico" ])
def_loc("road", 1, [ "Cali", "Pasto"], [ "Nariño", "Huila" ])
def_loc("road", 1, [ "Neiva", "Pasto"], [ "Huila", "Putumayo" ])
def_loc("road", 1, [ "Bogotá", "San José" ], [ "Meta East", "Meta West", "Guaviare" ])

def_loc("road", 1, [ "Pasto", "Tumaco" ], [ "Nariño", "Ecuador" ])
def_loc("pipeline", 1, [ "Cali", "Buenaventura" ], [ "Chocó", "Nariño" ])

def_loc("pipeline", 1, [ "Cartagena", "Sincelejo"], [ "Atlántico" ])
def_loc("pipeline", 2, [ "Sincelejo", "Medellín"], [ "Chocó", "Antioquia" ])
def_loc("pipeline", 1, [ "Medellín", "Ibagué"], [ "Chocó", "Antioquia" ])
def_loc("pipeline", 1, [ "Ibagué", "Cali"], [ "Chocó", "Huila" ])

def_loc("pipeline", 2, [ "Bucaramanga", "Ibagué", "Bogotá" ], [ "Antioquia", "Santander", "Huila" ])
def_loc("pipeline", 2, [ "Bogotá", "Neiva" ], [ "Huila", "Meta West" ])
def_loc("pipeline", 3, [ "Cúcuta", "Arauca" ], [ "Venezuela", "Arauca", "Santander" ])
def_loc("pipeline", 2, [ "Bogotá", "Yopal" ], [ "Santander", "Arauca", "Meta East"])

let ayacucho = [
	def_loc("pipeline", 2, [ "Santa Marta", "Ayacucho" ], [ "Cesar", "Santander", "Antioquia", "Atlántico" ]),
	def_loc("pipeline", 2, [ "Bucaramanga", "Ayacucho" ], [ "Antioquia", "Atlántico", "Cesar", "Santander" ]),
	def_loc("pipeline", 3, [ "Sincelejo", "Ayacucho" ], [ "Atlántico", "Cesar", "Santander", "Antioquia" ]),
	def_loc("pipeline", 3, [ "Cúcuta", "Ayacucho" ], [ "Santander", "Antioquia", "Atlántico", "Cesar", "Venezuela" ]),
]

for (let a of ayacucho) {
	for (let b of ayacucho)
		if (a !== b)
			add(spaces[a].adjacent, b)
}

data.last_loc = spaces.length-1

data.last_space = spaces.length-1

// City in Dept

adjacent("Santa Marta", "Cesar")
adjacent("Santa Marta", "Atlántico")
adjacent("Cartagena", "Atlántico")
adjacent("Sincelejo", "Atlántico")
adjacent("Sincelejo", "Antioquia")
adjacent("Sincelejo", "Chocó")
adjacent("Medellín", "Chocó")
adjacent("Medellín", "Antioquia")
adjacent("Ibagué", "Chocó")
adjacent("Ibagué", "Antioquia")
adjacent("Ibagué", "Huila")
adjacent("Cali", "Chocó")
adjacent("Cali", "Huila")
adjacent("Cali", "Nariño")
adjacent("Pasto", "Nariño")
adjacent("Pasto", "Huila")
adjacent("Pasto", "Putumayo")
adjacent("Pasto", "Ecuador")
adjacent("Cúcuta", "Venezuela")
adjacent("Cúcuta", "Santander")
adjacent("Bucaramanga", "Antioquia")
adjacent("Bucaramanga", "Santander")
adjacent("Bogotá", "Santander")
adjacent("Bogotá", "Meta East")
adjacent("Bogotá", "Meta West")
adjacent("Bogotá", "Huila")
adjacent("Neiva", "Huila")
adjacent("Neiva", "Meta West")
adjacent("Neiva", "Putumayo")

// Foreign - Dept

adjacent("Panamá", "Chocó")

adjacent("Venezuela", "Cesar")
adjacent("Venezuela", "Santander")
adjacent("Venezuela", "Arauca")
adjacent("Venezuela", "Vichada")
adjacent("Venezuela", "Guainía")

adjacent("Brasil", "Guainía")
adjacent("Brasil", "Vaupés")
adjacent("Brasil", "Amazonas")

adjacent("Ecuador", "Nariño")
adjacent("Ecuador", "Putumayo")

adjacent("Perú", "Putumayo")
adjacent("Perú", "Amazonas")

// Dept - Dept (with redundancies)

adjacent("Atlántico", "Cesar")
adjacent("Atlántico", "Santander")
adjacent("Atlántico", "Antioquia")

adjacent("Chocó", "Antioquia")
adjacent("Chocó", "Huila")
adjacent("Chocó", "Nariño")

adjacent("Nariño", "Chocó")
adjacent("Nariño", "Huila")

adjacent("Cesar", "Atlántico")
adjacent("Cesar", "Santander")
adjacent("Cesar", "Antioquia")

adjacent("Antioquia", "Atlántico")
adjacent("Antioquia", "Cesar")
adjacent("Antioquia", "Santander")
adjacent("Antioquia", "Huila")
adjacent("Antioquia", "Chocó")

adjacent("Santander", "Cesar")
adjacent("Santander", "Arauca")
adjacent("Santander", "Meta East")
adjacent("Santander", "Huila")
adjacent("Santander", "Antioquia")

adjacent("Huila", "Antioquia")
adjacent("Huila", "Santander")
adjacent("Huila", "Meta West")
adjacent("Huila", "Putumayo")
adjacent("Huila", "Nariño")
adjacent("Huila", "Chocó")

adjacent("Arauca", "Vichada")
adjacent("Arauca", "Meta East")
adjacent("Arauca", "Santander")

adjacent("Vichada", "Arauca")
adjacent("Vichada", "Guainía")
adjacent("Vichada", "Guaviare")
adjacent("Vichada", "Meta East")

adjacent("Meta East", "Arauca")
adjacent("Meta East", "Vichada")
adjacent("Meta East", "Guaviare")
adjacent("Meta East", "Meta West")
adjacent("Meta East", "Santander")

adjacent("Meta West", "Meta East")
adjacent("Meta West", "Guaviare")
adjacent("Meta West", "Putumayo")
adjacent("Meta West", "Huila")

adjacent("Putumayo", "Meta West")
adjacent("Putumayo", "Guaviare")
adjacent("Putumayo", "Vaupés")
adjacent("Putumayo", "Amazonas")
adjacent("Putumayo", "Huila")

adjacent("Guaviare", "Meta East")
adjacent("Guaviare", "Vichada")
adjacent("Guaviare", "Guainía")
adjacent("Guaviare", "Vaupés")
adjacent("Guaviare", "Putumayo")
adjacent("Guaviare", "Meta West")

adjacent("Guainía", "Vichada")
adjacent("Guainía", "Vaupés")
adjacent("Guainía", "Guaviare")

adjacent("Vaupés", "Guainía")
adjacent("Vaupés", "Amazonas")
adjacent("Vaupés", "Putumayo")
adjacent("Vaupés", "Guaviare")

adjacent("Amazonas", "Vaupés")
adjacent("Amazonas", "Putumayo")

data.coastal_spaces = [ "Cesar", "Atlántico", "Chocó", "Nariño" ].map(n=>space_name.indexOf(n)).sort((a,b)=>a-b)

for (let i = 0; i < spaces.length; ++i) {
	spaces[i].adjacent.sort((a,b)=>a-b)
}

data.card_name = card_name
data.card_order = card_order
data.space_name = space_name
data.spaces = spaces

data.adjacent_patrol = []
for (let s = 0; s < spaces.length; ++s) {
	let ap = data.adjacent_patrol[s] = []
	for (let next of spaces[s].adjacent)
		if ((next <= data.last_city) || (next >= data.first_loc && next <= data.last_loc))
			ap.push(next)
}

let pc_index = 0
let pc_first = data.first_piece = [ [ 0, 0, 0, 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ] ]
let pc_last = data.last_piece = [ [ -1, -1, -1, -1, -1 ], [ -1, -1 ], [ -1, -1 ], [ -1, -1 ] ]
function def_piece(faction, type, count) {
	pc_first[faction][type] = pc_index
	pc_last[faction][type] = pc_index + count - 1
	pc_index += count
}
def_piece(GOVT, BASE, 3)
def_piece(GOVT, GUERRILLA, 0)
def_piece(GOVT, TROOPS, 30)
def_piece(GOVT, POLICE, 30)
def_piece(FARC, BASE, 9)
def_piece(FARC, GUERRILLA, 30)
def_piece(AUC, BASE, 6)
def_piece(AUC, GUERRILLA, 18)
def_piece(CARTELS, BASE, 15)
def_piece(CARTELS, GUERRILLA, 12)

fs.writeFileSync("data.js", "const data = " + JSON.stringify(data, 0, 0) + "\nif (typeof module !== 'undefined') module.exports = data\n")
