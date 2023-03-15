"use strict"

// TODO: Automatic "All done" message. (limited / no more resources / no more available options).
// TODO: auto-next at end of Special Activity / operation space ?
//    rough undo granularity (save only at start of op/activity in space)
// TODO: resume_...activity - end automatically when no more possible

// TODO: for (s = ... last_space) to for_each_space (including/excluding foreign countries depending on events)
// TODO: how granular undo (one at start of each space, each step, or each piece?)

let states = {}
let game = null
let view = null

const data = require("./data.js")

// Role names
const NAME_GOVT = "Government"
const NAME_FARC = "FARC"
const NAME_AUC = "AUC"
const NAME_CARTELS = "Cartels"
const NAME_GOVT_AUC = "Government + AUC"
const NAME_FARC_CARTELS = "FARC + Cartels"
const NAME_AUC_CARTELS = "AUC + Cartels"

const capability_events = [ 1, 2, 3, 7, 9, 10, 11, 13 ]
const momentum_events = [ 12, 17, 22, 27, 42, 67 ]

// TODO: 7th SF - sabotage phase
// TODO: Alfonso Cane - agitation phase
// TODO: Mexican Traffickres - resources phase

const CAP_1ST_DIV = 1
const CAP_OSPINA = 2
const CAP_TAPIAS = 3
const CAP_7TH_SF = 7
const CAP_MTN_BNS = 9
const CAP_BLACK_HAWKS = 10
const CAP_NDSC = 11
const CAP_METEORO = 13

const MOM_PLAN_COLOMBIA = 12
const MOM_MADRID_DONORS = 17
const MOM_ALFONSO_CANO = 22
const MOM_MISIL_ANTIAEREO = 27
const MOM_SENADO_CAMARA = 42
const MOM_MEXICAN_TRAFFICKERS = 67

const EVT_SUCUMBIOS = 33
const EVT_DARIEN = 71

// Events with no shaded/unshaded variants
const single_events = [ 19, 36, 46, 53, 54, 63, 65, 69 ]

const faction_name = [ NAME_GOVT, NAME_FARC, NAME_AUC, NAME_CARTELS ]

// Factions
const GOVT = 0
const FARC = 1
const AUC = 2
const CARTELS = 3

// Pieces
const BASE = 0
const GUERRILLA = 1
const TROOPS = 2
const POLICE = 3
const CUBE = 4

const space_name = data.space_name

const first_piece = data.first_piece
const last_piece = data.last_piece

const first_space = data.first_space
const last_space = data.last_space
const first_pop = data.first_pop
const first_city = data.first_city
const last_city = data.last_city
const first_dept = data.first_dept
const last_pop = data.last_pop
const last_dept = data.last_dept
const first_loc = data.first_loc
const last_loc = data.last_loc
const first_foreign = data.first_foreign
const last_foreign = data.last_foreign

const path_seen = new Array(last_space+1).fill(0)

// Sequence of Play options
const ELIGIBLE = 0
const SOP_1ST_OP_ONLY = 1
const SOP_2ND_LIMOP = 2
const SOP_1ST_OP_AND_SA = 3
const SOP_2ND_LIMOP_OR_EVENT = 4
const SOP_1ST_EVENT = 5
const SOP_2ND_OP_AND_SA = 6
const SOP_PASS = 7
const INELIGIBLE = 8

// Support
const ACTIVE_SUPPORT = 2
const PASSIVE_SUPPORT = 1
const NEUTRAL = 0
const PASSIVE_OPPOSITION = -1
const ACTIVE_OPPOSITION = -2

// Control
const CTL_NEUTRAL = 0
const CTL_GOVT = 1
const CTL_FARC = 2

const SAMPER = 1
const PASTRANA = 2
const URIBE = 3

const AVAILABLE = -1
const OUT_OF_PLAY = -2

// Cities
const BOGOTA = 0
const CALI = 1
const MEDELLIN = 2
const BUCARAMANGA = 3
const IBAGUE = 4
const SANTA_MARTA = 5
const CARTAGENA = 6
const CUCUTA = 7
const NEIVA = 8
const PASTO = 9
const SINCELEJO = 10

// 1+ Pop Depts
const ATLANTICO = 11
const CHOCO = 12
const NARINO = 13
const META_WEST = 14
const GUAVIARE = 15
const PUTUMAYO = 16
const CESAR = 17
const ANTIOQUIA = 18
const SANTANDER = 19
const HUILA = 20
const ARAUCA = 21
const META_EAST = 22

// 0 Pop Depts
const VICHADA = 23
const GUAINIA = 24
const VAUPES = 25
const AMAZONAS = 26

// Foreign Countries
const ECUADOR = 27
const PANAMA = 28

const next_to_venezuela = [ CESAR, SANTANDER, ARAUCA, VICHADA, GUAINIA ]

const COASTAL_SPACES = [ ATLANTICO, CHOCO, NARINO, CESAR ]

exports.roles = function (scenario) {
	if (scenario.startsWith("2P"))
		return [ NAME_GOVT_AUC, NAME_FARC_CARTELS ]
	if (scenario.startsWith("3P"))
		return [ NAME_GOVT, NAME_FARC, NAME_AUC_CARTELS ]
	return [ NAME_GOVT, NAME_FARC, NAME_AUC, NAME_CARTELS ]
}

exports.scenarios = [
	"Standard",
	"Short",
	"Quick",
	"3P Standard",
	"3P Short",
	"3P Quick",
	"2P Standard",
	"2P Short",
	"2P Quick",
]

function load_game(state) {
	game = state
}

function save_game() {
	if (game.scenario === 4) {
		if (game.current === GOVT)
			game.active = NAME_GOVT
		if (game.current === FARC)
			game.active = NAME_FARC
		if (game.current === AUC)
			game.active = NAME_AUC
		if (game.current === CARTELS)
			game.active = NAME_CARTELS
	}
	if (game.scenario === 3) {
		if (game.current === GOVT)
			game.active = NAME_GOVT
		if (game.current === FARC)
			game.active = NAME_FARC
		if (game.current === AUC || game.current === CARTELS)
			game.active = NAME_AUC_CARTELS
	}
	if (game.scenario === 2) {
		if (game.current === GOVT || game.current === AUC)
			game.active = NAME_GOVT_AUC
		if (game.current === FARC || game.current === CARTELS)
			game.active = NAME_FARC_CARTELS
	}
	return game
}

exports.setup = function (seed, scenario, options) {
	game = {
		seed,
		log: [],
		undo: [],
		active: null,

		scenario: 4,
		current: 0,
		state: null,

		op: null,
		sa: null,
		transfer: 0,

		deck: [],
		president: 0,
		senado: 0,
		aid: 0,
		cylinder: [ ELIGIBLE, ELIGIBLE, ELIGIBLE, ELIGIBLE ],
		resources: [ 0, 0, 0, 0 ],
		shipments: [ 0, 0, 0, 0 ],
		pieces: Array(153).fill(AVAILABLE),
		underground: [ 0, 0, 0, 0 ],
		farc_control: 0,
		govt_control: 0,
		support: Array(23).fill(NEUTRAL),
		momentum: [],
		capabilities: [], // positive = unshaded, negative = shaded
		farc_zones: [],
		terror: [],
		sabotage: [],
	}

	if (scenario.startsWith("3P"))
		game.scenario = 3
	if (scenario.startsWith("2P"))
		game.scenario = 2

	for_each_piece(FARC, GUERRILLA, set_underground)
	for_each_piece(AUC, GUERRILLA, set_underground)
	for_each_piece(CARTELS, GUERRILLA, set_underground)

	setup_standard()

	if (scenario.includes("Quick")) {
		log_h1("Scenario: Quick")
		setup_quick()
		setup_deck(2, 6, 6)
	} else if (scenario.includes("Short")) {
		if (options.seeded)
			setup_deck(3, 10, 5)
		else
			setup_deck(3, 0, 15)
	} else {
		if (options.seeded)
			setup_deck(4, 10, 5)
		else
			setup_deck(4, 0, 15)
	}

	log("DECK " + game.deck.join(", "))

	update_control()

	goto_card()

	return save_game()
}

function setup_standard() {
	game.aid = 9
	game.president = SAMPER
	game.resources[GOVT] = 40
	game.resources[AUC] = 10
	game.resources[CARTELS] = 10
	game.resources[FARC] = 10

	setup_support(ATLANTICO, ACTIVE_SUPPORT)
	setup_support(SANTANDER, ACTIVE_SUPPORT)
	for (let s = first_city; s <= last_city; ++s)
		if (s !== CALI)
			setup_support(s, ACTIVE_SUPPORT)

	setup_support(CHOCO, ACTIVE_OPPOSITION)
	setup_support(ARAUCA, ACTIVE_OPPOSITION)
	setup_support(META_EAST, ACTIVE_OPPOSITION)
	setup_support(META_WEST, ACTIVE_OPPOSITION)
	setup_support(GUAVIARE, ACTIVE_OPPOSITION)
	setup_support(PUTUMAYO, ACTIVE_OPPOSITION)
	setup_support(NARINO, ACTIVE_OPPOSITION)

	setup_piece(GOVT, TROOPS, 3, BOGOTA)
	setup_piece(GOVT, TROOPS, 3, MEDELLIN)
	setup_piece(GOVT, TROOPS, 3, CALI)
	setup_piece(GOVT, TROOPS, 3, SANTANDER)
	setup_piece(GOVT, POLICE, 2, BOGOTA)
	for (let s = first_city; s <= last_city; ++s)
		if (s !== BOGOTA)
			setup_piece(GOVT, POLICE, 1, s)
	setup_piece(GOVT, BASE, 1, SANTANDER)

	setup_piece(FARC, GUERRILLA, 1, NARINO)
	setup_piece(FARC, GUERRILLA, 1, CHOCO)
	setup_piece(FARC, GUERRILLA, 1, SANTANDER)
	setup_piece(FARC, GUERRILLA, 1, HUILA)
	setup_piece(FARC, GUERRILLA, 1, ARAUCA)
	setup_piece(FARC, GUERRILLA, 1, META_EAST)
	setup_piece(FARC, GUERRILLA, 2, META_WEST)
	setup_piece(FARC, GUERRILLA, 2, GUAVIARE)
	setup_piece(FARC, GUERRILLA, 2, PUTUMAYO)
	setup_piece(FARC, BASE, 1, CHOCO)
	setup_piece(FARC, BASE, 1, HUILA)
	setup_piece(FARC, BASE, 1, ARAUCA)
	setup_piece(FARC, BASE, 1, META_EAST)
	setup_piece(FARC, BASE, 1, META_WEST)
	setup_piece(FARC, BASE, 1, GUAVIARE)

	setup_piece(AUC, GUERRILLA, 1, ATLANTICO)
	setup_piece(AUC, GUERRILLA, 1, ANTIOQUIA)
	setup_piece(AUC, GUERRILLA, 1, SANTANDER)
	setup_piece(AUC, GUERRILLA, 1, ARAUCA)
	setup_piece(AUC, GUERRILLA, 1, GUAVIARE)
	setup_piece(AUC, GUERRILLA, 1, PUTUMAYO)
	setup_piece(AUC, BASE, 1, ANTIOQUIA)

	setup_piece(CARTELS, GUERRILLA, 1, CALI)
	setup_piece(CARTELS, GUERRILLA, 1, PUTUMAYO)
	setup_piece(CARTELS, BASE, 1, CALI)
	setup_piece(CARTELS, BASE, 1, META_EAST)
	setup_piece(CARTELS, BASE, 1, META_WEST)
	setup_piece(CARTELS, BASE, 1, GUAVIARE)
	setup_piece(CARTELS, BASE, 2, PUTUMAYO)

	// XXX
	setup_support(BOGOTA, ACTIVE_OPPOSITION)
	game.capabilities = [ -13, -11, -10, -9, -7, -3, -2, -1 ]
}

function setup_quick() {
	setup_piece(CARTELS, GUERRILLA, 4, MEDELLIN)
	setup_piece(CARTELS, BASE, 1, MEDELLIN)

	setup_support(CALI, ACTIVE_SUPPORT)
	setup_piece(GOVT, POLICE, 4, CALI)
	setup_remove_piece(CARTELS, GUERRILLA, 1, CALI)
	setup_remove_piece(CARTELS, BASE, 1, CALI)

	setup_piece(GOVT, TROOPS, 6, BOGOTA)

	setup_piece(AUC, BASE, 1, SANTANDER)

	setup_support(ARAUCA, NEUTRAL)
	setup_piece(AUC, GUERRILLA, 1, ARAUCA)

	set_add(game.farc_zones, META_WEST)
	setup_piece(FARC, GUERRILLA, 4, META_WEST)

	setup_support(HUILA, ACTIVE_OPPOSITION)
	setup_piece(FARC, GUERRILLA, 3, HUILA)
	setup_piece(AUC, GUERRILLA, 2, HUILA)
	setup_piece(CARTELS, BASE, 1, HUILA)

	setup_piece(FARC, GUERRILLA, 2, VAUPES)

	game.resources[AUC] = 5
	game.resources[FARC] = 10
	game.resources[CARTELS] = 20
	game.resources[GOVT] = 30

	game.president = PASTRANA

	// XXX
	game.capabilities = [ 1, 2, 3, 7, 9, 10, 11, 13 ]
}

function shuffle_all_cards() {
	let deck = []
	for (let i = 1; i <= 72; ++i)
		deck.push(i)
	shuffle(deck)
	return deck
}

function setup_deck(count, a, b) {
	let cards = shuffle_all_cards()
	let deck = []
	let pile
	let i = 0
	for (let p = 0; p < count; ++p) {
		if (a > 0) {
			pile = cards.slice(i, i + a)
			i += a
			shuffle(pile)
			deck = deck.concat(pile)
		}
		if (b > 0) {
			pile = cards.slice(i, i + b)
			i += b
			pile.push(73 + p)
			shuffle(pile)
			deck = deck.concat(pile)
		}
	}
	game.deck = deck
}

function setup_support(place, amount) {
	game.support[place] = amount
}

function setup_piece(faction, type, count, where) {
	for (let p = first_piece[faction][type]; count > 0; ++p) {
		if (game.pieces[p] < 0) {
			game.pieces[p] = where
			--count
		}
	}
}

function setup_remove_piece(faction, type, count, where) {
	for (let p = first_piece[faction][type]; count > 0; ++p) {
		if (game.pieces[p] === where) {
			game.pieces[p] = AVAILABLE
			--count
		}
	}
}

function count_pieces(s, faction, type) {
	let first = first_piece[faction][type]
	let last = last_piece[faction][type]
	let n = 0
	for (let p = first; p <= last; ++p)
		if (game.pieces[p] === s)
			++n
	return n
}

function add_resources(faction, n) {
	game.resources[faction] = Math.max(0, Math.min(99, game.resources[faction] + n))
}

function add_aid(n) {
	game.aid = Math.max(0, Math.min(29, game.aid + n))
}

