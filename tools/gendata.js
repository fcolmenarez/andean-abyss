let data = {}

const IMAP = { G: "Government", F: "FARC", A: "AUC", C: "Cartels" }
let initiative = null
let cards = [ null ]
function def_initiative(s) {
	initiative = [ IMAP[s[0]], IMAP[s[1]], IMAP[s[2]], IMAP[s[3]] ]
}
function def_card(number, name) {
	cards[number] = { number, name, initiative }
}
def_initiative("GFAC")
def_card(1, "1st Division")
def_card(2, "Ospina & Mora")
def_card(3, "Tapias")
def_initiative("GFCA")
def_card(4, "Caño Limón - Coveñas")
def_card(5, "Occidental & Ecopetrol")
def_card(6, "Oil Spill")
def_initiative("GAFC")
def_card(7, "7th Special Forces")
def_card(8, "Fuerza Aérea Colombiana")
def_card(9, "High Mountain Battalions")
def_initiative("GACF")
def_card(10, "Blackhawks")
def_card(11, "National Defense & Security Council")
def_card(12, "Plan Colombia")
def_initiative("GCFA")
def_card(13, "Plan Meteoro")
def_card(14, "Tres Esquinas")
def_card(15, "War Tax")
def_initiative("GCAF")
def_card(16, "Coffee Prices")
def_card(17, "Madrid Donors")
def_card(18, "NSPD-18")
def_initiative("FGAC")
def_card(19, "General Offensive")
def_card(20, "Mono Jojoy")
def_card(21, "Raúl Reyes")
def_initiative("FGCA")
def_card(22, "Alfonso Cano")
def_card(23, "DoD Contractors")
def_card(24, "Operación Jaque")
def_initiative("FAGC")
def_card(25, "Ejército de Liberación Nacional")
def_card(26, "Gramaje")
def_card(27, "Misil Antiaéreo")
def_initiative("FACG")
def_card(28, "Hugo Chávez")
def_card(29, "Kill Zone")
def_card(30, "Peace Commission")
def_initiative("FCGA")
def_card(31, "Betancourt")
def_card(32, "Secuestrados")
def_card(33, "Sucumbíos")
def_initiative("FCAG")
def_card(34, "Airdropped AKs")
def_card(35, "Crop Substitution")
def_card(36, "Zona de Convivencia")
def_initiative("AGFC")
def_card(37, "Former Military")
def_card(38, "National Coordination Center")
def_card(39, "Soldados campesinos")
def_initiative("AGCF")
def_card(40, "Demobilization")
def_card(41, "Mancuso")
def_card(42, "Senado & Cámara")
def_initiative("AFGC")
def_card(43, "Calima Front")
def_card(44, "Colombia Nueva")
def_card(45, "Los Derechos Humanos")
def_initiative("AFCG")
def_card(46, "Limpieza")
def_card(47, "Pinto & del Rosario")
def_card(48, "Unión Sindical Obrera")
def_initiative("ACGF")
def_card(49, "Bloques")
def_card(50, "Carabineros")
def_card(51, "Pipeline Repairs")
def_initiative("ACFG")
def_card(52, "Castaño")
def_card(53, "Criminal Air Force")
def_card(54, "Deserters & Defectors")
def_initiative("CGFA")
def_card(55, "DEA Agents")
def_card(56, "Drogas La Rebaja")
def_card(57, "Op Millennium")
def_initiative("CGAF")
def_card(58, "General Serrano")
def_card(59, "Salcedo")
def_card(60, "The Chess Player")
def_initiative("CFGA")
def_card(61, "Air Bridge")
def_card(62, "Amazonía")
def_card(63, "Narco-War")
def_initiative("CFAG")
def_card(64, "Cocaine Labs")
def_card(65, "Poppies")
def_card(66, "Tingo María")
def_initiative("CAGF")
def_card(67, "Mexican Traffickers")
def_card(68, "Narco-Subs")
def_card(69, "Riverines & Fast Boats")
def_initiative("CAFG")
def_card(70, "Ayahuasca Tourism")
def_card(71, "Darién")
def_card(72, "Sicarios")
initiative = null
def_card(73, "Propaganda!")
def_card(74, "Propaganda!")
def_card(75, "Propaganda!")
def_card(76, "Propaganda!")

console.log("const cards = {")
for (let c of cards) console.log(JSON.stringify(c) + ",")
console.log("}")

let spaces = [ ]
let space_names = [ ]

function add(list, item) {
	if (!list.includes(item))
		list.push(item)
}

function def_space(type, pop, name) {
	spaces.push({ type, name, pop, adjacent: [] })
	space_names.push(name)
}

function def_town(name) {
	spaces.push({ type: "town", name, adjacent: [] })
	space_names.push(name)
}

function def_loc(type, econ, cities, depts) {
	let name = cities.join(" / ")
	let loc_names = cities.concat(depts)
	let loc_spaces = loc_names.map(n => space_names.indexOf(n))
	let ix = spaces.length
	spaces.push({ type, name, econ, adjacent: loc_spaces.filter(x=>x>0) })
	for (let loc of loc_spaces)
		if (loc >= 0)
			add(spaces[loc].adjacent, ix)
	space_names.push(name)
	return ix
}

function adjacent(an, bn) {
	ax = space_names.indexOf(an)
	bx = space_names.indexOf(bn)
	add(spaces[ax].adjacent, bx)
	add(spaces[bx].adjacent, ax)
}

// Cities
data.first_pop = 1
data.first_city = spaces.length

def_space("city", 8, "Bogotá")
def_space("city", 3, "Cali")
def_space("city", 2, "Bucaramanga")
def_space("city", 2, "Ibagué")
def_space("city", 2, "Santa Marta")
def_space("city", 1, "Cartagena")
def_space("city", 1, "Cúcuta")
def_space("city", 1, "Medellín")
def_space("city", 1, "Neiva")
def_space("city", 1, "Pasto")
def_space("city", 1, "Sincelejo")

data.last_city = spaces.length-1

data.first_dept = spaces.length

// Departments
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

data.first_foreign = spaces.length

// Foreign Countries
def_space("foreign", 0, "Brasil")
def_space("foreign", 0, "Ecuador")
def_space("foreign", 0, "Panamá")
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

def_loc("pipeline", 2, [ "Bucaramanga", "Ibagué", "Bogotá" ], [ "Antioquia", "Santa", "Huila" ])
def_loc("pipeline", 2, [ "Bogotá", "Neiva" ], [ "Huila", "Meta West" ])
def_loc("pipeline", 3, [ "Cúcuta", "Arauca" ], [ "Venezuela", "Arauca", "Santaner" ])
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

data.coastal_spaces = [ "Cesar", "Atlántico", "Chocó", "Nariño" ].map(n=>space_names.indexOf(n)).sort((a,b)=>a-b)

for (let i = 1; i < spaces.length; ++i)
	spaces[i].adjacent.sort((a,b)=>a-b)

console.log("const spaces = [")
for (let x of spaces) console.log(JSON.stringify(x) + ",")
console.log("]")

for (let k in data)
	console.log("const", k, "=", JSON.stringify(data[k]))