function is_police(p) {
	return p >= first_piece[GOVT][POLICE] && p <= last_piece[GOVT][POLICE]
}

function is_troops(p) {
	return p >= first_piece[GOVT][TROOPS] && p <= last_piece[GOVT][TROOPS]
}

function is_faction_guerrilla(p, faction) {
	return p >= first_piece[faction][GUERRILLA] && p <= last_piece[faction][GUERRILLA]
}

function is_farc_guerrilla(p) {
	return p >= first_piece[FARC][GUERRILLA] && p <= last_piece[FARC][GUERRILLA]
}

function is_auc_guerrilla(p) {
	return p >= first_piece[AUC][GUERRILLA] && p <= last_piece[AUC][GUERRILLA]
}

function is_cartels_guerrilla(p) {
	return p >= first_piece[CARTELS][GUERRILLA] && p <= last_piece[CARTELS][GUERRILLA]
}

function is_base(p) {
	if (p >= first_piece[GOVT][BASE] && p <= last_piece[GOVT][BASE])
		return true
	if (p >= first_piece[FARC][BASE] && p <= last_piece[FARC][BASE])
		return true
	if (p >= first_piece[AUC][BASE] && p <= last_piece[AUC][BASE])
		return true
	if (p >= first_piece[CARTELS][BASE] && p <= last_piece[CARTELS][BASE])
		return true
	return false
}

function target_faction(p) {
	if (p >= first_piece[GOVT][TROOPS] && p <= last_piece[GOVT][TROOPS])
		return 1 << GOVT
	if (p >= first_piece[GOVT][POLICE] && p <= last_piece[GOVT][POLICE])
		return 1 << GOVT
	if (p >= first_piece[GOVT][BASE] && p <= last_piece[GOVT][BASE])
		return 1 << GOVT
	if (p >= first_piece[FARC][GUERRILLA] && p <= last_piece[FARC][GUERRILLA])
		return 1 << FARC
	if (p >= first_piece[FARC][BASE] && p <= last_piece[FARC][BASE])
		return 1 << FARC
	if (p >= first_piece[AUC][GUERRILLA] && p <= last_piece[AUC][GUERRILLA])
		return 1 << AUC
	if (p >= first_piece[AUC][BASE] && p <= last_piece[AUC][BASE])
		return 1 << AUC
	if (p >= first_piece[CARTELS][GUERRILLA] && p <= last_piece[CARTELS][GUERRILLA])
		return 1 << CARTELS
	if (p >= first_piece[CARTELS][BASE] && p <= last_piece[CARTELS][BASE])
		return 1 << CARTELS
	return 0
}

function piece_faction(p) {
	if (p >= first_piece[GOVT][TROOPS] && p <= last_piece[GOVT][TROOPS])
		return GOVT
	if (p >= first_piece[GOVT][POLICE] && p <= last_piece[GOVT][POLICE])
		return GOVT
	if (p >= first_piece[GOVT][BASE] && p <= last_piece[GOVT][BASE])
		return GOVT
	if (p >= first_piece[FARC][GUERRILLA] && p <= last_piece[FARC][GUERRILLA])
		return FARC
	if (p >= first_piece[FARC][BASE] && p <= last_piece[FARC][BASE])
		return FARC
	if (p >= first_piece[AUC][GUERRILLA] && p <= last_piece[AUC][GUERRILLA])
		return AUC
	if (p >= first_piece[AUC][BASE] && p <= last_piece[AUC][BASE])
		return AUC
	if (p >= first_piece[CARTELS][GUERRILLA] && p <= last_piece[CARTELS][GUERRILLA])
		return CARTELS
	if (p >= first_piece[CARTELS][BASE] && p <= last_piece[CARTELS][BASE])
		return CARTELS
	return 0
}

function has_targeted_faction(faction) {
	let bit = 1 << faction
	return game.op.targeted & bit
}

function did_maximum_damage(targeted) {
	if (view.actions.piece)
		for (let p of view.actions.piece)
			if (targeted & target_faction(p))
				return false
	return true
}

function has_momentum(c) {
	return set_has(game.momentum, c)
}

function has_capability(c) {
	return set_has(game.capabilities, c)
}

function has_shaded_capability(c) {
	return set_has(game.capabilities, -c)
}

function has_piece(s, faction, type) {
	let first = first_piece[faction][type]
	let last = last_piece[faction][type]
	for (let p = first; p <= last; ++p)
		if (game.pieces[p] === s)
			return true
	return false
}

function has_active_guerrilla(s, faction) {
	let first = first_piece[faction][GUERRILLA]
	let last = last_piece[faction][GUERRILLA]
	for (let p = first; p <= last; ++p)
		if (game.pieces[p] === s && !is_underground(p))
			return true
	return false
}

function has_underground_guerrilla(s, faction) {
	let first = first_piece[faction][GUERRILLA]
	let last = last_piece[faction][GUERRILLA]
	for (let p = first; p <= last; ++p)
		if (game.pieces[p] === s && is_underground(p))
			return true
	return false
}

function count_underground_guerrillas(s, faction) {
	let first = first_piece[faction][GUERRILLA]
	let last = last_piece[faction][GUERRILLA]
	let n = 0
	for (let p = first; p <= last; ++p)
		if (game.pieces[p] === s && is_underground(p))
			++n
	return n
}

function find_underground_guerrilla(s, faction) {
	let first = first_piece[faction][GUERRILLA]
	let last = last_piece[faction][GUERRILLA]
	for (let p = first; p <= last; ++p)
		if (game.pieces[p] === s && is_underground(p))
			return p
	return -1
}

function find_guerrilla(s, faction) {
	let first = first_piece[faction][GUERRILLA]
	let last = last_piece[faction][GUERRILLA]
	for (let p = first; p <= last; ++p)
		if (game.pieces[p] === s)
			return p
	return -1
}

function has_any_guerrilla(s) {
	return (
		has_piece(s, FARC, GUERRILLA) ||
		has_piece(s, AUC, GUERRILLA) ||
		has_piece(s, CARTELS, GUERRILLA)
	)
}

function has_any_active_guerrilla(s) {
	return (
		has_active_guerrilla(s, FARC) ||
		has_active_guerrilla(s, AUC) ||
		has_active_guerrilla(s, CARTELS)
	)
}

function has_any_underground_guerrilla(s) {
	return (
		has_underground_guerrilla(s, FARC) ||
		has_underground_guerrilla(s, AUC) ||
		has_underground_guerrilla(s, CARTELS)
	)
}

function count_bases(s) {
	return (
		count_pieces(s, GOVT, BASE) +
		count_pieces(s, FARC, BASE) +
		count_pieces(s, AUC, BASE) +
		count_pieces(s, CARTELS, BASE)
	)
}

function count_cubes(s) {
	return (
		count_pieces(s, GOVT, TROOPS) +
		count_pieces(s, GOVT, POLICE)
	)
}

function count_any_guerrillas(s) {
	return (
		count_pieces(s, FARC, GUERRILLA) +
		count_pieces(s, AUC, GUERRILLA) +
		count_pieces(s, CARTELS, GUERRILLA)
	)
}

function count_any_underground_guerrillas(s) {
	return (
		count_underground_guerrillas(s, FARC) +
		count_underground_guerrillas(s, AUC) +
		count_underground_guerrillas(s, CARTELS)
	)
}

function update_control() {
	game.govt_control = 0
	game.farc_control = 0
	for (let s = first_space; s <= last_dept; ++s) {
		let g = count_pieces(s, GOVT, BASE) +
			count_pieces(s, GOVT, TROOPS) +
			count_pieces(s, GOVT, POLICE)
		let f = count_pieces(s, FARC, BASE) +
			count_pieces(s, FARC, GUERRILLA)
		let a = count_pieces(s, AUC, BASE) +
			count_pieces(s, AUC, GUERRILLA)
		let c = count_pieces(s, CARTELS, BASE) +
			count_pieces(s, CARTELS, GUERRILLA)
		if (g > a + c + f)
			game.govt_control |= (1 << s)
		else if (f > g + a + c)
			game.farc_control |= (1 << s)
	}
}

function has_auc_control(s) {
	// AUC outnumber all other forces
	let g = count_pieces(s, GOVT, BASE) +
		count_pieces(s, GOVT, TROOPS) +
		count_pieces(s, GOVT, POLICE)
	let f = count_pieces(s, FARC, BASE) +
		count_pieces(s, FARC, GUERRILLA)
	let a = count_pieces(s, AUC, BASE) +
		count_pieces(s, AUC, GUERRILLA)
	let c = count_pieces(s, CARTELS, BASE) +
		count_pieces(s, CARTELS, GUERRILLA)
	return a > g + f + c
}

function is_city(s) {
	return s >= first_city && s <= last_city
}

function is_dept(s) {
	return s >= first_dept && s <= last_dept
}

function is_city_or_dept(s) {
	return s >= first_city && s <= last_dept
}

function is_loc(s) {
	return s >= first_loc && s <= last_loc
}

function is_city_or_loc(s) {
	return (s >= first_city && s <= last_city) || (s >= first_loc && s <= last_loc)
}

function is_pop(s) {
	return s >= first_pop && s <= last_pop
}

function is_mountain(s) {
	return data.spaces[s].type === "mountain"
}

function is_forest(s) {
	return data.spaces[s].type === "forest"
}

function is_adjacent(a, b) {
	return set_has(data.spaces[a].adjacent, b)
}

function is_active(p) {
	return !is_underground(p)
}

function is_farc_zone(s) {
	return set_has(game.farc_zones, s)
}

function is_guerrilla(p) {
	for (let faction = 1; faction < 4; ++faction) {
		let p0 = first_piece[faction][GUERRILLA]
		let p1 = last_piece[faction][GUERRILLA]
		if (p >= p0 && p <= p1)
			return true
	}
	return false
}

function is_underground(p) {
	for (let faction = 1; faction < 4; ++faction) {
		let p0 = first_piece[faction][GUERRILLA]
		let p1 = last_piece[faction][GUERRILLA]
		if (p >= p0 && p <= p1)
			return game.underground[faction] & (1 << (p - p0))
	}
}

function set_underground(p) {
	for (let faction = 1; faction < 4; ++faction) {
		let p0 = first_piece[faction][GUERRILLA]
		let p1 = last_piece[faction][GUERRILLA]
		if (p >= p0 && p <= p1)
			game.underground[faction] |= (1 << (p - p0))
	}
}

function set_active(p) {
	for (let faction = 1; faction < 4; ++faction) {
		let p0 = first_piece[faction][GUERRILLA]
		let p1 = last_piece[faction][GUERRILLA]
		if (p >= p0 && p <= p1)
			game.underground[faction] &= ~(1 << (p - p0))
	}
}

function remove_piece(p) {
	let s = game.pieces[p]
	drop_held_shipments(p)
	set_underground(p)
	game.pieces[p] = AVAILABLE
	// auto_transfer_dropped_shipments(s)
}

function place_piece(p, s) {
	set_underground(p)
	game.pieces[p] = s
}

function move_piece(p, s) {
	game.pieces[p] = s
}

function place_shipment(sh, p) {
	game.shipments[sh] = p << 2
}

function remove_shipment(sh) {
	game.shipments[sh] = 0
}

function drop_shipment(sh) {
	let p = game.shipments[sh] >> 2
	let s = game.pieces[p]
	let f = piece_faction(p)
	game.shipments[sh] = (s << 2) | f
}

function is_shipment_available(sh) {
	return game.shipments[sh] === 0
}

function is_shipment_held(sh) {
	return game.shipments[sh] !== 0 && (game.shipments[sh] & 3) === 0
}

function get_held_shipment_faction(sh) {
	return piece_faction(game.shipments[sh] >> 2)
}

function get_held_shipment_piece(sh) {
	return (game.shipments[sh] >> 2)
}

function is_shipment_dropped(sh) {
	return (game.shipments[sh] & 3) !== 0
}

function get_dropped_shipment_faction(sh) {
	return (game.shipments[sh] & 3)
}

function get_dropped_shipment_space(sh) {
	return (game.shipments[sh] >> 2)
}

function is_shipment_held_by_piece(sh, p) {
	return is_shipment_held(sh) && get_held_shipment_piece(sh) === p
}

function is_shipment_held_by_faction(sh, f) {
	return is_shipment_held(sh) && get_held_shipment_faction(sh) === f
}

function is_any_shipment_held_by_faction(faction) {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_held_by_faction(sh, faction))
			return true
	return false
}

function is_any_shipment_held() {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_held(sh))
			return true
	return false
}

function remove_dropped_shipments() {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_dropped(sh))
			remove_shipment(sh)
}

function drop_held_shipments(p) {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_held_by_piece(sh, p))
			drop_shipment(sh)
}

function has_dropped_shipments() {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_dropped(sh))
			return true
	return false
}

function can_transfer_dropped_shipments() {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_dropped(sh))
			if (has_any_guerrilla(get_dropped_shipment_space(sh)))
				return true
	return false
}

function auto_transfer_dropped_shipments(s) {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_dropped(sh))
			auto_transfer_dropped_shipments(sh)
}

function auto_transfer_dropped_shipments(sh) {
	let f = get_dropped_shipment_faction(sh)
	let s = get_dropped_shipment_space(sh)
	let a, b, p

	p = find_guerrilla(s, f)
	if (p >= 0) {
		place_shipment(sh, p)
		return
	}

	if (f === FARC) {
		a = find_guerrilla(s, AUC)
		b = find_guerrilla(s, CARTELS)
	}
	if (f === AUC) {
		a = find_guerrilla(s, FARC)
		b = find_guerrilla(s, CARTELS)
	}
	if (f === CARTELS) {
		a = find_guerrilla(s, FARC)
		b = find_guerrilla(s, AUC)
	}

	if (a >= 0 && b < 0) {
		place_shipment(sh, a)
		return
	}
	if (a < 0 && b >= 0) {
		place_shipment(sh, b)
		return
	}

	// nobody to pick it up...
}

function count_terror_and_sabotage() {
	let n = (game.sabotage.length >> 1)
	for (let i = 1; i < game.terror.length; i += 2)
		n += game.terror[i]
	return n
}

function place_terror(s) {
	if (count_terror_and_sabotage() < 40)
		map_set(game.terror, s, map_get(game.terror, s, 0) + 1)
}

function place_sabotage(s) {
	if (count_terror_and_sabotage() < 40)
		set_add(game.sabotage, s)
}

function has_sabotage(s) {
	return set_has(game.sabotage, s)
}

function has_terror(s) {
	return map_get(game.terror, s, 0) > 0
}

function has_govt_control(s) {
	return game.govt_control & (1 << s)
}

function has_farc_control(s) {
	return game.farc_control & (1 << s)
}

function add_aid(n) {
	game.aid = Math.max(0, game.aid + n)
}

function can_govt_civic_action(s) {
	if (game.support[s] < 2 && has_govt_control(s)) {
		if (has_shaded_capability(CAP_1ST_DIV))
			return count_pieces(s, GOVT, TROOPS) >= 2 && count_pieces(s, GOVT, POLICE) >= 2
		return has_piece(s, GOVT, TROOPS) && has_piece(s, GOVT, POLICE)
	}
	return false
}

function for_each_piece(faction, type, f) {
	let p0 = first_piece[faction][type]
	let p1 = last_piece[faction][type]
	for (let p = p0; p <= p1; ++p)
		f(p)
}

function gen_piece_in_space(space, faction, type) {
	for_each_piece(faction, type, p => {
		if (game.pieces[p] === space)
			gen_action_piece(p)
	})
}

function gen_place_piece(space, faction, type) {
	let p0 = first_piece[faction][type]
	let p1 = last_piece[faction][type]
	let done = false
	for (let p = p0; p <= p1; ++p) {
		if (game.pieces[p] === AVAILABLE) {
			gen_action_piece(p)
			done = true
			if (type === BASE)
				break
		}
	}
	if (!done)
		for (let p = p0; p <= p1; ++p)
			if (game.pieces[p] !== space || (type === GUERRILLA && !is_underground(p)))
				gen_action_piece(p)
}

function gen_underground_guerrillas(s, faction) {
	for_each_piece(faction, GUERRILLA, p => {
		if (game.pieces[p] === s)
			if (is_underground(p))
				gen_action_piece(p)
	})
}

function gen_active_guerrillas(s, faction) {
	for_each_piece(faction, GUERRILLA, p => {
		if (game.pieces[p] === s)
			if (is_active(p))
				gen_action_piece(p)
	})
}

function gen_attack_piece(s, faction) {
	if (faction === GOVT) {
		gen_piece_in_space(s, GOVT, TROOPS)
		gen_piece_in_space(s, GOVT, POLICE)
		if (!has_piece(s, GOVT, TROOPS) && !has_piece(s, GOVT, POLICE))
			gen_piece_in_space(s, GOVT, BASE)
	} else {
		gen_piece_in_space(s, faction, GUERRILLA)
		if (!has_piece(s, faction, GUERRILLA))
			gen_piece_in_space(s, faction, BASE)
	}
}

// === SEQUENCE OF PLAY ===

function this_card() {
	return game.deck[0]
}

function is_final_card() {
	return false
}

function goto_card() {
	if (this_card() > 72)
		goto_propaganda_card()
	else
		goto_event_card()
}

function adjust_eligibility(faction) {
	if (game.cylinder[faction] === INELIGIBLE || game.cylinder[faction] === SOP_PASS)
		game.cylinder[faction] = ELIGIBLE
	else if (game.cylinder[faction] !== ELIGIBLE)
		game.cylinder[faction] = INELIGIBLE
}

function end_card() {
	adjust_eligibility(GOVT)
	adjust_eligibility(FARC)
	adjust_eligibility(AUC)
	adjust_eligibility(CARTELS)

	clear_undo()
	array_remove(game.deck, 0)
	goto_card()
}

function is_eligible(faction) {
	return game.cylinder[faction] === ELIGIBLE
}

function next_eligible_faction() {
	let order = data.card_order[this_card()]
	for (let faction of order)
		if (is_eligible(faction))
			return faction
	return null
}

function did_option(e) {
	return (
		game.cylinder[GOVT] === e ||
		game.cylinder[FARC] === e ||
		game.cylinder[AUC] === e ||
		game.cylinder[CARTELS] === e
	)
}

function goto_event_card() {
	log_h1("C" + this_card())
	resume_event_card()
}

function resume_event_card() {
	clear_undo()
	let did_1st = (did_option(SOP_1ST_OP_ONLY) || did_option(SOP_1ST_OP_AND_SA) || did_option(SOP_1ST_EVENT))
	let did_2nd = (did_option(SOP_2ND_LIMOP) || did_option(SOP_2ND_LIMOP_OR_EVENT) || did_option(SOP_2ND_OP_AND_SA))
	if (did_1st) {
		if (did_2nd)
			end_card()
		else
			goto_eligible2()
	} else {
		goto_eligible1()
	}
}

function goto_eligible1() {
	game.current = next_eligible_faction()
	if (game.current === null)
		end_card()
	else
		game.state = "eligible1"
}

function goto_eligible2() {
	game.current = next_eligible_faction()
	if (game.current === null)
		end_card()
	else
		game.state = "eligible2"
}

states.eligible1 = {
	disable_negotiation: true,
	inactive: "1st Eligible",
	prompt() {
		view.prompt = `${data.card_title[this_card()]}: Choose a Sequence of Play option.`
		gen_action("sop", SOP_1ST_OP_ONLY)
		gen_action("sop", SOP_1ST_OP_AND_SA)
		gen_action("sop", SOP_1ST_EVENT)
		gen_action("sop", SOP_PASS)
	},
	sop(option) {
		push_undo()
		game.cylinder[game.current] = option
		switch (option) {
			case SOP_PASS:
				goto_pass()
				break
			case SOP_1ST_OP_ONLY:
				goto_op_only()
				break
			case SOP_1ST_OP_AND_SA:
				goto_op_and_sa()
				break
			case SOP_1ST_EVENT:
				goto_event()
				break
		}
	},
}

states.eligible2 = {
	disable_negotiation: true,
	inactive: "2nd Eligible",
	prompt() {
		view.prompt = `${data.card_title[this_card()]}: Choose a Sequence of Play option.`
		if (did_option(SOP_1ST_OP_ONLY))
			gen_action("sop", SOP_2ND_LIMOP)
		if (did_option(SOP_1ST_OP_AND_SA))
			gen_action("sop", SOP_2ND_LIMOP_OR_EVENT)
		if (did_option(SOP_1ST_EVENT))
			gen_action("sop", SOP_2ND_OP_AND_SA)
		gen_action("sop", SOP_PASS)
	},
	sop(option) {
		push_undo()
		game.cylinder[game.current] = option
		switch (option) {
			case SOP_PASS:
				goto_pass()
				break
			case SOP_2ND_LIMOP:
				goto_limop()
				break
			case SOP_2ND_LIMOP_OR_EVENT:
				goto_limop_or_event()
				break
			case SOP_2ND_OP_AND_SA:
				goto_op_and_sa()
				break
		}
	},
}

function goto_pass() {
	log_h2(faction_name[game.current] + " - Pass")
	if (game.current === GOVT)
		add_resources(game.current, 3)
	else
		add_resources(game.current, 1)
	resume_event_card()
}

function goto_limop_or_event() {
	push_undo()
	game.state = "limop_or_event"
}

states.limop_or_event = {
	prompt() {
		view.prompt = `${data.card_title[this_card()]}: Event or Limited Operation?`
		view.actions.event = 1
		view.actions.limop = 1
	},
	event() {
		goto_event()
	},
	limop() {
		goto_limop()
	}
}

function goto_event() {
	log_h2(faction_name[game.current] + " - Event")
	if (set_has(single_events, this_card()))
		execute_event()
	else
		game.state = "event"
}

function goto_op_only() {
	log_h2(faction_name[game.current] + " - Op Only")
	goto_operation(0, 0, 0, 1)
}

function goto_op_and_sa() {
	log_h2(faction_name[game.current] + " - Op + Special")
	goto_operation(0, 0, 1, 0)
}

function goto_limop() {
	log_h2(faction_name[game.current] + " - LimOp")
	goto_operation(0, 1, 0, 1)
}

function goto_ship_limop() {
	log_h2(faction_name[game.current] + " - Ship")
	goto_operation(1, 1, 0, 0)
}

function goto_operation(free, limited, special, ship) {
	game.state = "op"
	game.op = {
		free,
		limited,
		ship,
		spaces: [],
		targeted: 0,
		pieces: 0,
		count: 0,
	}
	game.sa = special
}

function can_ship() {
	return game.op.ship && is_any_shipment_held(game.current)
}

function end_operation() {
	if (can_ship()) {
		push_undo()
		game.state = "ship"
	} else {
		game.op = null
		resume_event_card()
	}
}

// === REMOVE PIECES (VOLUNTARILY) ===

function action_remove_pieces() {
	push_undo()
	game.transfer = game.state
	game.state = "remove_pieces"
}

states.remove_pieces = {
	disable_negotiation: true,
	prompt() {
		view.prompt = "Remove pieces to Available Forces."
		for (let p = first_piece[game.current][BASE]; p <= last_piece[game.current][BASE]; ++p)
			if (game.pieces[p] >= 0)
				gen_action_piece(p)
		if (game.current === GOVT) {
			for (let p = first_piece[game.current][TROOPS]; p <= last_piece[game.current][TROOPS]; ++p)
				if (game.pieces[p] >= 0)
					gen_action_piece(p)
			for (let p = first_piece[game.current][POLICE]; p <= last_piece[game.current][POLICE]; ++p)
				if (game.pieces[p] >= 0)
					gen_action_piece(p)
		} else {
			for (let p = first_piece[game.current][GUERRILLA]; p <= last_piece[game.current][GUERRILLA]; ++p)
				if (game.pieces[p] >= 0)
					gen_action_piece(p)
		}
		view.actions.done = 1
	},
	piece(p) {
		remove_piece(p)
		update_control()
	},
	done() {
		game.state = game.transfer
		game.transfer = null
		transfer_or_remove_shipments()
	},
}

// === NEGOTIATION ===

function is_player_govt() {
	return game.active === NAME_GOVT || game.active === NAME_GOVT_AUC
}

function is_player_farc() {
	return game.active === NAME_FARC || game.active === NAME_FARC_CARTELS
}

function is_player_auc() {
	return game.active === NAME_AUC || game.active === NAME_GOVT_AUC || game.active === NAME_AUC_CARTELS
}

function is_player_cartels() {
	return game.active === NAME_CARTELS || game.active === NAME_FARC_CARTELS || game.active === NAME_AUC_CARTELS
}

function action_ask_resources() {
	push_undo()
	game.transfer = {
		current: game.current,
		state: game.state,
		count: 0,
	}
	game.state = "ask_resources"
}

states.ask_resources = {
	disable_negotiation: true,
	prompt() {
		view.prompt = "Negotiate: Ask another faction for resources?"
		console.log("game.current", game.current)
		if (!is_player_govt() && game.resources[GOVT] > 0)
			gen_action_resources(GOVT)
		if (!is_player_farc() && game.resources[FARC] > 0)
			gen_action_resources(FARC)
		if (!is_player_auc() && game.resources[AUC] > 0)
			gen_action_resources(AUC)
		if (!is_player_cartels() && game.resources[CARTELS] > 0)
			gen_action_resources(CARTELS)
	},
	resources(faction) {
		game.current = faction
		game.state = "give_resources"
	},
}

states.give_resources = {
	disable_negotiation: true,
	prompt() {
		view.prompt = `Negotiate: ${faction_name[game.transfer.current]} asked for Resources.`
		if (game.resources[game.current] >= 1 && game.resources[game.transfer.current] < 99)
			gen_action_resources(game.current)
		if (game.transfer.count > 0) {
			let min_cost = 1
			if (game.transfer.current === GOVT) {
				min_cost = 3
				if (game.transfer.state === "sweep" && has_capability(CAP_OSPINA))
					min_cost = 1
				if (game.transfer.state === "assault" && has_capability(CAP_TAPIAS))
					min_cost = 1
			}
			if (game.resources[game.transfer.current] < min_cost)
				view.actions.done = 0
			else
				view.actions.done = 1
			view.actions.undo = 1
		} else {
			view.actions.deny = 1
			view.actions.undo = 0
		}
	},
	resources(_) {
		game.transfer.count++
		add_resources(game.current, -1)
		add_resources(game.transfer.current, 1)
	},
	undo() {
		add_resources(game.current, game.transfer.count)
		add_resources(game.transfer.current, -game.transfer.count)
		game.transfer.count = 0
	},
	deny() {
		log(faction_name[game.transfer.current] + " denied request for resources.")
		end_negotiation()
	},
	done() {
		clear_undo()
		log(`${faction_name[game.current]} transferred ${game.transfer.count} resources to ${faction_name[game.transfer.current]}.`)
		end_negotiation()
	},
}

function action_transfer_resources() {
	push_undo()
	game.transfer = {
		current: game.current,
		state: game.state,
		count: null
	}
	game.state = "transfer_resources"
}

states.transfer_resources = {
	disable_negotiation: true,
	prompt() {
		view.prompt = "Transfer resources to another faction."
		if (game.resources[game.current] >= 1) {
			if (!is_player_govt() && game.resources[GOVT] < 99)
				gen_action_resources(GOVT)
			if (!is_player_farc() && game.resources[FARC] < 99)
				gen_action_resources(FARC)
			if (!is_player_auc() && game.resources[AUC] < 99)
				gen_action_resources(AUC)
			if (!is_player_cartels() && game.resources[CARTELS] < 99)
				gen_action_resources(CARTELS)
		}
		if (game.transfer.count)
			view.actions.done = 1
		else
			view.actions.done = 0
	},
	resources(to) {
		if (!game.transfer.count)
			game.transfer.count = [0, 0, 0, 0]
		game.transfer.count[to]++
		add_resources(game.current, -1)
		add_resources(to, 1)
	},
	done() {
		for (let i = 0; i < 4; ++i)
			if (game.transfer.count[i] > 0)
				log(`${faction_name[game.current]} transferred ${game.transfer.count[i]} resources to ${faction_name[i]}.`)
		end_negotiation()
	},
}

function action_ask_shipment() {
	push_undo()
	game.transfer = {
		current: game.current,
		state: game.state,
		shipment: -1,
	}
	game.state = "ask_shipment"
}

function can_ask_shipment() {
	for (let sh = 0; sh < 4; ++sh) {
		if (is_shipment_held(sh)) {
			let p = get_held_shipment_piece(sh)
			let s = game.pieces[p]
			if (has_piece(s, game.current, GUERRILLA)) {
				if (!is_player_farc() && is_farc_guerrilla(p))
					return true
				if (!is_player_auc() && is_auc_guerrilla(p))
					return true
				if (!is_player_cartels() && is_cartels_guerrilla(p))
					return true
			}
		}
	}
	return false
}

states.ask_shipment = {
	disable_negotiation: true,
	prompt() {
		view.prompt = "Negotiate: Ask another faction to transfer shipment?"
		for (let sh = 0; sh < 4; ++sh) {
			if (is_shipment_held(sh)) {
				let p = get_held_shipment_piece(sh)
				let s = game.pieces[p]
				if (has_piece(s, game.current, GUERRILLA)) {
					if (!is_player_farc() && is_farc_guerrilla(p))
						gen_action_shipment(sh)
					if (!is_player_auc() && is_auc_guerrilla(p))
						gen_action_shipment(sh)
					if (!is_player_cartels() && is_cartels_guerrilla(p))
						gen_action_shipment(sh)
				}
			}
		}
	},
	shipment(sh) {
		let p = get_held_shipment_piece(sh)
		game.current = piece_faction(p)
		game.state = "give_shipment"
		game.transfer.shipment = sh
	},
}

states.give_shipment = {
	disable_negotiation: true,
	prompt() {
		let p = get_held_shipment_piece(game.transfer.shipment)
		let s = game.pieces[p]
		view.selected_shipment = game.transfer.shipment
		view.prompt = `Negotiate: ${faction_name[game.transfer.current]} asked for Shipment in ${space_name[s]}.`
		gen_piece_in_space(s, game.transfer.current, GUERRILLA)
		view.actions.deny = 1
	},
	piece(p) {
		let s = game.pieces[f]
		log(`${faction_name[game.current]} transferred shipment to ${faction_name[game.transfer.shipment]} in S${s}.`)
		clear_undo()
		place_shipment(game.transfer.shipment, p)
		end_negotiation()
	},
	deny() {
		log(faction_name[game.transfer.current] + " denied request for shipment.")
		end_negotiation()
	}
}

function action_transfer_shipment() {
	push_undo()
	game.transfer = {
		current: game.current,
		state: game.state,
		shipment: -1,
	}
	game.state = "transfer_shipment"
}

function can_transfer_any_shipment() {
	for (let sh = 0; sh < 4; ++sh)
		if (can_transfer_shipment(sh))
			return true
	return false
}

function can_transfer_shipment(sh) {
	if (is_shipment_held_by_faction(sh, game.current)) {
		let p = get_held_shipment_piece(sh)
		let s = game.pieces[p]
		if (count_pieces(s, game.current, GUERRILLA) > 1)
			return true
		if (!is_player_farc() && has_piece(s, FARC, GUERRILLA))
			return true
		if (!is_player_auc() && has_piece(s, FARC, AUC))
			return true
		if (!is_player_cartels() && has_piece(s, FARC, CARTELS))
			return true
	}
	return false
}

states.transfer_shipment = {
	disable_negotiation: true,
	prompt() {
		view.prompt = "Transfer Shipment to another Guerrilla."
		if (game.transfer.shipment < 0) {
			for (let sh = 0; sh < 4; ++sh)
				if (can_transfer_shipment(sh))
					gen_action_shipment(sh)
		} else {
			let p = get_held_shipment_piece(game.transfer.shipment)
			let s = game.pieces[p]
			for_each_piece(game.current, GUERRILLA, pp => {
				if (pp !== p && game.pieces[pp] === s)
					gen_action_piece(pp)
			})
			if (!is_player_farc())
				gen_piece_in_space(s, FARC, GUERRILLA)
			if (!is_player_auc())
				gen_piece_in_space(s, AUC, GUERRILLA)
			if (!is_player_cartels())
				gen_piece_in_space(s, CARTELS, GUERRILLA)
		}
	},
	shipment(sh) {
		if (game.transfer.shipment === sh)
			game.transfer.shipment = -1
		else
			game.transfer.shipment = sh
	},
	piece(p) {
		let s = game.pieces[p]
		let f = piece_faction(p)
		log(`${faction_name[game.current]} transferred shipment to ${faction_name[f]} in S${s}.`)
		place_shipment(game.transfer.shipment, p)
		game.transfer.shipment = -1
		end_negotiation()
	},
}

function end_negotiation() {
	game.current = game.transfer.current
	game.state = game.transfer.state
	game.transfer = null
}

// === SHIP FOR EXTRA LIMOP ===

states.ship = {
	prompt() {
		view.prompt = "Ship: Remove Shipment for a free, extra Limited Operation?"
		view.actions.end_operation = 1
		for (let sh = 0; sh < 4; ++sh)
			if (is_shipment_held(sh))
				gen_action_shipment(sh)
	},
	shipment(sh) {
		push_undo()
		let faction = get_held_shipment_faction(sh)
		if (faction !== game.current) {
			game.transfer = {
				current: game.current,
				state: game.state,
				shipment: sh,
			}
			game.current = faction
			game.state = "ask_ship"
		} else {
			remove_shipment(sh)
			goto_ship_limop()
		}
	},
	end_operation() {
		game.op.ship = 0
		end_operation()
	},
}

states.ask_ship = {
	disable_negotiation: true,
	prompt() {
		view.prompt = `Negotiate: Remove Shipment to give ${faction_name[game.transfer.current]} a free extra Limited Operation?`
		view.actions.deny = 1
		gen_action_shipment(game.transfer.shipment)
	},
	shipment(sh) {
		end_negotiation()
		remove_shipment(sh)
		goto_ship_limop()
	},
	deny() {
		end_negotiation()
	},
}

// === TRANSFER SHIPMENTS ===

function transfer_or_remove_shipments()
{
	auto_transfer_dropped_shipments()
	if (has_dropped_shipments()) {
		if (can_transfer_dropped_shipments())
			goto_transfer_dropped_shipments()
		else
			remove_dropped_shipments()
	}
}

function transfer_or_drug_bust_shipments()
{
	auto_transfer_dropped_shipments()
	if (has_dropped_shipments()) {
		if (can_transfer_dropped_shipments())
			goto_transfer_dropped_shipments()
		else
			goto_drug_bust()
	}
}

function goto_transfer_dropped_shipments() {
	game.transfer = {
		current: game.current,
		state: game.state,
		shipment: 0,
	}
	resume_transfer_dropped_shipments()
}

function resume_transfer_dropped_shipments() {
	for (let sh = 0; sh < 4; ++sh) {
		if (is_shipment_dropped(sh)) {
			game.current = get_dropped_shipment_faction(sh)
			game.state = "transfer_dropped_shipments"
			game.transfer.shipment = sh
			return
		}
	}
	end_negotiation()
}

states.transfer_dropped_shipments = {
	disable_negotiation: true,
	prompt() {
		view.prompt = "Transfer Shipment to another Guerrilla."
		let s = get_dropped_shipment_space(game.transfer.shipment)

		gen_piece_in_space(s, FARC, GUERRILLA)
		gen_piece_in_space(s, AUC, GUERRILLA)
		gen_piece_in_space(s, CARTELS, GUERRILLA)

		view.actions.undo = 0
	},
	piece(p) {
		push_undo()
		place_shipment(game.transfer.shipment, p)
		resume_transfer_dropped_shipments()
	},
}

// === DRUG BUST ===

function goto_drug_bust() {
	game.transfer = game.state
	resume_drug_bust()
}

function resume_drug_bust() {
	if (has_dropped_shipments()) {
		game.state = "drug_bust"
	} else {
		game.state = game.transfer
		game.transfer = null
	}
}

states.drug_bust = {
	prompt() {
		view.prompt = "Drug Bust: Gain 6 resources per removed Shipment."
		gen_action_resources(GOVT)
		for (let sh = 0; sh < 4; ++sh)
			if (is_shipment_dropped(sh))
				gen_action_shipment(sh)
	},
	shipment(sh) {
		add_resources(GOVT, 6)
		remove_shipment(sh)
		resume_drug_bust()
	},
	resources(_) {
		for (let sh = 0; sh < 4; ++sh) {
			if (is_shipment_dropped(sh)) {
				add_resources(GOVT, 6)
				remove_shipment(sh)
			}
		}
		resume_drug_bust()
	},
}


// === OPERATIONS ===

states.op = {
	prompt() {
		view.prompt = "Choose an Operation."
		if (game.current === GOVT) {
			view.actions.train = 1
			view.actions.patrol = 1
			if (is_final_card())
				view.actions.sweep = 0
			else
				view.actions.sweep = 1
			view.actions.assault = 1
		} else {
			view.actions.rally = 1
			if (is_final_card())
				view.actions.march = 0
			else
				view.actions.march = 1
			view.actions.attack = 1
			view.actions.terror = 1
		}
	},

	train() {
		push_undo()
		log_h3("Train")
		game.state = "train"
	},
	patrol() {
		push_undo()
		log_h3("Patrol")
		goto_patrol1()
	},
	sweep() {
		push_undo()
		log_h3("Sweep")
		game.state = "sweep"
		if (has_shaded_capability(CAP_OSPINA))
			game.op.limited = 1
	},
	assault() {
		push_undo()
		log_h3("Assault")
		game.state = "assault"
		if (has_shaded_capability(CAP_TAPIAS))
			game.op.limited = 1
	},

	rally() {
		push_undo()
		log_h3("Rally")
		game.state = "rally"
	},
	march() {
		push_undo()
		log_h3("March")
		game.state = "march"
		game.op.pieces = []
	},
	attack() {
		push_undo()
		log_h3("Attack")
		game.state = "attack"
	},
	terror() {
		push_undo()
		log_h3("Terror")
		game.state = "terror"
	},
}

function gen_operation_common() {
	if (game.op.spaces.length > 0)
		view.actions.end_operation = 1
	else
		view.actions.end_operation = 0
}

function can_select_op_space(cost) {
	if (!game.op.free && game.resources[game.current] < cost)
		return false
	if (game.op.limited)
		return game.op.spaces.length === 0
	return true
}

function is_selected_op_space(s) {
	return set_has(game.op.spaces, s)
}

function select_op_space(s, cost) {
	set_add(game.op.spaces, s)
	if (!game.op.free)
		game.resources[game.current] -= cost
}

// OPERATION: TRAIN

function can_govt_train_base(s) {
	return count_bases(s) < 2 && count_cubes(s) >= 3
}

function can_govt_train_place(s) {
	return is_city(s) || has_piece(s, GOVT, BASE)
}

states.train = {
	prompt() {
		view.prompt = "Train: Select City or Department."

		if (game.sa) {
			view.actions.air_lift = 1
			view.actions.eradicate = 1
		}

		// Any Departments or Cities
		if (can_select_op_space(3)) {
			for (let s = first_space; s <= last_dept; ++s)
				if (can_govt_train_place(s))
					if (!is_selected_op_space(s))
						gen_action_space(s)
		}

		view.actions.next = 1
	},
	space(s) {
		push_undo()

		log(`Train in S${s}.`)

		select_op_space(s, 3)

		if (is_city(s) || has_piece(s, GOVT, BASE)) {
			game.state = "train_place"
			game.op.where = s
			game.op.count = 6
		}
	},
	next() {
		push_undo()
		game.state = "train_base_or_civic"
	}
}

states.train_place = {
	prompt() {
		view.prompt = `Train in ${space_name[game.op.where]}: Place up to ${game.op.count} cubes.`
		view.where = game.op.where

		if (game.op.count > 0) {
			gen_place_piece(game.op.where, GOVT, TROOPS)
			gen_place_piece(game.op.where, GOVT, POLICE)
		}

		view.actions.next = 1
	},
	piece(p) {
		place_piece(p, game.op.where)
		update_control()
		if (--game.op.count == 0)
			game.state = "train"
	},
	next() {
		game.op.count = 0
		game.state = "train"
	},
}

states.train_base_or_civic = {
	prompt() {
		view.prompt = "Train: Build Base or buy Civic Action in one selected space?"

		view.actions.base = 1

		if (game.resources[game.current] >= 3)
			view.actions.civic = 1
		else
			view.actions.civic = 0

		if (game.op.spaces.length > 0)
			view.actions.end_operation = 1
	},
	base() {
		push_undo()
		game.state = "train_base"
		game.op.where = -1
	},
	civic() {
		push_undo()
		game.state = "train_civic"
		game.op.where = -1
	},
	end_operation,
}

states.train_base = {
	prompt() {
		if (game.op.where < 0) {
			view.prompt = `Train: Replace 3 cubes with a Base.`
			for (let s = first_space; s <= last_dept; ++s)
				if (can_govt_train_base(s))
					if (is_selected_op_space(s) || can_select_op_space(3))
						gen_action_space(s)
		} else {
			if (game.op.count < 0) {
				view.prompt = `Train: All done.`
				view.actions.end_operation = 1
			} else if (game.op.count > 0) {
				view.prompt = `Train: ${game.op.count} cubes with a Base.`
				gen_piece_in_space(game.op.where, GOVT, POLICE)
				gen_piece_in_space(game.op.where, GOVT, TROOPS)
			} else {
				view.prompt = `Train: Place Base.`
				gen_place_piece(game.op.where, GOVT, BASE)
			}
		}
	},
	space(s) {
		push_undo()
		game.op.where = s
		game.op.count = 3
	},
	piece(p) {
		if (!is_selected_op_space(game.op.where))
			select_op_space(game.op.where, 3)
		if (game.op.count > 0)
			remove_piece(p)
		else
			place_piece(p, game.op.where)
		--game.op.count
		update_control()
	},
	end_operation,
}

states.train_civic = {
	prompt() {
		let res = game.resources[game.current]
		if (game.op.where < 0) {
			view.prompt = `Train: Buy Civic Action.`
			if (res >= 3) {
				for (let s = first_space; s <= last_dept; ++s)
					if (can_govt_civic_action(s))
						if (is_selected_op_space(s) || can_select_op_space(3))
							gen_action_space(s)
			}
		} else {
			view.prompt = `Train: Buy Civic Action in ${space_name[game.op.where]}.`
			view.where = game.op.where
			if (res >= 3 && can_govt_civic_action(game.op.where)) {
				gen_action_space(game.op.where)
			} else {
				view.prompt = `Train: All done.`
			}
			view.actions.end_operation = 1
		}
	},
	space(s) {
		push_undo()
		game.op.where = s
		game.resources[game.current] -= 3
		game.support[game.op.where] += 1
	},
	end_operation,
}

// OPERATION: PATROL

function goto_patrol1() {
	if (!game.op.free && game.resources[GOVT] < 3)
		game.state = "patrol_pay"
	else
		goto_patrol2()
}

states.patrol_pay = {
	prompt() {
		view.prompt = "Patrol: Pay 3 resources."
		if (game.resources[GOVT] >= 3)
			gen_action("resources", GOVT)
	},
	resources(_) {
		goto_patrol2()
	}
}

function goto_patrol2() {
	if (!game.op.free)
		game.resources[GOVT] -= 3
	if (game.op.limited)
		game.state = "patrol_limop"
	else
		game.state = "patrol"
	game.op.who = -1
	game.op.pieces = []
}

states.patrol_limop = {
	prompt() {
		view.prompt = "Patrol: Select destination City or LoC."

		gen_any_govt_special()

		// TODO: check that destination can be reached by any cubes
		for (let s = first_city; s <= last_city; ++s)
			gen_action_space(s)
		for (let s = first_loc; s <= last_loc; ++s)
			gen_action_space(s)
	},
	space(s) {
		push_undo()

		logi(`S${s}.`)

		select_op_space(s, 0)

		game.op.where = s
		game.state = "patrol_limop_move"
	},
}

function gen_patrol_move_limop(start) {
	let queue = [ start ]
	path_seen.fill(0)
	while (queue.length > 0) {
		let here = queue.shift()
		for (let next of data.spaces[here].adjacent) {
			// already seen
			if (path_seen[next])
				continue

			path_seen[next] = 1
			gen_piece_in_space(next, GOVT, TROOPS)
			gen_piece_in_space(next, GOVT, POLICE)

			// must stop if guerrilla
			if (has_any_guerrilla(next))
				continue

			// continue along locs and cities
			if (is_loc(next) || is_city(next))
				queue.push(next)
		}
	}
}

states.patrol_limop_move = {
	prompt() {
		view.prompt = `Patrol: Move cubes to ${space_name[game.op.where]}.`
		view.where = game.op.where

		gen_any_govt_special()

		gen_patrol_move_limop(game.op.where)

		view.actions.next = 1
	},
	piece(p) {
		push_undo()
		move_piece(p, game.op.where)
		update_control()
	},
	next: goto_patrol_activate,
}

function gen_patrol_move(start) {
	let queue = [ start ]
	path_seen.fill(0)
	while (queue.length > 0) {
		let here = queue.shift()
		for (let next of data.adjacent_patrol[here]) {
			// already seen
			if (path_seen[next])
				continue

			path_seen[next] = 1
			gen_action_space(next)

			// must stop if guerrilla
			if (has_any_guerrilla(next))
				continue

			queue.push(next)
		}
	}
}

states.patrol = {
	prompt() {
		view.prompt = "Patrol: Move cubes into or along LoCs and Cities."
		view.who = game.op.who

		gen_any_govt_special()

		if (game.op.who < 0) {
			for_each_piece(GOVT, TROOPS, p => {
				if (game.pieces[p] >= 0 && !set_has(game.op.pieces, p))
					gen_action_piece(p)
			})
			for_each_piece(GOVT, POLICE, p => {
				if (game.pieces[p] >= 0 && !set_has(game.op.pieces, p))
					gen_action_piece(p)
			})
			
		} else {
			gen_action_piece(game.op.who)
			gen_patrol_move(game.pieces[game.op.who])
			let from = game.pieces[game.op.who]
			for (let to of data.spaces[from].adjacent) {
				if (is_city_or_loc(to))
					gen_action_space(to)
			}
		}

		view.actions.next = 1
	},
	piece(p) {
		if (game.op.who < 0) {
			push_undo()
			game.op.who = p
			set_add(game.op.pieces, p)
		} else {
			pop_undo()
		}
	},
	space(s) {
		move_piece(game.op.who, s)
		game.op.who = -1
		update_control()
	},
	next: goto_patrol_activate,
}

function goto_patrol_activate() {
	push_undo()

	if (has_momentum(MOM_PLAN_COLOMBIA)) {
		log("No Activation by Patrol.")
		goto_patrol_assault()
		return
	}

	game.state = "patrol_activate"
	game.op.count = []
	for (let s = first_loc; s <= last_loc; ++s)
		game.op.count[s - first_loc] = Math.min(count_cubes(s), count_any_underground_guerrillas(s))
}

states.patrol_activate = {
	prompt() {
		view.prompt = "Patrol: Activate 1 Guerrilla for each cube in LoCs."

		gen_any_govt_special()

		// for each cube in each loc, activate 1 guerrilla
		for (let s = first_loc; s <= last_loc; ++s) {
			let n = game.op.count[s - first_loc]
			if (n > 0) {
				gen_underground_guerrillas(s, FARC)
				gen_underground_guerrillas(s, AUC)
				gen_underground_guerrillas(s, CARTELS)
			}
		}
			
		if (did_maximum_damage(game.op.targeted))
			view.actions.next = 1
		else
			view.actions.next = 0
	},
	piece(p) {
		push_undo()
		let s = game.pieces[p]
		game.op.targeted |= target_faction(p)
		set_active(p)
		game.op.count[s - first_loc]--

		let n = 0
		for (let x of game.op.count)
			n += x
		if (n === 0)
			goto_patrol_assault()
	},
	next() {
		push_undo()
		goto_patrol_assault()
	},
}

function goto_patrol_assault() {
	game.state = "patrol_assault"
	if (has_shaded_capability(CAP_METEORO))
		game.state = "patrol_done"
	else if (has_capability(CAP_METEORO))
		game.op.spaces = []
}

function end_patrol_assault_space() {
	if (has_capability(CAP_METEORO))
		game.state = "patrol_assault"
	else
		game.state = "patrol_done"
}

states.patrol_assault = {
	prompt() {

		gen_any_govt_special()

		view.actions.next = 1

		if (has_capability(CAP_METEORO)) {
			view.prompt = "Patrol: Free Assault in each LoC."
			for (let s = first_loc; s <= last_loc; ++s) {
				if (set_has(game.op.spaces, s))
					continue
				if (can_assault_space(s))
					gen_action_space(s)
			}
		}

		else {
			view.prompt = "Patrol: Free Assault in one LoC."
			if (game.op.limited) {
				for (let s of game.op.spaces)
					if (can_assault_space(s))
						gen_action_space(s)
			} else {
				for (let s = first_loc; s <= last_loc; ++s)
					if (can_assault_space(s))
						gen_action_space(s)
			}
		}
	},
	space(s) {
		push_undo()
		log(`Assault S${s}.`)

		game.state = "patrol_assault_space"
		game.op.where = s
		game.op.count = count_cubes(s)
	},
	next() {
		push_undo()
		game.state = "patrol_done"
	},
}

states.patrol_assault_space = {
	prompt() {
		view.prompt = `Patrol: Remove ${game.op.count} enemy pieces in ${space_name[game.op.where]}.`
		view.where = game.op.where

		gen_any_govt_special()

		if (game.op.count > 0) {
			gen_exposed_piece(game.op.where, FARC)
			gen_exposed_piece(game.op.where, AUC)
			gen_exposed_piece(game.op.where, CARTELS)
		}

		if (did_maximum_damage(game.op.targeted))
			view.actions.next = 1
		else
			view.actions.next = 0
	},
	piece(p) {
		push_undo()
		game.op.targeted |= target_faction(p)
		remove_piece(p)
		update_control()

		if (--game.op.count === 0 || !can_assault_space(game.op.where)) {
			end_patrol_assault_space()
			transfer_or_drug_bust_shipments()
		}
	},
	next() {
		end_patrol_assault_space()
		transfer_or_drug_bust_shipments()
	},
}

states.patrol_done = {
	prompt() {
		view.prompt = "Patrol: All done."
		view.actions.end_operation = 1
	},
	end_operation,
}

// OPERATION: SWEEP

function can_sweep_move(here) {
	if (has_piece(here, GOVT, TROOPS) || has_piece(here, GOVT, POLICE))
		return true

	if (is_dept(here) && has_momentum(MOM_MADRID_DONORS))
		return false

	let ndsc = has_capability(CAP_NDSC)
	for (let next of data.spaces[here].adjacent) {
		if (has_piece(next, GOVT, TROOPS))
			return true
		if (ndsc && has_piece(next, GOVT, POLICE))
			return true
		if (is_loc(next) && !has_any_guerrilla(next)) {
			for (let nextnext of data.spaces[next].adjacent) {
				if (nextnext !== here) {
					if (has_piece(nextnext, GOVT, TROOPS))
						return true
					if (ndsc && has_piece(next, GOVT, POLICE))
						return true
				}
			}
		}
	}
	return false
}

function gen_sweep_move(here) {
	for (let next of data.spaces[here].adjacent) {
		if (game.op.ndsc)
			gen_piece_in_space(next, GOVT, POLICE)
		gen_piece_in_space(next, GOVT, TROOPS)
		if (is_loc(next) && !has_any_guerrilla(next)) {
			for (let nextnext of data.spaces[next].adjacent) {
				if (nextnext !== here) {
					if (game.op.ndsc)
						gen_piece_in_space(nextnext, GOVT, POLICE)
					gen_piece_in_space(nextnext, GOVT, TROOPS)
				}
			}
		}
	}
}

states.sweep = {
	prompt() {
		view.prompt = "Sweep: Select Cities and Departments."

		gen_any_govt_special()

		let cost = 3
		if (has_capability(CAP_OSPINA))
			cost = 1

		if (can_select_op_space(cost)) {
			for (let s = first_space; s <= last_dept; ++s) {
				if (is_selected_op_space(s))
					continue
				if (is_farc_zone(s))
					continue
				if (can_sweep_move(s))
					gen_action_space(s)
			}
		}

		if (!view.actions.space)
			view.prompt = "Sweep: All done."

		gen_operation_common()
	},
	space(s) {
		push_undo()

		logi(`S${s}.`)

		select_op_space(s, 3)

		game.state = "sweep_move"
		game.op.where = s

		if (has_capability(CAP_NDSC))
			game.op.ndsc = 1
	},
	end_operation,
}

states.sweep_move = {
	prompt() {
		view.prompt = `Sweep: Move Troops into ${space_name[game.op.where]}.`
		view.where = game.op.where

		gen_any_govt_special()

		gen_sweep_move(game.op.where)

		view.actions.next = 1
	},
	piece(p) {
		place_piece(p, game.op.where)
		update_control()

		// NDSC
		if (is_police(p))
			game.op.ndsc = 0
	},
	next() {
		push_undo()
		game.state = "sweep_activate"

		let n_troops = count_pieces(game.op.where, GOVT, TROOPS)
		let n_police = count_pieces(game.op.where, GOVT, POLICE)
		game.op.count = n_troops + n_police

		if (has_shaded_capability(CAP_NDSC))
			game.op.count = Math.max(n_troops, n_police)

		if (is_forest(game.op.where))
			game.op.count >>= 1

		if (game.op.count === 0 || !can_sweep_activate(game.op.where))
			game.state = "sweep"
	},
}

function can_sweep_activate(s) {
	return (
		(game.senado !== FARC && has_underground_guerrilla(s, FARC)) ||
		(game.senado !== AUC && has_underground_guerrilla(s, AUC)) ||
		(game.senado !== CARTELS && has_underground_guerrilla(s, CARTELS))
	)
}

states.sweep_activate = {
	prompt() {
		view.prompt = `Sweep: Activate ${game.op.count} Guerrillas in ${space_name[game.op.where]}.`
		view.where = game.op.where

		gen_any_govt_special()

		if (game.senado !== FARC)
			gen_underground_guerrillas(game.op.where, FARC)
		if (game.senado !== AUC)
			gen_underground_guerrillas(game.op.where, AUC)
		if (game.senado !== CARTELS)
			gen_underground_guerrillas(game.op.where, CARTELS)

		if (did_maximum_damage(game.op.targeted))
			view.actions.next = 1
		else
			view.actions.next = 0
	},
	piece(p) {
		push_undo()
		game.op.targeted |= target_faction(p)
		set_active(p)
		if (--game.op.count === 0 || !can_sweep_activate(game.op.where))
			game.state = "sweep"
	},
	next() {
		push_undo()
		game.state = "sweep"
	},
}

// OPERATION: ASSAULT

function can_assault_space(s) {
	if (is_dept(s) && has_momentum(MOM_MADRID_DONORS))
		return false
	for (let faction = 1; faction < 4; ++faction) {
		if (game.senado === faction)
			continue
		if (has_piece(s, faction, GUERRILLA)) {
			if (has_active_guerrilla(s, faction))
				return true
		} else {
			if (has_piece(s, faction, BASE))
				return true
		}
	}
	return false
}

function gen_exposed_piece(s, faction) {
	if (has_piece(s, faction, GUERRILLA))
		gen_active_guerrillas(s, faction)
	else
		gen_piece_in_space(s, faction, BASE)
}

function assault_kill_count(s) {
	let n = count_pieces(s, GOVT, TROOPS)
	if (is_city_or_loc(s))
		return n + count_pieces(s, GOVT, POLICE)
	if (is_mountain(s)) {
		if (has_capability(CAP_MTN_BNS))
			return n + count_pieces(s, GOVT, POLICE)
		if (has_shaded_capability(CAP_MTN_BNS))
			return n >> 2
		return n >> 1
	}
	return n
}

states.assault = {
	prompt() {
		view.prompt = "Assault: Select space to eliminate enemy forces."

		gen_any_govt_special()

		let cost = 3
		if (has_capability(CAP_TAPIAS))
			cost = 1

		if (can_select_op_space(cost)) {
			for (let s = first_space; s <= last_dept; ++s) {
				if (is_selected_op_space(s))
					continue
				if (can_assault_space(s) && assault_kill_count(s) > 0)
					gen_action_space(s)
			}
		}

		if (!view.actions.space)
			view.prompt = "Assault: All done."

		gen_operation_common()
	},
	space(s) {
		push_undo()

		logi(`S${s}.`)

		select_op_space(s, 3)

		game.state = "assault_space"
		game.op.where = s
		game.op.count = assault_kill_count(s)
	},
	end_operation,
}

states.assault_space = {
	prompt() {
		view.prompt = `Assault: Remove ${game.op.count} enemy pieces in ${space_name[game.op.where]}.`
		view.where = game.op.where

		gen_any_govt_special()

		if (game.senado !== FARC)
			gen_exposed_piece(game.op.where, FARC)
		if (game.senado !== AUC)
			gen_exposed_piece(game.op.where, AUC)
		if (game.senado !== CARTELS)
			gen_exposed_piece(game.op.where, CARTELS)

		if (did_maximum_damage(game.op.targeted))
			view.actions.next = 1
		else
			view.actions.next = 0
	},
	piece(p) {
		push_undo()
		game.op.targeted |= target_faction(p)
		remove_piece(p)
		update_control()

		if (--game.op.count === 0 || !can_assault_space(game.op.where)) {
			game.state = "assault"
			transfer_or_drug_bust_shipments()
		}
	},
	next() {
		push_undo()
		game.state = "assault"
		transfer_or_drug_bust_shipments()
	},
}

// OPERATION: RALLY

function rally_count() {
	if (has_piece(game.op.where, game.current, BASE))
		return data.spaces[game.op.where].pop + count_pieces(game.op.where, game.current, BASE)
	return 1
}

states.rally = {
	prompt() {
		if (game.current === FARC)
			view.prompt = "Rally: Select City or Department without Support."
		else if (game.current === AUC)
			view.prompt = "Rally: Select City or Department without Opposition."
		else
			view.prompt = "Rally: Select City or Department."

		if (game.sa) {
			gen_special(FARC, "extort")
			gen_special(AUC, "extort")
			gen_special(CARTELS, "cultivate")
			gen_special(CARTELS, "process")
			gen_special(CARTELS, "bribe", game.resources[CARTELS] < 3)
		}

		// Departments or Cities
		if (can_select_op_space(1)) {
			for (let s = first_space; s <= last_dept; ++s) {
				if (is_selected_op_space(s))
					continue

				// FARC: without Support
				if (game.current === FARC)
					if (game.support[s] > 0)
						continue

				// AUC: without Opposition
				if (game.current === AUC)
					if (game.support[s] < 0)
						continue

				gen_action_space(s)
			}
		}

		if (!view.actions.space)
			view.prompt = "Rally: All done."

		gen_operation_common()
	},
	space(s) {
		push_undo()

		logi(`S${s}.`)

		select_op_space(s, 1)

		game.state = "rally_space"
		game.op.where = s
		game.op.count = rally_count()
	},
	end_operation,
}

states.rally_space = {
	prompt() {
		view.prompt = `Rally: Place up to ${game.op.count} Guerrillas.`
		view.where = game.op.where

		if (game.op.count === rally_count()) {
			view.actions.base = 0
			view.actions.move = 0
			if (count_pieces(game.op.where, game.current, GUERRILLA) >= 2) {
				if (count_bases(game.op.where) < 2)
					view.actions.base = 1
			}
			if (has_piece(game.op.where, game.current, BASE)) {
				view.actions.move = 1
			}
		}

		view.actions.next = 1

		gen_place_piece(game.op.where, game.current, GUERRILLA)
	},
	piece(p) {
		push_undo()
		place_piece(p, game.op.where)
		if (--game.op.count === 0)
			game.state = "rally"
		update_control()
	},
	base() {
		push_undo()
		logi("Base.")
		game.state = "rally_base"
		game.op.count = 2
	},
	move() {
		push_undo()
		logi("Moved.")
		game.state = "rally_move"
		game.op.count = 0
	},
	next() {
		push_undo()
		game.state = "rally"
	},
}

states.rally_base = {
	prompt() {
		if (game.op.count > 0) {
			view.prompt = `Rally: Replace ${game.op.count} Guerrillas with a Base.`
			gen_piece_in_space(game.op.where, game.current, GUERRILLA)
		} else {
			view.prompt = `Rally: Place a Base.`
			gen_place_piece(game.op.where, game.current, BASE)
		}
	},
	piece(p) {
		push_undo()
		if (game.op.count > 0) {
			remove_piece(p)
			--game.op.count
		} else {
			place_piece(p, game.op.where)
			game.state = "rally"
			transfer_or_remove_shipments()
		}
		update_control()
	},
}

states.rally_move = {
	prompt() {
		view.where = game.op.where

		view.prompt = `Rally: Move any Guerrillas to ${space_name[game.op.where]} then flip all Underground.`

		for_each_piece(game.current, GUERRILLA, p => {
			if (game.pieces[p] !== game.op.where && game.pieces[p] >= 0)
				gen_action_piece(p)
		})

		view.actions.flip = 1
	},
	piece(p) {
		push_undo()
		move_piece(p, game.op.where)
		game.op.count++
		update_control()
	},
	flip() {
		push_undo()
		logi("Moved " + game.op.count + ".")
		logi("Flipped.")
		for_each_piece(game.current, GUERRILLA, p => {
			if (game.pieces[p] === game.op.where)
				set_underground(p)
		})
		game.state = "rally"
	}
}

// OPERATION: MARCH

function can_march_to(to) {
	for (let from of data.spaces[to].adjacent)
		if (has_piece(from, game.current, GUERRILLA))
			return true
	return false
}

states.march = {
	prompt() {
		view.prompt = `March: Move Guerrillas to Cities/Departments/LoCs.`

		if (game.sa) {
			gen_special(FARC, "extort")
			gen_special(AUC, "extort")
			gen_special(CARTELS, "cultivate", count_pieces(AVAILABLE, CARTELS, BASE) === 15)
			gen_special(CARTELS, "process")
			gen_special(CARTELS, "bribe", game.resources[CARTELS] < 3)
		}

		if (can_select_op_space(1)) {
			for (let s = first_space; s <= last_dept; ++s) {
				if (is_selected_op_space(s))
					continue
				if (can_march_to(s))
					gen_action_space(s)
			}
		}

		if (can_select_op_space(0)) {
			for (let s = first_loc; s <= last_loc; ++s) {
				if (is_selected_op_space(s))
					continue
				if (can_march_to(s))
					gen_action_space(s)
			}
		}

		if (!view.actions.space)
			view.prompt = "March: All done."

		gen_operation_common()
	},
	space(s) {
		push_undo()

		logi(`S${s}.`)

		if (is_loc(s))
			select_op_space(s, 0)
		else
			select_op_space(s, 1)

		game.state = "march_move"
		game.op.where = s
		game.op.march = []
	},
	end_operation,
}

function may_activate_marching_guerrillas() {
	if (is_loc(game.op.where))
		return true
	if (game.support[game.op.where] > 0)
		return true
	if (game.current === AUC && game.support[game.op.where] < 0)
		return true
	return false
}

function activate_marching_guerrillas(group) {
	if (may_activate_marching_guerrillas()) {
		let count = group.length
		count += count_pieces(game.op.where, GOVT, TROOPS)
		count += count_pieces(game.op.where, GOVT, POLICE)
		if (game.current === AUC)
			count += count_pieces(game.op.where, FARC, GUERRILLA)
		if (count > 3)
			for (let p of group)
				set_active(p)
	}
}

states.march_move = {
	prompt() {
		view.prompt = `March: Move Guerrillas to ${space_name[game.op.where]}.`
		view.where = game.op.where

		for_each_piece(game.current, GUERRILLA, p => {
			// May not move more than once
			if (set_has(game.op.pieces, p))
				return // continue

			let s = game.pieces[p]
			if (s > 0)
			if (is_adjacent(game.op.where, s))
				gen_action_piece(p)
		})

		if (game.op.march.length > 0)
			view.actions.next = 1
	},
	piece(p) {
		push_undo()

		let from = game.pieces[p]
		let group = map_get(game.op.march, from, null)
		if (!group)
			group = []
		set_add(group, p)
		map_set(game.op.march, from, group)

		activate_marching_guerrillas(group)

		set_add(game.op.pieces, p)

		move_piece(p, game.op.where)

		update_control()
	},
	next() {
		push_undo()
		game.op.march = 0
		game.state = "march"
	},
}

// OPERATION: ATTACK

function has_any_piece(s, faction) {
	if (faction === GOVT)
		return has_piece(s, GOVT, BASE) || has_piece(s, GOVT, TROOPS) || has_piece(s, GOVT, POLICE)
	return has_piece(s, faction, BASE) || has_piece(s, faction, GUERRILLA)
}

function has_exposed_piece(s, faction) {
	if (has_piece(s, faction, GUERRILLA))
		return has_active_guerrilla(s, faction)
	else
		return has_piece(s, faction, BASE)
}

function has_enemy_piece(s, faction) {
	if (faction !== GOVT && has_any_piece(s, GOVT))
		return true
	if (faction !== FARC && has_any_piece(s, FARC))
		return true
	if (faction !== AUC && has_any_piece(s, AUC))
		return true
	if (faction !== CARTELS && has_any_piece(s, CARTELS))
		return true
	return false
}

function has_exposed_enemy_piece(s, faction) {
	if (faction !== GOVT && has_any_piece(s, GOVT))
		return true
	if (faction !== FARC && has_exposed_piece(s, FARC))
		return true
	if (faction !== AUC && has_exposed_piece(s, AUC))
		return true
	if (faction !== CARTELS && has_exposed_piece(s, CARTELS))
		return true
	return false
}

states.attack = {
	prompt() {
		view.prompt = "Attack: Select space with Guerrilla and enemy piece."

		if (game.sa) {
			gen_special(FARC, "extort")
			gen_special(AUC, "extort")
			gen_special(CARTELS, "bribe", game.resources[CARTELS] < 3)
		}

		if (can_select_op_space(1)) {
			for (let s = first_space; s <= last_space; ++s) {
				if (is_selected_op_space(s))
					continue
				if (has_piece(s, game.current, GUERRILLA) && has_enemy_piece(s, game.current))
					gen_action_space(s)
			}
		}

		if (!view.actions.space)
			view.prompt = "Attack: All done."

		gen_operation_common()
	},
	space(s) {
		push_undo()

		logi(`S${s}.`)

		select_op_space(s, 1)

		game.state = "attack_space"
		game.op.where = s
	},
	end_operation,
}

states.attack_space = {
	prompt() {
		view.prompt = `Attack in ${space_name[game.op.where]}.`
		view.where = game.op.where
		view.actions.resolve = 1

		// Ambush activity modifies Attack action intead of being a stand-alone activity.
		if (game.sa) {
			if (game.current === FARC || game.current === AUC)
				if (has_underground_guerrilla(game.op.where, game.current))
					view.actions.ambush = 1
				else
					view.actions.ambush = 0
		}
	},
	resolve() {
		clear_undo()

		for_each_piece(game.current, GUERRILLA, p => {
			if (game.pieces[p] === game.op.where)
				if (is_underground(p))
					set_active(p)
		})

		let die = random(6) + 1
		log("Rolled " + die + ".")

		if (die === 1) {
			game.state = "attack_place"
		} else if (die <= count_pieces(game.op.where, game.current, GUERRILLA)) {
			game.state = "attack_remove"
			game.op.count = 2
		} else {
			game.state = "attack"
		}
	},
	ambush: goto_ambush,
}

states.attack_place = {
	prompt() {
		view.prompt = `Attack in ${space_name[game.op.where]}: Place a Guerrilla.`
		view.where = game.op.where
		gen_place_piece(game.op.where, game.current, GUERRILLA)
	},
	piece(p) {
		push_undo()
		place_piece(p, game.op.where)
		update_control()
		game.state = "attack_remove"
		game.op.count = 2
	}
}

states.attack_remove = {
	prompt() {
		view.prompt = `Attack in ${space_name[game.op.where]}: Remove ${game.op.count} enemy pieces.`
		view.where = game.op.where

		gen_attack_piece(game.op.where, GOVT)
		if (game.current !== FARC)
			gen_attack_piece(game.op.where, FARC)
		if (game.current !== AUC)
			gen_attack_piece(game.op.where, AUC)
		if (game.current !== CARTELS)
			gen_attack_piece(game.op.where, CARTELS)

		if (did_maximum_damage(game.op.targeted))
			view.actions.next = 1
		else
			view.actions.next = 0
	},
	piece(p) {
		push_undo()
		game.op.targeted |= target_faction(p)
		remove_piece(p)
		update_control()

		// TODO: Captured Goods

		if (--game.op.count === 0 || !has_exposed_enemy_piece(game.op.where, game.current)) {
			game.state = "attack"
			transfer_or_remove_shipments()
		}
	},
	next() {
		game.state = "attack"
		game.op.count = 0
		transfer_or_remove_shipments()
	}
}

// OPERATION: TERROR

states.terror = {
	prompt() {
		view.prompt = "Terror: Select space with Underground Guerrilla."

		// TODO: can terror no-pop dept?

		if (game.sa) {
			gen_special(FARC, "extort")
			gen_special(FARC, "kidnap")
			gen_special(AUC, "extort")
			gen_special(AUC, "assassinate", game.op.spaces.length === 0)
			gen_special(CARTELS, "bribe", game.resources[CARTELS] < 3)
		}

		if (can_select_op_space(1)) {
			for (let s = first_space; s <= last_dept; ++s) {
				if (is_selected_op_space(s))
					continue
				if (has_underground_guerrilla(s, game.current))
					gen_action_space(s)
			}
		}

		if (can_select_op_space(0)) {
			for (let s = first_loc; s <= last_loc; ++s) {
				if (is_selected_op_space(s))
					continue
				if (has_underground_guerrilla(s, game.current))
					gen_action_space(s)
			}
		}

		if (!view.actions.space)
			view.prompt = "Terror: All done."

		gen_operation_common()
	},
	space(s) {
		push_undo()
		do_terror(s)
	},
	end_operation,
}

function do_terror(s) {
	let p = find_underground_guerrilla(s, game.current)

	set_active(p)

	log(`Terror in S${s}.`)

	if (is_loc(s)) {
		select_op_space(s, 0)
		place_sabotage(s)
	} else {
		select_op_space(s, 1)
		place_terror(s)

		if (is_pop(s)) {
			if (game.current === FARC) {
				if (game.support[s] !== 0)
					game.support[s] --
			} else {
				if (game.support[s] > 0)
					game.support[s] --
				else if (game.support[s] < 0)
					game.support[s] ++
			}
		}
	}

	if (game.current === AUC) {
		// if one space, drop aid by 3
		if (game.op.spaces.length === 1) {
			logi("Aid Cut by 3.")
			add_aid(-3)
		// if two or more spaces, drop aid by 5
		} else if (game.op.spaces.length === 2) {
			logi("Aid Cut by 2.")
			add_aid(-2)
		}
	}
}

// === SPECIAL ACTIVITIES ===

const special_activities = {
	air_lift: goto_air_lift,
	air_strike: goto_air_strike,
	eradicate: goto_eradicate,
	extort: goto_extort,
	kidnap: goto_kidnap,
	assassinate: goto_assassinate,
	cultivate: goto_cultivate,
	process: goto_process,
	bribe: goto_bribe,
}

function gen_special(faction, action, disable = false) {
	if (game.current === faction) {
		if (disable)
			view.actions[action] = 0
		else
			view.actions[action] = 1
	}
}

function gen_any_govt_special() {
	if (game.sa) {
		view.actions.air_lift = 1
		view.actions.eradicate = 1
		if (has_momentum(MOM_PLAN_COLOMBIA))
			view.actions.air_strike = 0
		else
			view.actions.air_strike = 1
	}
}

function end_special_activity() {
	game.state = game.sa.save
	game.sa = 0
}

// SPECIAL ACTIVITY: AIR LIFT

// TODO: from or to first?

function goto_air_lift() {
	push_undo()
	log_h3("Air Lift")
	game.sa = {
		save: game.state,
		count: 3,
		from: -1,
		to: -1,
	}
	game.state = "air_lift_from"
	if (has_capability(CAP_BLACK_HAWKS))
		game.sa.count = 30
	if (has_shaded_capability(CAP_BLACK_HAWKS))
		game.sa.count = 1
}

states.air_lift_from = {
	prompt() {
		view.prompt = "Air Lift: Select origin space."
		let manpad = has_momentum(MOM_MISIL_ANTIAEREO)
		for (let s = first_space; s <= last_space; ++s)
			if (has_piece(s, GOVT, TROOPS))
				if (!manpad || !has_any_guerrilla(s))
					gen_action_space(s)
	},
	space(s) {
		push_undo()
		game.sa.from = s
		game.state = "air_lift_to"
	}
}

states.air_lift_to = {
	prompt() {
		view.prompt = "Air Lift: Select destination space."
		view.where = game.sa.from
		let manpad = has_momentum(MOM_MISIL_ANTIAEREO)
		for (let s = first_space; s <= last_space; ++s)
			if (s !== game.sa.from && !is_farc_zone(s))
				if (!manpad || !has_any_guerrilla(s))
					gen_action_space(s)
	},
	space(s) {
		push_undo()
		game.sa.to = s
		game.state = "air_lift_move"
		log(`Air Lift from S${game.sa.from} to S${game.sa.to}.`)
	}
}

states.air_lift_move = {
	prompt() {
		view.prompt = `Air Lift: Move up to ${game.sa.count} Troops from ${space_name[game.sa.from]} to ${space_name[game.sa.to]}.`
		view.where = game.sa.to
		gen_piece_in_space(game.sa.from, GOVT, TROOPS)
		view.actions.end_activity = 1
	},
	piece(p) {
		push_undo()
		move_piece(p, game.sa.to)
		update_control()
		if (--game.sa.count === 0 || count_cubes(game.sa.from) === 0)
			end_special_activity()
	},
	end_activity() {
		push_undo()
		end_special_activity()
	},
}

// SPECIAL ACTIVITY: AIR STRIKE

function goto_air_strike() {
	push_undo()
	log_h3("Air Strike")
	game.sa = { save: game.state }
	game.state = "air_strike"
}

states.air_strike = {
	prompt() {
		view.prompt = "Air Strike: Destroy exposed Insurgent unit."
		let manpad = has_momentum(MOM_MISIL_ANTIAEREO)
		for (let s = first_space; s <= last_space; ++s) {
			if (!manpad || !has_any_guerrilla(s)) {
				gen_exposed_piece(s, FARC)
				gen_exposed_piece(s, AUC)
				gen_exposed_piece(s, CARTELS)
			}
		}
	},
	piece(p) {
		//push_undo()
		let s = game.pieces[p]
		log(`Air Strike in S${s}.`)
		remove_piece(p)
		update_control()
		end_special_activity()
		transfer_or_remove_shipments()
	}
}

// SPECIAL ACTIVITY: ERADICATE

function goto_eradicate() {
	push_undo()
	log_h3("Eradicate")
	game.sa = {
		save: game.state,
		where: -1,
	}
	game.state = "eradicate"
}

states.eradicate = {
	prompt() {
		view.prompt = "Eradicate: Destroy rural Cartels Bases."
		let manpad = has_momentum(MOM_MISIL_ANTIAEREO)
		for (let s = first_dept; s <= last_dept; ++s)
			if (has_piece(s, CARTELS, GUERRILLA) || has_piece(s, CARTELS, BASE))
				if (!manpad || !has_any_guerrilla(s))
					gen_action_space(s)
	},
	space(s) {
		push_undo()
		log(`Eradicate in S${s}.`)

		logi("+4 Aid.")
		add_aid(4)

		game.sa.where = s
		if (has_piece(s, CARTELS, BASE))
			game.state = "eradicate_base"
		else
			game.state = "eradicate_shift"
	}
}

states.eradicate_base = {
	prompt() {
		view.prompt = `Eradicate: Remove Cartel Bases in ${space_name[game.sa.where]}.`
		view.where = game.sa.where
		gen_piece_in_space(game.sa.where, CARTELS, BASE)
	},
	piece(p) {
		remove_piece(p)
		update_control()
		if (!has_piece(game.sa.where, CARTELS, BASE))
			goto_eradicate_shift()
	}
}

function goto_eradicate_shift() {
	if (can_eradicate_shift())
		game.state = "eradicate_shift"
	else
		end_special_activity()
}

function can_eradicate_shift() {
	if (is_pop(game.sa.where) && game.support[game.sa.where] > -2)
		return true
	for (let s of data.spaces[game.sa.where].adjacent)
		if (is_pop(s) && game.support[s] > -2)
			return true
	return has_piece(AVAILABLE, FARC, GUERRILLA)
}

states.eradicate_shift = {
	prompt() {
		view.prompt = `Eradicate: Shift ${space_name[game.sa.where]} or adjacent space toward active Opposition.`
		view.where = game.sa.where

		let can_shift = false

		if (is_pop(game.sa.where) && game.support[game.sa.where] > -2) {
			gen_action_space(game.sa.where)
			can_shift = true
		}
		for (let s of data.spaces[game.sa.where].adjacent) {
			if (is_pop(s) && game.support[s] > -2) {
				gen_action_space(s)
				can_shift = true
			}
		}

		if (!can_shift) {
			view.prompt = `Eradicate: Place available FARC Guerrilla in ${space_name[game.sa.where]}.`
			gen_piece_in_space(AVAILABLE, FARC, GUERRILLA)
		}
			
	},
	space(s) {
		push_undo()
		game.support[s] --
		end_special_activity()
	},
	piece(p) {
		push_undo()
		place_piece(p, game.sa.where)
		update_control()
		end_special_activity()
	},
	end_activity() {
		end_special_activity()
	},
}


// SPECIAL ACTIVITY: AMBUSH

function goto_ambush() {
	push_undo()
	log_h3("Ambush")
	game.state = "ambush"
	game.sa = 0
}

states.ambush = {
	prompt() {
		view.prompt = `Ambush in ${space_name[game.op.where]}: Activate an Underground Guerrilla.`
		gen_underground_guerrillas(game.op.where, game.current)
	},
	piece(p) {
		set_active(p)
		game.state = "attack_place"
		game.op.count = 2
	}
}

// SPECIAL ACTIVITY: EXTORT

function goto_extort() {
	push_undo()
	log_h3("Extort")
	game.sa = {
		save: game.state,
		spaces: [],
		// where: -1, // for extort2
	}
	game.state = "extort1"
}

states.extort1 = {
	prompt() {
		view.prompt = "Extort: Activate Underground Guerrillas to gain Resources."

		for (let s = first_space; s <= last_space; ++s) {
			if (set_has(game.sa.spaces, s))
				continue
			if (has_underground_guerrilla(s, game.current)) {
				if (game.current === FARC && has_farc_control(s))
					gen_action_space(s)
				if (game.current === AUC && has_auc_control(s))
					gen_action_space(s)
			}
		}

		view.actions.end_activity = 1
	},
	space(s) {
		push_undo()
		logi(`S${s}.`)
		let p = find_underground_guerrilla(s, game.current)
		set_active(p)
		set_add(game.sa.spaces, s)
		add_resources(game.current, 1)
	},
	end_activity() {
		push_undo()
		end_special_activity()
	},
}

states.extort2 = {
	prompt() {
		if (game.sa.where < 0) {
			view.prompt = "Extort: Select space with Underground Guerrilla that you control."
			for (let s = first_space; s <= last_space; ++s) {
				if (set_has(game.sa.spaces, s))
					continue
				if (has_underground_guerrilla(s, game.current)) {
					if (game.current === FARC && has_farc_control(s))
						gen_action_space(s)
					if (game.current === AUC && has_auc_control(s))
						gen_action_space(s)
				}
			}
		} else {
			view.prompt = `Extort in ${space_name[game.sa.where]}.`
			view.where = game.sa.where
			gen_underground_guerrillas(game.sa.where, game.current)
		}

		view.actions.end_activity = 1
	},
	piece(p) {
		set_active(p)
		add_resources(game.current, 1)
		game.sa.where = -1
	},
	space(s) {
		push_undo()
		game.sa.where = s
		set_add(game.sa.spaces, s)
		logi(`S${s}.`)
	},
	end_activity() {
		push_undo()
		end_special_activity()
	},
}

// SPECIAL ACTIVITY: KIDNAP

function goto_kidnap() {
	push_undo()
	log_h3("Kidnap")
	game.sa = {
		save: game.state,
		spaces: [],
		where: -1,
	}
	game.state = "kidnap"
}

function can_kidnap(s) {
	// City, LoC, or Cartels Base
	if (is_city_or_loc(s) || has_piece(s, CARTELS, BASE)) {
		// FARC Guerrillas outnumber Police
		if (count_pieces(s, FARC, GUERRILLA) > count_pieces(s, GOVT, POLICE)) {
			// Selected for Terror
			if (set_has(game.op.spaces, s))
				return true

			// ... or may be for future Terror if ...
			if (has_underground_guerrilla(s, game.current)) {
				// enough resources to pay for terror
				if (game.resources[game.current] > 0)
					return true

				// or Kidnap could steal resources from Govt
				if (is_city_or_loc(s) && game.resources[GOVT] > 0)
					return true

				// or Kidnap could steal resources from Cartels
				if (has_piece(s, CARTELS, BASE) && game.resources[CARTELS] > 0)
					// TODO: NOT if DRUG RANSOM
					return true
			}
		}
	}
	return false
}

states.kidnap = {
	prompt() {
		view.prompt = "Kidnap: Select City, LoC, or Cartels Base space where Terror."

		if (game.sa.spaces.length < 3) {
			for (let s = first_space; s <= last_space; ++s) {
				if (set_has(game.sa.spaces, s))
					continue
				if (can_kidnap(s))
					gen_action_space(s)
			}
		}

		view.actions.end_activity = 1
	},
	space(s) {
		push_undo()
		logi(`S${s}.`)
		set_add(game.sa.spaces, s)
		game.sa.where = s
		game.state = "kidnap_space"
	},
	end_activity() {
		push_undo()
		end_special_activity()
	},
}

function transfer_resources(from, to, n) {
	if (n > game.resources[from])
		n = game.resources[from]
	game.resources[from] -= n
	add_resources(to, n)
}

states.kidnap_space = {
	prompt() {
		view.prompt = `Kidnap in ${space_name[game.sa.where]}.`
		view.where = game.sa.where

		let s = game.sa.where

		let g = is_city_or_loc(s) && game.resources[GOVT] > 0
		let c = has_piece(s, CARTELS, BASE) && game.resources[CARTELS] > 0

		// TODO: Drug Ransom if targeting Cartels with Shipment

		if (g)
			gen_action_resources(GOVT)
		if (c)
			gen_action_resources(CARTELS)

		if (g && c)
			view.prompt += " Take resources from Government or Cartels!"
		else if (g)
			view.prompt += " Take resources from Government!"
		else if (c)
			view.prompt += " Take resources from Cartels!"
		else
			view.prompt += " IMPOSSIBLE!"
	},
	resources(faction) {
		clear_undo()

		let die = random(6) + 1
		log("Rolled " + die + ".")
		transfer_resources(faction, game.current, die)

		// ... will be selected for Terror - by Terroring immediately!
		if (!is_selected_op_space(game.sa.where))
			do_terror(game.sa.where)

		// TODO: manually end
		if (game.sa.spaces.length === 3)
			end_special_activity()
		else
			game.state = "kidnap"
	},
}

// SPECIAL ACTIVITY: ASSASSINATE

function goto_assassinate() {
	push_undo()
	log_h3("Assassinate")
	game.sa = {
		save: game.state,
		spaces: [],
		where: -1,
	}
	game.state = "assassinate"
}

function can_assassinate(s) {
	// Space where Terror
	if (set_has(game.op.spaces, s))
		// AUC Guerrillas outnumber Police
		if (count_pieces(s, AUC, GUERRILLA) > count_pieces(s, GOVT, POLICE))
			if (has_enemy_piece(s, game.current))
				return true
	return false
}

states.assassinate = {
	prompt() {
		view.prompt = "Assassinate: Select space where Terror."

		if (game.sa.spaces.length < 3) {
			for (let s = first_space; s <= last_space; ++s) {
				if (set_has(game.sa.spaces, s))
					continue
				if (can_assassinate(s))
					gen_action_space(s)
			}
		}

		view.actions.end_activity = 1
	},
	space(s) {
		push_undo()
		logi(`S${s}.`)
		set_add(game.sa.spaces, s)
		game.sa.where = s
		game.state = "assassinate_space"
	},
	end_activity() {
		push_undo()
		end_special_activity()
	},
}

states.assassinate_space = {
	prompt() {
		view.prompt = `Assassinate in ${space_name[game.sa.where]}.`
		view.where = game.sa.where

		let s = game.sa.where

		gen_piece_in_space(s, GOVT, TROOPS)
		gen_piece_in_space(s, GOVT, POLICE)
		gen_piece_in_space(s, GOVT, BASE)

		gen_piece_in_space(s, FARC, GUERRILLA)
		gen_piece_in_space(s, FARC, BASE)

		gen_piece_in_space(s, CARTELS, GUERRILLA)
		gen_piece_in_space(s, CARTELS, BASE)
	},
	piece(p) {
		remove_piece(p)
		update_control()

		if (game.sa.spaces.length === 3)
			end_special_activity()
		else
			game.state = "assassinate"

		// TODO: Commandeer
		transfer_or_remove_shipments()
	},
}

// SPECIAL ACTIVITY: CULTIVATE

function goto_cultivate() {
	push_undo()
	log_h3("Cultivate")
	game.sa = {
		save: game.state,
		where: -1,
	}
	game.state = "cultivate"
}

states.cultivate = {
	prompt() {
		view.prompt = "Cultivate: Select Department or City."
		for (let s = first_pop; s <= last_pop; ++s)
			if (count_bases(s) < 2)
				gen_action_space(s)
	},
	space(s) {
		push_undo()
		log(`Cultivate in S${s}.`)
		game.sa.where = s
		if (game.sa.save === "rally")
			game.state = "cultivate_place"
		else
			game.state = "cultivate_move"
	},
}

states.cultivate_place = {
	prompt() {
		view.prompt = `Cultivate: Place Base in ${space_name[game.sa.where]}.`
		view.where = game.sa.where
		gen_place_piece(game.sa.where, CARTELS, BASE)
	},
	piece(p) {
		push_undo()
		place_piece(p, game.sa.where)
		update_control()
		end_special_activity()
	},
}

states.cultivate_move = {
	prompt() {
		view.prompt = `Cultivate: Relocate Base to ${space_name[game.sa.where]}.`
		view.where = game.sa.where
		for_each_piece(CARTELS, BASE, p => {
			if (game.pieces[p] !== game.sa.where && game.pieces[p] >= 0)
				gen_action_piece(p)
		})
	},
	piece(p) {
		push_undo()
		move_piece(p, game.sa.where)
		update_control()
		end_special_activity()
	},
}

// SPECIAL ACTIVITY: PROCESS

function has_available_shipment() {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_available(sh))
			return true
	return false
}

function find_available_shipment() {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_available(sh))
			return sh
	return -1
}

function goto_process() {
	push_undo()
	log_h3("Process")
	game.sa = {
		save: game.state,
		spaces: [],
		count: 0,
		where: -1,
	}
	game.state = "process"
}

states.process = {
	prompt() {
		view.prompt = "Process: Select spaces with Base."
		for (let s = first_space; s <= last_space; ++s)
			if (!set_has(game.sa.spaces, s) && has_piece(s, CARTELS, BASE))
				gen_action_space(s)
		view.actions.end_activity = 1
	},
	space(s) {
		push_undo()
		log(`Process in S${s}.`)
		set_add(game.sa.spaces, s)
		game.sa.where = s
		game.sa.count = 2
		game.state = "process_space"
	},
	end_activity() {
		push_undo()
		end_special_activity()
	},
}

states.process_space = {
	prompt() {
		view.prompt = `Process: Remove Base or place Shipment with Guerrilla in ${space_name[game.sa.where]}.`
		view.where = game.sa.where
		if (game.sa.count === 2 || game.sa.count === 0)
			gen_piece_in_space(game.sa.where, CARTELS, BASE)
		if (game.sa.count > 0) {
			if (has_available_shipment()) {
				gen_piece_in_space(game.sa.where, CARTELS, GUERRILLA)
				gen_piece_in_space(game.sa.where, FARC, GUERRILLA)
				gen_piece_in_space(game.sa.where, AUC, GUERRILLA)
			}
		}
		view.actions.next = 1
	},
	piece(p) {
		if (is_base(p)) {
			log("Removed Base.")
			add_resources(CARTELS, 3)
			remove_piece(p)
			update_control()
			game.sa.count = 0
			if (!has_piece(game.sa.where, CARTELS, BASE))
				game.state = "process"
		} else {
			log("Placed Shipment.")
			let sh = find_available_shipment()
			place_shipment(sh, p)
			if (--game.sa.count === 0 || !has_available_shipment())
				game.state = "process"
		}
	},
	next() {
		game.state = "process"
	}
}

// SPECIAL ACTIVITY: BRIBE

function goto_bribe() {
	push_undo()
	log_h3("Bribe")
	game.sa = {
		save: game.state,
		spaces: [],
		where: -1,
		targeted: 0,
		count: 0,
		piece: -1,
	}
	game.state = "bribe"
}

function resume_bribe() {
	if (game.sa.spaces.length === 3)
		end_special_activity()
	else
		game.state = "bribe"
}

states.bribe = {
	prompt() {
		view.prompt = `Bribe: Select up to ${3-game.sa.spaces.length} spaces.`
		if (game.resources[CARTELS] >= 3) {
			for (let s = first_space; s <= last_space; ++s)
				if (!set_has(game.sa.spaces, s) && has_enemy_piece(s))
					gen_action_space(s)
		}
		view.actions.end_activity = 1
	},
	space(s) {
		push_undo()
		game.resources[CARTELS] -= 3
		set_add(game.sa.spaces, s)
		game.sa.where = s
		game.sa.targeted = 0
		game.state = "bribe_space"
	},
	end_activity() {
		push_undo()
		end_special_activity()
	},
}

states.bribe_space = {
	prompt() {
		view.prompt = "Bribe: Remove or flip 1 base, 2 cubes, or 2 guerrillas."

		// Nothing removed yet
		if (game.sa.targeted === 0) {
			gen_piece_in_space(game.sa.where, GOVT, TROOPS)
			gen_piece_in_space(game.sa.where, GOVT, POLICE)
			gen_piece_in_space(game.sa.where, GOVT, BASE)
			gen_piece_in_space(game.sa.where, FARC, GUERRILLA)
			gen_piece_in_space(game.sa.where, FARC, BASE)
			gen_piece_in_space(game.sa.where, AUC, GUERRILLA)
			gen_piece_in_space(game.sa.where, AUC, BASE)
			if (
				has_piece(game.sa.where, FARC, GUERRILLA) ||
				has_piece(game.sa.where, AUC, GUERRILLA) ||
				has_piece(game.sa.where, CARTELS, GUERRILLA)
			)
				view.actions.flip = 1
			else
				view.actions.flip = 0
		}

		// Govt, targeted cube
		else if (game.sa.targeted & (1 << GOVT)) {
			gen_piece_in_space(game.sa.where, GOVT, TROOPS)
			gen_piece_in_space(game.sa.where, GOVT, POLICE)
		}

		// Not govt, targeted guerrilla
		else {
			gen_piece_in_space(game.sa.where, FARC, GUERRILLA)
			gen_piece_in_space(game.sa.where, AUC, GUERRILLA)
		}

		if (did_maximum_damage(game.sa.targeted))
			view.actions.next = 1
		else
			view.actions.next = 0
	},
	piece(p) {
		//push_undo()
		remove_piece(p)
		update_control()
		if (game.sa.targeted || is_base(p)) {
			resume_bribe()
			transfer_or_remove_shipments()
		} else {
			game.sa.targeted |= target_faction(p)
		}

		// TODO: Contraband
		transfer_or_remove_shipments()
	},
	flip() {
		//push_undo()
		game.state = "bribe_flip"
		game.sa.count = 2
		game.sa.piece = -1
	},
	next() {
		resume_bribe()
		transfer_or_remove_shipments()
	},
}

states.bribe_flip = {
	prompt() {
		view.prompt = `Bribe: Flip up to ${game.sa.count} Guerrillas.`

		gen_piece_in_space(game.sa.where, FARC, GUERRILLA)
		gen_piece_in_space(game.sa.where, AUC, GUERRILLA)
		gen_piece_in_space(game.sa.where, CARTELS, GUERRILLA) // TODO: can flip own?

		// Don't flip same piece twice...
		if (game.sa.piece >= 0 && view.actions.piece)
			set_delete(view.actions.piece, game.sa.piece)

		// No need to do maximum damage...
		view.actions.next = 1
	},
	piece(p) {
		if (is_underground(p))
			set_active(p)
		else
			set_underground(p)
		game.sa.piece = p
		let n = count_pieces(game.sa.where, FARC, GUERRILLA) +
			count_pieces(game.sa.where, AUC, GUERRILLA) +
			count_pieces(game.sa.where, CARTELS, GUERRILLA) // TODO: can flip own?
		if (--game.sa.count === 0 || n === 1)
			resume_bribe()
	},
	next() {
		//push_undo()
		resume_bribe()
	},
}

// === PROPAGANDA ===

function goto_propaganda_card() {
	throw "TODO"
}

// === EVENTS ===

states.event = {
	prompt() {
		let c = this_card()
		view.prompt = `${data.card_title[c]}: Choose effect.`
		view.actions.shaded = 1
		view.actions.unshaded = 1
	},
	shaded() {
		execute_shaded_event()
	},
	unshaded() {
		execute_unshaded_event()
	},
}

function execute_event() {
	let c = this_card()
	log(`C${c} - Event`)

	log("TODO")
	resume_event_card()
}

function execute_unshaded_event() {
	let c = this_card()
	log(`C${c} - Unshaded`)
	log(data.card_flavor[c] + ".")

	if (set_has(capability_events, c)) {
		set_add(game.capabilities, c)
		resume_event_card()
		return
	}

	log("TODO")
	resume_event_card()
}

function execute_shaded_event() {
	let c = this_card()
	log(`C${c} - Shaded`)
	log(data.card_flavor_shaded[c] + ".")

	if (c === MOM_SENADO_CAMARA) {
		log("No Sweep or Assault against " + faction_name[game.current] + " until next Propaganda.")
		game.senado = game.current
	}

	if (c === EVT_DARIEN)
		set_add(game.capabilities, EVT_DARIEN)
	if (c === EVT_SUCUMBIOS)
		set_add(game.capabilities, EVT_SUCUMBIOS)

	if (set_has(capability_events, c)) {
		set_add(game.capabilities, -c)
		resume_event_card()
		return
	}

	if (set_has(momentum_events, c)) {
		set_add(game.momentum, c)
		resume_event_card()
		return
	}

	log("TODO")
	resume_event_card()
}

// === GAME OVER ===

function goto_game_over(result, victory) {
	game = { ...game } // make a copy so we can add properties!
	game.state = "game_over"
	game.current = -1
	game.active = "None"
	game.result = result
	game.victory = victory
	log_h1("Game Over")
	log(game.victory)
	return true
}

states.game_over = {
	get inactive() {
		return game.victory
	},
	prompt() {
		view.prompt = game.victory
	},
}

// === UNCOMMON TEMPLATE ===

function log_br() {
	if (game.log.length > 0 && game.log[game.log.length - 1] !== "")
		game.log.push("")
}

function log(msg) {
	game.log.push(msg)
}

function logi(msg) {
	game.log.push(">" + msg)
}

function log_h1(msg) {
	log_br()
	log(".h1 " + msg)
	log_br()
}

function log_h2(msg) {
	log_br()
	log(".h2 " + msg)
	log_br()
}

function log_h3(msg) {
	log_br()
	log(".h3 " + msg)
}

function log_h4(msg) {
	log_br()
	log(".h4 " + msg)
}

function gen_action(action, argument) {
	if (!(action in view.actions))
		view.actions[action] = []
	set_add(view.actions[action], argument)
}

function gen_action_piece(p) {
	gen_action("piece", p)
}

function gen_action_space(s) {
	gen_action("space", s)
}

function gen_action_resources(faction) {
	gen_action("resources", faction)
}

function gen_action_shipment(sh) {
	gen_action("shipment", sh)
}

function is_current_role(role) {
	switch (role) {
		case NAME_GOVT_AUC:
			return game.current === GOVT || game.current === AUC
		case NAME_FARC_CARTELS:
			return game.current === FARC || game.current === CARTELS
		case NAME_AUC_CARTELS:
			return game.current === AUC || game.current === CARTELS
		case NAME_GOVT:
			return game.current === GOVT
		case NAME_FARC:
			return game.current === FARC
		case NAME_AUC:
			return game.current === AUC
		case NAME_CARTELS:
			return game.current === CARTELS
	}
	return false
}

exports.view = function (state, role) {
	load_game(state)

	let this_card = game.deck[0]
	let next_card = game.deck[1]
	let deck_size = Math.max(0, game.deck.length - 2)

	view = {
		prompt: null,
		actions: null,
		log: game.log,

		scenario: game.scenario,
		current: game.current,
		deck: [ this_card, next_card, deck_size ],
		president: game.president,
		senado: game.senado,
		aid: game.aid,
		cylinder: game.cylinder,
		resources: game.resources,
		shipments: game.shipments,
		pieces: game.pieces,
		underground: game.underground,
		govt_control: game.govt_control,
		farc_control: game.farc_control,
		support: game.support,
		farc_zones: game.farc_zones,
		capabilities: game.capabilities,
		momentum: game.momentum,
		terror: game.terror,
		sabotage: game.sabotage,
	}

	if (game.state === "game_over") {
		view.prompt = game.victory
	} else if (!is_current_role(role)) {
		let inactive = states[game.state].inactive || game.state
		view.prompt = `Waiting for ${faction_name[game.current]} \u2014 ${inactive}.`
	} else {
		view.actions = {}
		view.who = game.who

		if (states[game.state])
			states[game.state].prompt()
		else
			view.prompt = "Unknown state: " + game.state

		if (!states[game.state].disable_negotiation) {
			view.actions.remove_pieces = 1
			view.actions.ask_resources = 1
			if (game.resources[game.current] > 0)
				view.actions.transfer_resources = 1
			else
				view.actions.transfer_resources = 0
			if (can_transfer_any_shipment())
				view.actions.transfer_shipment = 1
			else
				view.actions.transfer_shipment = 0
			if (can_ask_shipment())
				view.actions.ask_shipment = 1
			else
				view.actions.ask_shipment = 0
		}

		if (view.actions.undo === undefined) {
			if (game.undo && game.undo.length > 0)
				view.actions.undo = 1
			else
				view.actions.undo = 0
		}
	}

	save_game()
	return view
}

exports.action = function (state, role, action, arg) {
	load_game(state)

	// XXX - don't allow adding properties
	// Object.seal(game) // XXX: don't allow adding properties

	let S = states[game.state]
	if (S && action in S) {
		S[action](arg)
	} else {
		if (action === "undo" && game.undo && game.undo.length > 0)
			pop_undo()
		else if (action === "remove_pieces")
			action_remove_pieces()
		else if (action === "ask_resources")
			action_ask_resources()
		else if (action === "ask_shipment")
			action_ask_shipment()
		else if (action === "transfer_resources")
			action_transfer_resources()
		else if (action === "transfer_shipment")
			action_transfer_shipment()
		else if (game.op && action in special_activities)
			special_activities[action](arg)
		else
			throw new Error("Invalid action: " + action)
	}
	return save_game()
}

exports.is_checkpoint = function (a, b) {
	return a.turn !== b.turn
}

// === COMMON LIBRARY ===

function clear_undo() {
	if (game.undo.length > 0)
		game.undo = []
}

function push_undo() {
	let copy = {}
	for (let k in game) {
		let v = game[k]
		if (k === "undo")
			continue
		else if (k === "log")
			v = v.length
		else if (typeof v === "object" && v !== null)
			v = object_copy(v)
		copy[k] = v
	}
	game.undo.push(copy)
}

function pop_undo() {
	let save_log = game.log
	let save_undo = game.undo
	game = save_undo.pop()
	save_log.length = game.log
	game.log = save_log
	game.undo = save_undo
}

function random(range) {
	// An MLCG using integer arithmetic with doubles.
	// https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf
	// m = 2**35 − 31
	return (game.seed = (game.seed * 200105) % 34359738337) % range
}

function shuffle(list) {
	// Fisher-Yates shuffle
	for (let i = list.length - 1; i > 0; --i) {
		let j = random(i + 1)
		let tmp = list[j]
		list[j] = list[i]
		list[i] = tmp
	}
}

// Fast deep copy for objects without cycles
function object_copy(original) {
	if (Array.isArray(original)) {
		let n = original.length
		let copy = new Array(n)
		for (let i = 0; i < n; ++i) {
			let v = original[i]
			if (typeof v === "object" && v !== null)
				copy[i] = object_copy(v)
			else
				copy[i] = v
		}
		return copy
	} else {
		let copy = {}
		for (let i in original) {
			let v = original[i]
			if (typeof v === "object" && v !== null)
				copy[i] = object_copy(v)
			else
				copy[i] = v
		}
		return copy
	}
}

// Array remove and insert (faster than splice)

function array_remove_item(array, item) {
	let n = array.length
	for (let i = 0; i < n; ++i)
		if (array[i] === item)
			return array_remove(array, i)
}

function array_remove(array, index) {
	let n = array.length
	for (let i = index + 1; i < n; ++i)
		array[i - 1] = array[i]
	array.length = n - 1
}

function array_insert(array, index, item) {
	for (let i = array.length; i > index; --i)
		array[i] = array[i - 1]
	array[index] = item
}

function array_remove_pair(array, index) {
	let n = array.length
	for (let i = index + 2; i < n; ++i)
		array[i - 2] = array[i]
	array.length = n - 2
}

function array_insert_pair(array, index, key, value) {
	for (let i = array.length; i > index; i -= 2) {
		array[i] = array[i - 2]
		array[i + 1] = array[i - 1]
	}
	array[index] = key
	array[index + 1] = value
}

// Set as plain sorted array

function set_has(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return true
	}
	return false
}

function set_add(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return
	}
	array_insert(set, a, item)
}

function set_delete(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else {
			array_remove(set, m)
			return
		}
	}
}

function set_toggle(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else {
			array_remove(set, m)
			return
		}
	}
	array_insert(set, a, item)
}

// Map as plain sorted array of key/value pairs

function map_has(map, key) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m << 1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return true
	}
	return false
}

function map_get(map, key, missing) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m << 1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return map[(m << 1) + 1]
	}
	return missing
}

function map_set(map, key, value) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m << 1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else {
			map[(m << 1) + 1] = value
			return
		}
	}
	array_insert_pair(map, a << 1, key, value)
}

function map_delete(map, item) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m << 1]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else {
			array_remove_pair(map, m << 1)
			return
		}
	}
}
