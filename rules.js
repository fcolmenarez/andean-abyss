"use strict"

// TODO: game.memory instead of president/aid/cylinder/resources/samper/pieces/

// TODO: op prompt - show if "Limited" and/or "Free"
// TODO: sweep can only move cubes once

// TODO: rules material - reference 6.3.3 Drug Profits to 5.2.2 should be 4.5.3

// TODO: Automatic "All done" message. (limited / no more resources / no more available options).
// TODO: auto-next at end of Special Activity / operation space ?
// TODO: resume_...activity - end automatically when no more possible
// TODO: clean up init_free_operation and transitions
// OP in a space -> next() transition handler to deal with ops/events/elite-backing in a common way

// TODO: All - Ecuador and Panama stacking for place/move

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

const PROPAGANDA = 73

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

const piece_type_name = [ "Base", "Guerrilla", "Troops", "Police" ]
const piece_name = [
	[ "Govt Base", null, "Troops", "Police" ],
	[ "FARC Base", "FARC Guerrilla" ],
	[ "AUC Base", "AUC Guerrilla" ],
	[ "Cartels Base", "Cartels Guerrilla" ],
]

const space_name = data.space_name

const first_piece = data.first_piece
const last_piece = data.last_piece
const all_first_piece = 0
const all_last_piece = 152

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

// LoCs
const CUCUTA_AYACUCHO = data.space_name.indexOf("Cúcuta / Ayacucho")
const CUCUTA_ARAUCA = data.space_name.indexOf("Cúcuta / Arauca")
const PASTO_TUMACO = data.space_name.indexOf("Pasto / Tumaco")
const CALI_BUENAVENTURA = data.space_name.indexOf("Cali / Buenaventura")
const CARTAGENA_SINCELEJO = data.space_name.indexOf("Cartagena / Sincelejo")
const SANTA_MARTA_CARTAGENA = data.space_name.indexOf("Santa Marta / Cartagena")

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

		current: 0,
		state: null,

		op: null,
		sa: null,
		vm: null,

		// TODO: pack into one memory array
		scenario: 4,
		president: 0,
		senado: 0,
		aid: 0,
		marked: 0,
		farc_control: 0,
		govt_control: 0,
		cylinder: [ ELIGIBLE, ELIGIBLE, ELIGIBLE, ELIGIBLE ],
		resources: [ 0, 0, 0, 0 ],
		shipments: [ 0, 0, 0, 0 ],
		pieces: Array(153).fill(AVAILABLE),
		underground: [ 0, 0, 0, 0 ],
		support: Array(23).fill(NEUTRAL),

		deck: [],
		momentum: [],
		capabilities: [], // positive = unshaded, negative = shaded
		farc_zones: [],
		terror: [],
		sabotage: [],

		// Dynamically added when needed:
		// transfer: null,
		// propaganda: 0,
		// redeploy: -1,
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
			pile.push(PROPAGANDA)
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
		if (piece_space(p) < 0) {
			set_piece_space(p, where)
			--count
		}
	}
}

function setup_remove_piece(faction, type, count, where) {
	for (let p = first_piece[faction][type]; count > 0; ++p) {
		if (piece_space(p) === where) {
			set_piece_space(p, AVAILABLE)
			--count
		}
	}
}

// === MISC PIECE QUERIES ===

function piece_space(p) {
	return game.pieces[p]
}

function set_piece_space(p, s) {
	game.pieces[p] = s
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
	throw "IMPOSSIBLE"
}

function target_faction(p) {
	return 1 << piece_faction(p)
}

function is_enemy_piece(p) {
	return piece_faction(p) !== game.current
}

function is_piece(p, faction, type) {
	return p >= first_piece[faction][type] && p <= last_piece[faction][type]
}

function is_govt_base(p) { return is_piece(p, GOVT, BASE) }
function is_troops(p) { return is_piece(p, GOVT, TROOPS) }
function is_police(p) { return is_piece(p, GOVT, POLICE) }
function is_cube(p) { return is_troops(p) || is_police(p) }
function is_govt_piece(p) { return is_govt_base(p) || is_cube(p) }

function is_farc_base(p) { return is_piece(p, FARC, BASE) }
function is_farc_guerrilla(p) { return is_piece(p, FARC, GUERRILLA) }
function is_farc_piece(p) { return is_farc_base(p) || is_farc_guerrilla(p) }

function is_auc_base(p) { return is_piece(p, AUC, BASE) }
function is_auc_guerrilla(p) { return is_piece(p, AUC, GUERRILLA) }
function is_auc_piece(p) { return is_auc_base(p) || is_auc_guerrilla(p) }

function is_cartels_base(p) { return is_piece(p, CARTELS, BASE) }
function is_cartels_guerrilla(p) { return is_piece(p, CARTELS, GUERRILLA) }
function is_cartels_piece(p) { return is_cartels_base(p) || is_cartels_guerrilla(p) }

function is_faction_guerrilla(p, faction) {
	return is_piece(p, faction, GUERRILLA)
}

function is_any_base(p) {
	return is_govt_base(p) || is_farc_base(p) || is_auc_base(p) || is_cartels_base(p)
}

function is_any_guerrilla(p) {
	return is_farc_guerrilla(p) || is_auc_guerrilla(p) || is_cartels_guerrilla(p)
}

function is_insurgent_piece(p) {
	return is_farc_piece(p) || is_auc_piece(p) || is_cartels_piece(p)
}

function is_active_guerrilla(p, faction) {
	return is_piece(p, faction, GUERRILLA) && is_active(p)
}

function is_underground_guerrilla(p, faction) {
	return is_piece(p, faction, GUERRILLA) && is_underground(p)
}

// === MISC SPACE + PIECE QUERIES ===

function count_pieces(s, faction, type) {
	let first = first_piece[faction][type]
	let last = last_piece[faction][type]
	let n = 0
	for (let p = first; p <= last; ++p)
		if (piece_space(p) === s)
			++n
	return n
}

function count_faction_pieces(s, faction) {
	switch (faction) {
		case GOVT:
			return count_pieces(s, GOVT, BASE) + count_pieces(s, GOVT, TROOPS) + count_pieces(s, GOVT, POLICE)
		case FARC:
			return count_pieces(s, FARC, BASE) + count_pieces(s, FARC, GUERRILLA)
		case AUC:
			return count_pieces(s, AUC, BASE) + count_pieces(s, AUC, GUERRILLA)
		case CARTELS:
			return count_pieces(s, CARTELS, BASE) + count_pieces(s, CARTELS, GUERRILLA)
	}
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
	return count_pieces(s, GOVT, TROOPS) + count_pieces(s, GOVT, POLICE)
}

function count_guerrillas(s) {
	return (
		count_pieces(s, FARC, GUERRILLA) +
		count_pieces(s, AUC, GUERRILLA) +
		count_pieces(s, CARTELS, GUERRILLA)
	)
}

function count_faction_underground_guerrillas(s, faction) {
	let first = first_piece[faction][GUERRILLA]
	let last = last_piece[faction][GUERRILLA]
	let n = 0
	for (let p = first; p <= last; ++p)
		if (piece_space(p) === s && is_underground(p))
			++n
	return n
}

function count_any_underground_guerrillas(s) {
	return (
		count_faction_underground_guerrillas(s, FARC) +
		count_faction_underground_guerrillas(s, AUC) +
		count_faction_underground_guerrillas(s, CARTELS)
	)
}

function find_piece(s, faction, type) {
	let first = first_piece[faction][type]
	let last = last_piece[faction][type]
	for (let p = first; p <= last; ++p)
		if (piece_space(p) === s)
			return p
	return -1
}

function has_piece(s, faction, type) {
	let first = first_piece[faction][type]
	let last = last_piece[faction][type]
	for (let p = first; p <= last; ++p)
		if (piece_space(p) === s)
			return true
	return false
}

function has_active_guerrilla(s, faction) {
	let first = first_piece[faction][GUERRILLA]
	let last = last_piece[faction][GUERRILLA]
	for (let p = first; p <= last; ++p)
		if (piece_space(p) === s && !is_underground(p))
			return true
	return false
}

function has_underground_guerrilla(s, faction) {
	let first = first_piece[faction][GUERRILLA]
	let last = last_piece[faction][GUERRILLA]
	for (let p = first; p <= last; ++p)
		if (piece_space(p) === s && is_underground(p))
			return true
	return false
}

function has_any_guerrilla(s) {
	return (
		has_piece(s, FARC, GUERRILLA) ||
		has_piece(s, AUC, GUERRILLA) ||
		has_piece(s, CARTELS, GUERRILLA)
	)
}

function has_any_underground_guerrilla(s) {
	return (
		has_underground_guerrilla(s, FARC) ||
		has_underground_guerrilla(s, AUC) ||
		has_underground_guerrilla(s, CARTELS)
	)
}

function has_govt_base(s) { return has_piece(s, GOVT, BASE) }
function has_troops(s) { return has_piece(s, GOVT, TROOPS) }
function has_police(s) { return has_piece(s, GOVT, POLICE) }
function has_cube(s) { return has_piece(s, GOVT, TROOPS) || has_piece(s, GOVT, POLICE) }
function has_govt_piece(s) { return has_piece(s, GOVT, BASE) || has_piece(s, GOVT, TROOPS) || has_piece(s, GOVT, POLICE) }

function has_farc_guerrilla(s) { return has_piece(s, FARC, GUERRILLA) }
function has_farc_piece(s) { return has_piece(s, FARC, BASE) || has_piece(s, FARC, GUERRILLA) }

function has_auc_piece(s) { return has_piece(s, AUC, BASE) || has_piece(s, AUC, GUERRILLA) }

function has_cartels_base(s) { return has_piece(s, CARTELS, BASE) }
function has_cartels_guerrilla(s) { return has_piece(s, CARTELS, GUERRILLA) }
function has_cartels_piece(s) { return has_piece(s, CARTELS, BASE) || has_piece(s, CARTELS, GUERRILLA) }

function has_faction_piece(s, faction) {
	if (faction === GOVT)
		return has_piece(s, GOVT, BASE) || has_piece(s, GOVT, TROOPS) || has_piece(s, GOVT, POLICE)
	return has_piece(s, faction, BASE) || has_piece(s, faction, GUERRILLA)
}

function is_empty(s) {
	return !(
		has_faction_piece(s, GOVT) ||
		has_faction_piece(s, FARC) ||
		has_faction_piece(s, AUC) ||
		has_faction_piece(s, CARTELS)
	)
}

function has_enemy_piece(s) {
	if (game.current !== GOVT && has_faction_piece(s, GOVT))
		return true
	if (game.current !== FARC && has_faction_piece(s, FARC))
		return true
	if (game.current !== AUC && has_faction_piece(s, AUC))
		return true
	if (game.current !== CARTELS && has_faction_piece(s, CARTELS))
		return true
	return false
}

// === MISC SPACE QUERIES ===

function is_adjacent(a, b) {
	return set_has(data.spaces[a].adjacent, b)
}

function is_coastal_space(s) {
	return (
		s === CESAR ||
		s === SANTA_MARTA ||
		s === ATLANTICO ||
		s === CARTAGENA ||
		s === SINCELEJO ||
		s === CHOCO ||
		s === NARINO ||
		s === PANAMA ||
		s === ECUADOR ||
		s === PASTO_TUMACO ||
		s === CALI_BUENAVENTURA ||
		s === CARTAGENA_SINCELEJO ||
		s === SANTA_MARTA_CARTAGENA
	)
}

function is_next_to_ecuador(s) {
	return (
		s === NARINO ||
		s === PASTO ||
		s === PUTUMAYO ||
		s === ARAUCA ||
		s === PASTO_TUMACO
	)
}

function is_next_to_venezuela(s) {
	return (
		s === CESAR ||
		s === CUCUTA ||
		s === SANTANDER ||
		s === ARAUCA ||
		s === VICHADA ||
		s === GUAINIA ||
		s === CUCUTA_AYACUCHO ||
		s === CUCUTA_ARAUCA
	)
}

function is_space(s) {
	if (s === PANAMA)
		return set_has(game.capabilities, EVT_DARIEN)
	if (s === ECUADOR)
		return set_has(game.capabilities, EVT_SUCUMBIOS)
	return true
}

function is_dept(s) {
	if (s === PANAMA)
		return set_has(game.capabilities, EVT_DARIEN)
	if (s === ECUADOR)
		return set_has(game.capabilities, EVT_SUCUMBIOS)
	return s >= first_dept && s <= last_dept
}

function is_city(s) {
	return s >= first_city && s <= last_city
}

function is_loc(s) {
	return s >= first_loc && s <= last_loc
}

function is_pop(s) {
	return s >= first_pop && s <= last_pop
}

function is_pipeline(s) {
	return data.spaces[s].type === "pipeline"
}

function is_mountain(s) {
	return data.spaces[s].type === "mountain"
}

function is_forest(s) {
	return data.spaces[s].type === "forest"
}

function is_city_or_loc(s) {
	return is_city(s) || is_loc(s)
}

function is_zero_pop_dept(s) {
	return !is_pop(s) && is_dept(s)
}

function is_zero_pop_forest(s) {
	return !is_pop(s) && is_forest(s)
}

// === MISC DYNAMIC QUERIES ===

function has_momentum(c) {
	return set_has(game.momentum, c)
}

function has_capability(c) {
	return set_has(game.capabilities, c)
}

function has_shaded_capability(c) {
	return set_has(game.capabilities, -c)
}

function is_farc_zone(s) {
	return set_has(game.farc_zones, s)
}

function has_govt_control(s) {
	return (s <= last_dept) && game.govt_control & (1 << s)
}

function has_farc_control(s) {
	return (s <= last_dept) && game.farc_control & (1 << s)
}

function has_auc_control(s) {
	// AUC outnumber all other forces
	let g = count_faction_pieces(s, GOVT)
	let f = count_faction_pieces(s, FARC)
	let a = count_faction_pieces(s, AUC)
	let c = count_faction_pieces(s, CARTELS)
	return a > g + f + c
}

function is_neutral(s) {
	return is_pop(s) && game.support[s] === NEUTRAL
}

function is_passive_support(s) {
	return is_pop(s) && game.support[s] === PASSIVE_SUPPORT
}

function is_passive_opposition(s) {
	return is_pop(s) && game.support[s] === PASSIVE_OPPOSITION
}

function is_active_support(s) {
	return is_pop(s) && game.support[s] === ACTIVE_SUPPORT
}

function is_active_opposition(s) {
	return is_pop(s) && game.support[s] === ACTIVE_OPPOSITION
}

function is_support(s) {
	return is_pop(s) && game.support[s] > 0
}

function is_opposition(s) {
	return is_pop(s) && game.support[s] < 0
}

function has_sabotage(s) {
	return set_has(game.sabotage, s)
}

function has_terror(s) {
	return map_get(game.terror, s, 0) > 0
}

function count_terror(s) {
	return map_get(game.terror, s, 0)
}

function count_terror_and_sabotage() {
	let n = (game.sabotage.length >> 1)
	for (let i = 1; i < game.terror.length; i += 2)
		n += game.terror[i]
	return n
}

function is_unsabotaged_pipeline(s) {
	return is_pipeline(s) && !has_sabotage(s)
}

// === MISC COMPOUND QUERIES ==

function is_possible_farc_zone(s) {
	if (is_mountain(s) && !is_farc_zone(s)) {
		let max = 0
		for (let x = first_dept; x <= last_dept; ++x) {
			if (is_mountain(x) && !is_farc_zone(x)) {
				let xn = count_pieces(x, FARC, BASE) + count_pieces(x, FARC, GUERRILLA)
				if (xn > max)
					max = xn
			}
		}
		return count_pieces(s, FARC, BASE) + count_pieces(s, FARC, GUERRILLA) === max
	}
	return false
}

function is_highest_value_pipeline_without_cubes(s) {
	let max = 0
	if (has_cube(s))
		return false
	for (let x = first_loc; x <= last_loc; ++x) {
		if (is_unsabotaged_pipeline(x) && !has_cube(x)) {
			let e = data.spaces[x].econ
			if (e > max)
				max = e
		}
	}
	return data.spaces[s].econ === max
}

function faction_with_most_pieces(s) {
	let g = count_faction_pieces(s, GOVT)
	let f = count_faction_pieces(s, FARC)
	let a = count_faction_pieces(s, AUC)
	let c = count_faction_pieces(s, CARTELS)
	if (g >= f && g >= a && g >= c)
		return GOVT
	if (f > g && f > a && f > c)
		return FARC
	if (a > g && a > f && a > c)
		return AUC
	if (c > g && c > f && c > a)
		return CARTELS
	return GOVT
}

function is_any_pipeline_sabotaged() {
	for (let s of game.sabotage)
		if (is_pipeline(s))
			return true
	return false
}

function is_adjacent_to_3econ_loc(s) {
	for (let x of data.spaces[s].adjacent)
		if (is_loc(x) && data.spaces[x].econ === 3)
			return true
	return false
}

function is_adjacent_to_3econ_pipeline(s) {
	for (let x of data.spaces[s].adjacent)
		if (is_pipeline(x) && data.spaces[x].econ === 3)
			return true
	return false
}

function is_with_or_adjacent_to_mark(s, list) {
	for (let x of list)
		if (x === s || is_adjacent(x, s))
			return true
	return false
}

function is_with_or_adjacent_to_farc_guerrilla(s) {
	if (has_farc_guerrilla(s))
		return true
	for (let x of data.spaces[s].adjacent)
		if (has_farc_guerrilla(x))
			return true
	return false
}

function is_adjacent_to_support(s) {
	for (let x of data.spaces[s].adjacent)
		if (is_support(x))
			return true
	return false
}

function is_redeploy_troops_space(s) {
	if (has_govt_control(s) && (is_city(s) || has_govt_base(s)))
		return true
	if (s === BOGOTA) {
		for (let x = first_city; x <= last_city; ++x)
			if (has_govt_control(x))
				return false
		return true
	}
	return false
}

function is_redeploy_police_space(s) {
	return is_loc(s) || has_govt_control(s)
}

function is_within_adjacent_depts(s, here, depth) {
	for (let next of data.spaces[here].adjacent) {
		if (is_dept(next)) {
			if (next === s)
				return true
			if (depth > 1 && is_within_adjacent_depts(s, next, depth - 1))
				return true
		}
	}
	return false
}

// === MISC STATE COMMANDS ==

function update_control() {
	game.govt_control = 0
	game.farc_control = 0
	for (let s = first_space; s <= last_dept; ++s) {
		let g = count_faction_pieces(s, GOVT)
		let f = count_faction_pieces(s, FARC)
		let a = count_faction_pieces(s, AUC)
		let c = count_faction_pieces(s, CARTELS)
		if (g > a + c + f)
			game.govt_control |= (1 << s)
		else if (f > g + a + c)
			game.farc_control |= (1 << s)
	}
}

function add_resources(faction, n) {
	game.resources[faction] = Math.max(0, Math.min(99, game.resources[faction] + n))
}

function add_aid(n) {
	game.aid = Math.max(0, Math.min(29, game.aid + n))
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

function is_active(p) {
	return !is_underground(p)
}

function move_piece(p, s) {
	set_piece_space(p, s)
}

function place_piece(p, s) {
	set_underground(p)
	set_piece_space(p, s)
}

function remove_piece(p) {
	if (is_any_guerrilla(p)) {
		drop_held_shipments(p)
		set_underground(p)
	}
	set_piece_space(p, AVAILABLE)
}

function place_terror(s) {
	if (count_terror_and_sabotage() < 40)
		map_set(game.terror, s, map_get(game.terror, s, 0) + 1)
}

function remove_terror(s) {
	let n = map_get(game.terror, s, 0)
	if (n > 1)
		map_set(game.terror, s, n - 1)
	else
		map_delete(game.terror, s)
}

function place_sabotage(s) {
	if (count_terror_and_sabotage() < 40)
		set_add(game.sabotage, s)
}

function remove_sabotage(s) {
	set_delete(game.sabotage, s)
}

// === SHIPMENT QUERIES AND COMMANDS ===

function place_shipment(sh, p) {
	game.shipments[sh] = p << 2
}

function remove_shipment(sh) {
	game.shipments[sh] = 0
}

function drop_shipment(sh) {
	let p = game.shipments[sh] >> 2
	let s = piece_space(p)
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

function is_shipment_held_in_space(sh, s) {
	return is_shipment_held(sh) && piece_space(get_held_shipment_piece(sh)) === s
}

function is_shipment_held_by_faction(sh, f) {
	return is_shipment_held(sh) && get_held_shipment_faction(sh) === f
}

function is_shipment_held_by_faction_in_space(sh, f, s) {
	return is_shipment_held(sh) && get_held_shipment_faction(sh) === f && piece_space(get_held_shipment_piece(sh)) == s
}

function is_any_shipment_held_in_space(s) {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_held_in_space(sh, s))
			return true
	return false
}

function is_any_shipment_held_by_faction_in_space(f, s) {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_held_by_faction_in_space(sh, f, s))
			return true
	return false
}

function is_any_shipment_held_by_faction(f) {
	for (let sh = 0; sh < 4; ++sh)
		if (is_shipment_held_by_faction(sh, f))
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
			auto_transfer_dropped_shipment_imp(sh)
}

function auto_transfer_dropped_shipment_imp(sh) {
	// Transfer shipment automatically if there's only one faction present.
	// NOTE: Don't transfer to own faction automatically,
	let s = get_dropped_shipment_space(sh)
	let a = find_piece(s, FARC, GUERRILLA)
	let b = find_piece(s, AUC, GUERRILLA)
	let c = find_piece(s, CARTELS, GUERRILLA)
	if (a >= 0 && b < 0 && c < 0)
		place_shipment(sh, a)
	if (a < 0 && b >= 0 && c < 0)
		place_shipment(sh, b)
	if (a < 0 && b < 0 && c >= 0)
		place_shipment(sh, c)
}

// === ITERATORS AND ACTION GENERATORS ===

function can_stack_base(s) {
	// TODO: faction for ECUADOR check
	return count_bases(s) < 2
}

function can_stack_piece(s, faction, type) {
	if (faction === GOVT)
		if (is_farc_zone(s))
			return false
	if (type === BASE)
		if (!can_stack_base(s))
			return false
	if (s === PANAMA)
		return set_has(game.capabilities, EVT_DARIEN)
	if (s === ECUADOR) {
		if (set_has(game.capabilities, EVT_SUCUMBIOS))
			return count_faction_pieces(s, faction) < 2
		else
			return false
	}
	return true
}

function can_place_any_available_piece(s, faction) {
	if (can_stack_base(s) && has_piece(AVAILABLE, faction, BASE))
		return true
	return can_stack_piece(s, faction, GUERRILLA) && has_piece(AVAILABLE, faction, GUERRILLA)
}

function did_maximum_damage(targeted) {
	if (view.actions.piece)
		for (let p of view.actions.piece)
			if (targeted & target_faction(p))
				return false
	return true
}

function for_each_piece(faction, type, f) {
	let p0 = first_piece[faction][type]
	let p1 = last_piece[faction][type]
	for (let p = p0; p <= p1; ++p)
		f(p, piece_space(p))
}

function gen_piece_in_space(space, faction, type) {
	for_each_piece(faction, type, (p, s) => {
		if (s === space)
			gen_action_piece(p)
	})
}

function gen_place_piece(space, faction, type) {
	let p0 = first_piece[faction][type]
	let p1 = last_piece[faction][type]
	if (type === BASE && !can_stack_base(space))
		return true
	let can_place = false
	for (let p = p0; p <= p1; ++p) {
		if (piece_space(p) === AVAILABLE) {
			gen_action_piece(p)
			can_place = true
			if (type === BASE)
				break
		}
	}
	if (!can_place && faction === game.current) {
		for (let p = p0; p <= p1; ++p)
			if (piece_space(p) !== space || (type === GUERRILLA && !is_underground(p)))
				gen_action_piece(p)
	}
	return !can_place
}

function gen_underground_guerrillas(s, faction) {
	for_each_piece(faction, GUERRILLA, p => {
		if (piece_space(p) === s)
			if (is_underground(p))
				gen_action_piece(p)
	})
}

function gen_active_guerrillas(s, faction) {
	for_each_piece(faction, GUERRILLA, p => {
		if (piece_space(p) === s)
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
			if (piece_space(p) >= 0)
				gen_action_piece(p)
		if (game.current === GOVT) {
			for (let p = first_piece[game.current][TROOPS]; p <= last_piece[game.current][TROOPS]; ++p)
				if (piece_space(p) >= 0)
					gen_action_piece(p)
			for (let p = first_piece[game.current][POLICE]; p <= last_piece[game.current][POLICE]; ++p)
				if (piece_space(p) >= 0)
					gen_action_piece(p)
		} else {
			for (let p = first_piece[game.current][GUERRILLA]; p <= last_piece[game.current][GUERRILLA]; ++p)
				if (piece_space(p) >= 0)
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
		delete game.transfer
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
			let s = piece_space(p)
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
				let s = piece_space(p)
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
		let s = piece_space(p)
		view.selected_shipment = game.transfer.shipment
		view.prompt = `Negotiate: ${faction_name[game.transfer.current]} asked for Shipment in ${space_name[s]}.`
		gen_piece_in_space(s, game.transfer.current, GUERRILLA)
		view.actions.deny = 1
	},
	piece(p) {
		let s = piece_space(p)
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
		let s = piece_space(p)
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
			let s = piece_space(p)
			for_each_piece(game.current, GUERRILLA, (pp,ss) => {
				if (pp !== p && ss === s)
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
		let s = piece_space(p)
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
	delete game.transfer
}

// === SHIP FOR EXTRA LIMOP ===

states.ship = {
	prompt() {
		view.prompt = "Ship: Remove Shipment for a free, extra Limited Operation?"
		view.actions.skip = 1
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
	skip() {
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
		delete game.transfer
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

// === SEQUENCE OF PLAY ===

function this_card() {
	return game.deck[0]
}

function is_final_propaganda_card() {
	for (let i = 1; i < game.deck.length; ++i)
		if (game.deck[i] === PROPAGANDA)
			return false
	return true
}

function is_final_event_card() {
	if (game.deck[1] === PROPAGANDA) {
		for (let i = 2; i < game.deck.length; ++i)
			if (game.deck[i] === PROPAGANDA)
				return false
		return true
	}
	return false
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

function adjust_eligibility(faction) {
	if (game.cylinder[faction] === INELIGIBLE || game.cylinder[faction] === SOP_PASS)
		game.cylinder[faction] = ELIGIBLE
	else if (game.cylinder[faction] !== ELIGIBLE)
		game.cylinder[faction] = INELIGIBLE
	
	if (game.marked & (1 << faction))
		game.cylinder[faction] = INELIGIBLE
	if (game.marked & (16 << faction))
		game.cylinder[faction] = ELIGIBLE
}

function did_option(e) {
	return (
		game.cylinder[GOVT] === e ||
		game.cylinder[FARC] === e ||
		game.cylinder[AUC] === e ||
		game.cylinder[CARTELS] === e
	)
}

function move_cylinder_to_operation() {
	if (did_option(SOP_1ST_OP_ONLY))
		game.cylinder[game.current] = SOP_2ND_LIMOP
	else if (did_option(SOP_1ST_OP_AND_SA))
		game.cylinder[game.current] = SOP_2ND_LIMOP_OR_EVENT
	else if (did_option(SOP_1ST_EVENT))
		game.cylinder[game.current] = SOP_2ND_OP_AND_SA
	else
		game.cylinder[game.current] = SOP_1ST_OP_ONLY
}

function move_cylinder_to_special_activity() {
	if (game.cylinder[game.current] === SOP_1ST_OP_ONLY)
		game.cylinder[game.current] = SOP_1ST_OP_AND_SA
	if (game.op)
		game.op.ship = 0
}

function move_cylinder_to_event() {
	if (did_option(SOP_1ST_OP_AND_SA))
		game.cylinder[game.current] = SOP_2ND_LIMOP_OR_EVENT
	else
		game.cylinder[game.current] = SOP_1ST_EVENT
	game.op = null
}

function goto_card() {
	log_h1("C73")
	if (this_card() === PROPAGANDA)
		goto_propaganda_card()
	else
		resume_event_card()
}

function resume_event_card() {
	clear_undo()
	let did_1st = (did_option(SOP_1ST_OP_ONLY) || did_option(SOP_1ST_OP_AND_SA) || did_option(SOP_1ST_EVENT))
	let did_2nd = (did_option(SOP_2ND_LIMOP) || did_option(SOP_2ND_LIMOP_OR_EVENT) || did_option(SOP_2ND_OP_AND_SA))
	if (did_1st && did_2nd)
		end_card()
	else
		goto_eligible()
}

function end_card() {
	adjust_eligibility(GOVT)
	adjust_eligibility(FARC)
	adjust_eligibility(AUC)
	adjust_eligibility(CARTELS)
	game.marked = 0

	while (game.deck[0] === PROPAGANDA && game.deck[1] === PROPAGANDA) {
		log_h1("C73")
		log("Skipped.")
		array_remove(game.deck, 0)
	}

	clear_undo()
	array_remove(game.deck, 0)
	goto_card()
}

function goto_eligible(limited) {
	game.current = next_eligible_faction()
	if (game.current === null) {
		end_card()
	} else {
		game.state = "eligible"
		game.op = {
			limited: 0,
			free: 0,
			ship: 1,
			spaces: [],
			pieces: [],
		}
		if (is_final_event_card() || did_option(SOP_1ST_OP_ONLY) || did_option(SOP_1ST_OP_AND_SA)) {
			game.op.limited = 1
			game.sa = 0
		} else {
			game.sa = 1
		}
	}
}

states.eligible = {
	disable_negotiation: true,
	prompt() {
		if (did_option(SOP_1ST_OP_ONLY)) {
			view.prompt = `${data.card_title[this_card()]}: Limited Operation.`
			gen_any_operation()
		} else if (did_option(SOP_1ST_OP_AND_SA)) {
			view.prompt = `${data.card_title[this_card()]}: Limited Operation or Event.`
			gen_any_operation()
			gen_any_event()
		} else if (did_option(SOP_1ST_EVENT)) {
			view.prompt = `${data.card_title[this_card()]}: Operation.`
			gen_any_operation()
		} else {
			view.prompt = `${data.card_title[this_card()]}: Operation or Event.`
			gen_any_operation()
			gen_any_event()
		}
		view.actions.pass = 1
	},
	train: goto_train,
	patrol: goto_patrol,
	sweep: goto_sweep,
	assault: goto_assault,
	rally: goto_rally,
	march: goto_march,
	attack: goto_attack,
	terror: goto_terror,
	event() { execute_event(0) },
	unshaded() { execute_event(0) },
	shaded() { execute_event(1) },
	pass: goto_pass,
}

function end_operation() {
	if (game.op.ship && is_any_shipment_held())
		push_undo()
		game.state = "ship"
	} else {
		game.op = null
		if (game.vm)
			vm_next()
		else
			resume_event_card()
	}
}

function goto_pass() {
	push_undo()
	game.cylinder[game.current] = SOP_PASS
	log_h2(faction_name[game.current] + " - Pass")
	game.state = "pass"
}

states.pass = {
	prompt() {
		view.prompt = `Pass: ${faction_name[game.current]} +${game.current === GOVT ? 3 : 1} Resources.`
		gen_action_resources(game.current)
	},
	resources(_) {
		if (game.current === GOVT)
			add_resources(game.current, 3)
		else
			add_resources(game.current, 1)
		resume_event_card()
	},
}

// === OPERATIONS ===

function gen_any_operation() {
	if (game.current === GOVT) {
		view.actions.train = 1
		view.actions.patrol = 1
		if (is_final_event_card())
			view.actions.sweep = 0
		else
			view.actions.sweep = 1
		view.actions.assault = 1
	} else {
		view.actions.rally = 1
		if (is_final_event_card())
			view.actions.march = 0
		else
			view.actions.march = 1
		view.actions.attack = 1
		view.actions.terror = 1
	}
}

function gen_any_event() {
	if (set_has(single_events, this_card())) {
		view.actions.event = 1
	} else {
		view.actions.unshaded = 1
		view.actions.shaded = 1
	}
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

function init_free_operation(state) {
	game.state = state
	game.op = {
		free,
		limited,
		ship,
		spaces: [],
		targeted: 0,
		pieces: 0,
		count: 0,
	}
}

// OPERATION: TRAIN

function vm_free_train() {
	init_free_operation("train")
	game.op.limited = 1
	select_op_space(game.vm.s, 0)
	game.op.where = game.vm.s
	game.op.count = 6
	if (can_govt_train_place(game.op.where))
		game.state = "train_place"
	else
		game.state = "train_base_or_civic"
}

function goto_train() {
	push_undo()
	move_cylinder_to_operation()
	log_h3("Train")
	game.state = "train"
}

function can_govt_train_place(s) {
	return is_city(s) || has_piece(s, GOVT, BASE)
}

function can_govt_train_base(s) {
	return can_stack_base(s) && count_cubes(s) >= 3
}

function can_govt_train_civic(s) {
	return game.resources[GOVT] >= 3 && can_civic_action(s)
}

function can_govt_train(s) {
	return can_govt_train_place(s) || can_govt_train_base(s) || can_govt_train_civic(s)
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
			this.next()
	},
	next() {
		game.op.count = 0
		if (game.vm) {
			if (can_govt_train_base(game.vm.s) || can_govt_train_civic(game.vm.s))
				game.state = "train_base_or_civic"
			else
				end_operation()
			return
		}
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
			view.actions.end_train = 1
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
	end_train: end_operation,
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
				view.actions.end_train = 1
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
	end_train: end_operation,
}

states.train_civic = {
	prompt() {
		let res = game.resources[game.current]
		if (game.op.where < 0) {
			view.prompt = `Train: Buy Civic Action.`
			if (res >= 3) {
				for (let s = first_space; s <= last_dept; ++s)
					if (can_civic_action(s))
						if (is_selected_op_space(s) || can_select_op_space(3))
							gen_action_space(s)
			}
		} else {
			view.prompt = `Train: Buy Civic Action in ${space_name[game.op.where]}.`
			view.where = game.op.where
			if (res >= 3 && can_civic_action(game.op.where)) {
				gen_action_space(game.op.where)
			} else {
				view.prompt = `Train: All done.`
			}
			view.actions.end_train = 1
		}
	},
	space(s) {
		game.op.where = s
		add_resources(game.current, -3)
		game.support[game.op.where] += 1
	},
	end_train: end_operation,
}

// OPERATION: PATROL

function goto_patrol() {
	push_undo()
	move_cylinder_to_operation()
	log_h3("Patrol")
	goto_patrol1()
}

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
}

states.patrol_limop = {
	prompt() {
		view.prompt = "Patrol: Select destination City or LoC."

		gen_govt_special_activity()

		// TODO: check that destination can be reached by any cubes
		for (let s = first_city; s <= last_city; ++s)
			gen_action_space(s)
		for (let s = first_loc; s <= last_loc; ++s)
			gen_action_space(s)
	},
	space(s) {
		push_undo()

		log(`S${s}.`)

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

		gen_govt_special_activity()

		gen_patrol_move_limop(game.op.where)

		view.actions.next = 1
	},
	piece(p) {
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

		gen_govt_special_activity()

		if (game.op.who < 0) {
			for_each_piece(GOVT, TROOPS, p => {
				if (piece_space(p) >= 0 && !set_has(game.op.pieces, p))
					gen_action_piece(p)
			})
			for_each_piece(GOVT, POLICE, p => {
				if (piece_space(p) >= 0 && !set_has(game.op.pieces, p))
					gen_action_piece(p)
			})

		} else {
			gen_action_piece(game.op.who)
			gen_patrol_move(piece_space(game.op.who))
			let from = piece_space(game.op.who)
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

		gen_govt_special_activity()

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
		let s = piece_space(p)
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

		gen_govt_special_activity()

		view.actions.next = 1

		if (has_capability(CAP_METEORO)) {
			view.prompt = "Patrol: Free Assault in each LoC."
			for (let s = first_loc; s <= last_loc; ++s) {
				if (set_has(game.op.spaces, s))
					continue
				if (has_assault_target(s))
					gen_action_space(s)
			}
		}

		else {
			view.prompt = "Patrol: Free Assault in one LoC."
			if (game.op.limited) {
				for (let s of game.op.spaces)
					if (has_assault_target(s))
						gen_action_space(s)
			} else {
				for (let s = first_loc; s <= last_loc; ++s)
					if (has_assault_target(s))
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

		gen_govt_special_activity()

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
		game.op.targeted |= target_faction(p)
		remove_piece(p)
		update_control()

		if (--game.op.count === 0 || !has_assault_target(game.op.where)) {
			end_patrol_assault_space()
			transfer_or_drug_bust_shipments()
		}
	},
	next() {
		push_undo()
		end_patrol_assault_space()
		transfer_or_drug_bust_shipments()
	},
}

states.patrol_done = {
	prompt() {
		view.prompt = "Patrol: All done."
		view.actions.end_patrol = 1
	},
	end_patrol: end_operation,
}

// OPERATION: SWEEP

function goto_sweep() {
	push_undo()
	move_cylinder_to_operation()
	log_h3("Sweep")
	game.state = "sweep"
	if (has_shaded_capability(CAP_OSPINA))
		game.op.limited = 1
}

function vm_free_sweep() {
	init_free_operation("sweep_activate")
	game.op.where = game.vm.s
	do_sweep_activate()
}

function vm_free_sweep_farc() {
	init_free_operation("sweep_activate")
	game.op.faction = FARC
	game.op.where = game.vm.s
	do_sweep_activate()
}

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
	// TODO: only unmoved pieces (can't move twice)
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

		gen_govt_special_activity()

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

		if (game.op.spaces.length > 0)
			view.actions.end_sweep = 1
		else
			view.actions.end_sweep = 0
	},
	space(s) {
		push_undo()

		log(`S${s}.`)

		select_op_space(s, 3)

		game.state = "sweep_move"
		game.op.where = s

		if (has_capability(CAP_NDSC))
			game.op.ndsc = 1
	},
	end_sweep: end_operation,
}

states.sweep_move = {
	prompt() {
		view.prompt = `Sweep: Move Troops into ${space_name[game.op.where]}.`
		view.where = game.op.where

		gen_govt_special_activity()

		gen_sweep_move(game.op.where)

		view.actions.next = 1
		view.actions.end_sweep = 0
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
		do_sweep_activate()
	},
}

function do_sweep_activate() {
	game.state = "sweep_activate"

	let n_troops = count_pieces(game.op.where, GOVT, TROOPS)
	let n_police = count_pieces(game.op.where, GOVT, POLICE)

	// Event 37: AUC Guerillas act as Troops
	if (game.op.faction === FARC)
		n_troops += count_pieces(game.op.where, AUC, GUERRILLA)

	game.op.count = n_troops + n_police
	if (has_shaded_capability(CAP_NDSC))
		game.op.count = Math.max(n_troops, n_police)

	if (is_forest(game.op.where))
		game.op.count >>= 1

	if (game.op.count === 0 || !can_sweep_activate(game.op.where))
		do_sweep_next()
}

function can_sweep_activate(s) {
	if (game.op.faction === FARC)
		return has_underground_guerrilla(s, FARC)
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

		gen_govt_special_activity()

		if (game.op.faction === FARC) {
			gen_underground_guerrillas(game.op.where, FARC)
		} else {
			if (game.senado !== FARC)
				gen_underground_guerrillas(game.op.where, FARC)
			if (game.senado !== AUC)
				gen_underground_guerrillas(game.op.where, AUC)
			if (game.senado !== CARTELS)
				gen_underground_guerrillas(game.op.where, CARTELS)
		}

		if (did_maximum_damage(game.op.targeted))
			view.actions.next = 1
		else
			view.actions.next = 0
		view.actions.end_sweep = 0
	},
	piece(p) {
		game.op.targeted |= target_faction(p)
		set_active(p)
		if (--game.op.count === 0 || !can_sweep_activate(game.op.where))
			this.next()
	},
	next() {
		push_undo()
		do_sweep_next()
	},
}

function do_sweep_next() {
	if (game.vm)
		end_operation()
	else
		game.state = "sweep"
}

// OPERATION: ASSAULT

function goto_assault() {
	push_undo()
	move_cylinder_to_operation()
	log_h3("Assault")
	game.state = "assault"
	if (has_shaded_capability(CAP_TAPIAS))
		game.op.limited = 1
}

function vm_free_assault() {
	init_free_operation("assault_space")
	game.op.where = game.vm.s
	game.op.count = assault_kill_count(game.vm.s, undefined)
}

function vm_free_assault_auc() {
	init_free_operation("assault_space")
	game.op.faction = AUC
	game.op.where = game.vm.s
	game.op.count = assault_kill_count(game.vm.s, AUC)
}

function vm_free_assault_farc() {
	init_free_operation("assault_space")
	game.op.faction = FARC
	game.op.where = game.vm.s
	game.op.count = assault_kill_count(game.vm.s, FARC)
}

function vm_free_assault_cartels() {
	init_free_operation("assault_space")
	game.op.faction = CARTELS
	game.op.where = game.vm.s
	game.op.count = assault_kill_count(game.vm.s, CARTELS)
}

function can_assault_any(s, target) {
	return can_assault(s, FARC) || can_assault(s, AUC) || can_assault(s, CARTELS)
}

function can_assault(s, target) {
	return has_assault_target(s, target) && assault_kill_count(s, target) > 0
}

function has_assault_target(s, target) {
	// Card 37
	if (target === FARC) {
		if (has_piece(s, FARC, GUERRILLA))
			return has_active_guerrilla(s, FARC)
		return has_piece(s, FARC, BASE)
	}

	// Card 47
	if (target === AUC) {
		if (has_piece(s, AUC, GUERRILLA))
			return has_active_guerrilla(s, AUC)
		return has_piece(s, AUC, BASE)
	}

	// Card 59
	if (target === CARTELS) {
		if (has_piece(s, CARTELS, GUERRILLA))
			return has_active_guerrilla(s, CARTELS)
		return has_piece(s, CARTELS, BASE)
	}

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

function assault_kill_count(s, target) {
	let n = count_pieces(s, GOVT, TROOPS)

	// Card 47: All Police free Assault AUC as if Troops.
	if (target === AUC) {
		n = count_pieces(s, GOVT, POLICE)
		if (is_mountain(s)) {
			if (has_capability(CAP_MTN_BNS))
				return n
			if (has_shaded_capability(CAP_MTN_BNS))
				return n >> 2
			return n >> 1
		}
		return n
	}

	// Event 37: AUC Guerillas act as Troops
	if (target === FARC)
		n += count_pieces(s, AUC, GUERRILLA)

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

		gen_govt_special_activity()

		let cost = 3
		if (has_capability(CAP_TAPIAS))
			cost = 1

		if (can_select_op_space(cost)) {
			for (let s = first_space; s <= last_dept; ++s) {
				if (is_selected_op_space(s))
					continue
				if (has_assault_target(s, game.op.faction) && assault_kill_count(s, game.op.faction) > 0)
					gen_action_space(s)
			}
		}

		if (!view.actions.space)
			view.prompt = "Assault: All done."

		if (game.op.spaces.length > 0)
			view.actions.end_assault = 1
		else
			view.actions.end_assault = 0
	},
	space(s) {
		push_undo()

		log(`S${s}.`)

		select_op_space(s, 3)

		game.state = "assault_space"
		game.op.where = s
		game.op.count = assault_kill_count(s, game.op.faction)
	},
	end_assault: end_operation,
}

states.assault_space = {
	prompt() {
		view.prompt = `Assault: Remove ${game.op.count} enemy pieces in ${space_name[game.op.where]}.`
		view.where = game.op.where

		gen_govt_special_activity()

		if (game.faction === FARC) {
			gen_exposed_piece(game.op.where, FARC)
		} else if (game.faction === AUC) {
			gen_exposed_piece(game.op.where, AUC)
		} else {
			if (game.senado !== FARC)
				gen_exposed_piece(game.op.where, FARC)
			if (game.senado !== AUC)
				gen_exposed_piece(game.op.where, AUC)
			if (game.senado !== CARTELS)
				gen_exposed_piece(game.op.where, CARTELS)
		}

		if (did_maximum_damage(game.op.targeted))
			view.actions.next = 1
		else
			view.actions.next = 0
		view.actions.end_assault = 0
	},
	piece(p) {
		game.op.targeted |= target_faction(p)
		remove_piece(p)
		update_control()

		if (--game.op.count === 0 || !has_assault_target(game.op.where, game.op.faction))
			this.next()
	},
	next() {
		if (game.vm) {
			end_operation()
			transfer_or_drug_bust_shipments()
			return
		}
		push_undo()
		game.state = "assault"
		transfer_or_drug_bust_shipments()
	},
}

// OPERATION: RALLY

function goto_rally() {
	push_undo()
	move_cylinder_to_operation()
	log_h3("Rally")
	game.state = "rally"
}

function vm_free_rally() {
	init_free_operation("rally_space")
	game.op.where = game.vm.s
	game.op.count = rally_count()
}

function free_rally_elite_backing(s) {
	init_free_operation("rally_space")
	game.op.elite_backing = 1
	game.op.where = s
	game.op.count = rally_count()
}

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

		if (game.op.spaces.length > 0)
			view.actions.end_rally = 1
		else
			view.actions.end_rally = 0
	},
	space(s) {
		push_undo()

		log(`S${s}.`)

		select_op_space(s, 1)

		game.state = "rally_space"
		game.op.where = s
		game.op.count = rally_count()
	},
	end_rally: end_operation,
}

states.rally_space = {
	prompt() {
		view.prompt = `Rally: Place up to ${game.op.count} Guerrillas, build Base, or Move.`
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
		view.actions.end_rally = 0

		if (game.op.count > 0)
			gen_place_piece(game.op.where, game.current, GUERRILLA)
	},
	piece(p) {
		place_piece(p, game.op.where)
		if (--game.op.count === 0 && !game.op.elite_backing)
			resume_rally()
		update_control()
	},
	base() {
		push_undo()
		log("Base.")
		game.state = "rally_base"
		game.op.count = 2
	},
	move() {
		push_undo()
		log("Moved.")
		game.state = "rally_move"
		game.op.count = 0
	},
	next() {
		resume_rally()
	},
}

function resume_rally() {
	if (game.op.elite_backing)
		end_elite_backing()
	else if (game.vm)
		end_operation()
	else
		game.state = "rally"
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
		view.actions.end_rally = 0
	},
	piece(p) {
		if (game.op.count > 0) {
			remove_piece(p)
			--game.op.count
		} else {
			place_piece(p, game.op.where)
			resume_rally()
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
			if (piece_space(p) !== game.op.where && piece_space(p) >= 0)
				gen_action_piece(p)
		})

		view.actions.flip = 1
		view.actions.end_rally = 0
	},
	piece(p) {
		move_piece(p, game.op.where)
		game.op.count++
		update_control()
	},
	flip() {
		push_undo()
		log("Moved " + game.op.count + ".")
		log("Flipped.")
		for_each_piece(game.current, GUERRILLA, p => {
			if (piece_space(p) === game.op.where)
				set_underground(p)
		})
		resume_rally()
	}
}

// OPERATION: MARCH

function goto_march() {
	push_undo()
	move_cylinder_to_operation()
	log_h3("March")
	game.state = "march"
	game.op.pieces = []
}

function vm_free_march() {
	init_free_operation("march")
	game.op.pieces = []
	// remember destinations
	game.vm.m = []
}

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

		if (game.op.spaces.length > 0)
			view.actions.end_march = 1
		else
			view.actions.end_march = 0
	},
	space(s) {
		push_undo()

		log(`S${s}.`)

		// remember destinations
		if (game.vm)
			set_add(game.vm.m, s)

		if (is_loc(s))
			select_op_space(s, 0)
		else
			select_op_space(s, 1)

		game.state = "march_move"
		game.op.where = s
		game.op.march = []
	},
	end_march: end_operation,
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

			let s = piece_space(p)
			if (s > 0)
			if (is_adjacent(game.op.where, s))
				gen_action_piece(p)
		})

		if (game.op.march.length > 0)
			view.actions.next = 1
		else
			view.actions.next = 0
		view.actions.end_march = 0
	},
	piece(p) {
		let from = piece_space(p)
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

function goto_attack() {
	push_undo()
	move_cylinder_to_operation()
	log_h3("Attack")
	game.state = "attack"
}

function vm_free_attack() {
	init_free_operation("attack")
	do_attack_space(game.vm.s)
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

		if (game.op.spaces.length > 0)
			view.actions.end_attack = 1
		else
			view.actions.end_attack = 0
	},
	space(s) {
		push_undo()
		do_attack_space(s)
	},
	end_attack: end_operation,
}

function do_attack_space(s) {
	log(`Attack in S${s}.`)

	select_op_space(s, 1)

	game.state = "attack_space"
	game.op.where = s
}

states.attack_space = {
	prompt() {
		view.prompt = `Attack in ${space_name[game.op.where]}.`
		view.where = game.op.where
		view.actions.resolve = 1
		view.actions.end_attack = 0

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
			if (piece_space(p) === game.op.where)
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
			do_attack_next()
		}
	},
	ambush: goto_ambush,
}

function do_attack_next() {
	if (game.vm)
		vm_next()
	else
		game.state = "attack"
}

states.attack_place = {
	prompt() {
		view.prompt = `Attack in ${space_name[game.op.where]}: Place a Guerrilla.`
		view.where = game.op.where
		gen_place_piece(game.op.where, game.current, GUERRILLA)
		view.actions.end_attack = 0
	},
	piece(p) {
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
		view.actions.end_attack = 0
	},
	piece(p) {
		game.op.targeted |= target_faction(p)
		remove_piece(p)
		update_control()

		if (--game.op.count === 0 || !has_enemy_piece(game.op.where)) {
			do_attack_next()
			transfer_or_remove_shipments()
		}
	},
	next() {
		do_attack_next()
		game.op.count = 0
		transfer_or_remove_shipments()
	}
}

// OPERATION: TERROR

function goto_terror() {
	push_undo()
	move_cylinder_to_operation()
	log_h3("Terror")
	game.state = "terror"
}

function vm_free_terror() {
	init_free_operation("terror")
	do_terror_space(game.vm.s)
	do_terror_piece(game.vm.p)
}

function vm_free_terror_space() {
	init_free_operation("terror")
	do_terror_space(game.vm.s)
}

states.terror = {
	prompt() {
		view.prompt = "Terror: Select space with Underground Guerrilla."

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

		if (game.current === AUC) {
			if (game.op.spaces.length > 0)
				view.actions.next = 1
			else
				view.actions.next = 0
			view.actions.end_terror = 0
		} else {
			if (game.op.spaces.length > 0)
				view.actions.end_terror = 1
			else
				view.actions.end_terror = 0
		}
	},
	space(s) {
		push_undo()
		do_terror_space(s)
	},
	next: do_terror_aid,
	end_terror: end_operation,
}

function do_terror_space(s) {
	log(`Terror in S${s}.`)
	if (is_loc(s)) {
		select_op_space(s, 0)
	} else {
		select_op_space(s, 1)
	}
	game.state = "terror_space"
	game.op.where = s
}

states.terror_space = {
	prompt() {
		view.prompt = "Terror: Activate an Underground Guerrilla."
		view.where = game.op.where
		gen_underground_guerrillas(game.op.where, game.current)
		view.actions.end_terror = 0
	},
	piece(p) {
		do_terror_piece(p)
	},
}

function do_terror_piece(p) {
	let s = game.op.where

	set_active(p)

	if (is_loc(s)) {
		place_sabotage(s)
	} else {
		place_terror(s)
		if (is_pop(s)) {
			if (game.current === FARC) {
				if (game.support[s] > -2)
					game.support[s] --
			} else {
				if (game.support[s] > 0)
					game.support[s] --
				else if (game.support[s] < 0)
					game.support[s] ++
			}
		}
	}

	if (game.sa && game.sa.kidnap) {
		resume_kidnap_2()
	} else if (game.vm) {
		game.vm.m++
		end_operation()
	} else {
		game.state = "terror"
	}
}

function do_terror_aid() {
	game.state = "terror_aid"
}

states.terror_aid = {
	prompt() {
		let n = (game.op.spaces.length >= 2) ? -5 : -3
		view.prompt = `Terror: Aid Cut by ${n}.`
		view.actions.aid = 1
		view.actions.end_terror = 0
	},
	aid() {
		let n = (game.op.spaces.length >= 2) ? -5 : -3
		add_aid(n)
		end_operation()
	},
}

function vm_terror_aid_cut() {
	if (game.vm.m > 0)
		game.state = "vm_terror_aid_cut"
	else
		vm_next()
}

states.vm_terror_aid_cut = {
	prompt() {
		let n = (game.vm.m >= 2) ? -5 : -3
		view.prompt = `Terror: Aid Cut by ${n}.`
		view.actions.aid = 1
		view.actions.end_terror = 0
	},
	aid() {
		let n = (game.vm.m >= 2) ? -5 : -3
		add_aid(n)
		vm_next()
	},
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

function gen_govt_special_activity() {
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
	if (game.vm) {
		vm_next()
		return
	}
	game.state = game.sa.save
	game.sa = 0
	transfer_or_remove_shipments()
}

// SPECIAL ACTIVITY: AIR LIFT

function vm_free_air_lift() {
	goto_air_lift()
}

function goto_air_lift() {
	push_undo()
	move_cylinder_to_special_activity()
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
		view.actions.end_air_lift = 1
	},
	piece(p) {
		push_undo()
		move_piece(p, game.sa.to)
		update_control()
		if (--game.sa.count === 0 || count_cubes(game.sa.from) === 0)
			end_special_activity()
	},
	end_air_lift() {
		push_undo()
		end_special_activity()
	},
}

// SPECIAL ACTIVITY: AIR STRIKE

function vm_free_air_strike() {
	goto_air_strike()
}

function goto_air_strike() {
	push_undo()
	move_cylinder_to_special_activity()
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
		let s = piece_space(p)
		log(`Air Strike in S${s}.`)
		remove_piece(p)
		update_control()
		end_special_activity()
	}
}

// SPECIAL ACTIVITY: ERADICATE

function vm_free_eradicate() {
	goto_eradicate()
}

function goto_eradicate() {
	push_undo()
	move_cylinder_to_special_activity()
	log_h3("Eradicate")
	game.sa = {
		save: game.state,
		where: -1,
	}
	game.state = "eradicate_aid"
}

states.eradicate_aid = {
	prompt() {
		view.prompt = "Eradicate: Aid +4."
		view.actions.aid = 1
	},
	aid() {
		push_undo()
		log("+4 Aid.")
		add_aid(4)
		game.state = "eradicate"
	}
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
		game.support[s] --
		end_special_activity()
	},
	piece(p) {
		place_piece(p, game.sa.where)
		update_control()
		end_special_activity()
	},
	end_special_activity() {
		end_special_activity()
	},
}

// SPECIAL ACTIVITY: AMBUSH

function vm_free_ambush() {
	init_free_operation("attack_place")
	set_active(game.vm.p)
	game.op.where = game.vm.s
}

function goto_ambush() {
	push_undo()
	move_cylinder_to_special_activity()
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
	}
}

// SPECIAL ACTIVITY: EXTORT

function goto_extort() {
	push_undo()
	move_cylinder_to_special_activity()
	log_h3("Extort")
	game.sa = {
		save: game.state,
		spaces: [],
		where: -1,
	}
	game.state = "extort"
}

states.extort = {
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

		view.actions.end_extort = 1
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
		log(`S${s}.`)
	},
	end_extort() {
		push_undo()
		end_special_activity()
	},
}

// SPECIAL ACTIVITY: KIDNAP

function goto_kidnap() {
	push_undo()
	move_cylinder_to_special_activity()
	log_h3("Kidnap")
	game.sa = {
		kidnap: 1,
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
					// Except when Drug Ransom (where you take Shipment instead of resources)
					if (!is_any_shipment_held_by_faction_in_space(CARTELS, s))
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

		view.actions.end_kidnap = 1
	},
	space(s) {
		push_undo()
		log(`S${s}.`)
		set_add(game.sa.spaces, s)
		game.sa.where = s
		game.state = "kidnap_space"
	},
	end_kidnap() {
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


		if (g)
			gen_action_resources(GOVT)
		if (c) {
			// Drug Ransom if targeting Cartels with Shipment
			if (is_any_shipment_held_by_faction_in_space(CARTELS, s)) {
				console.log("kidnap_space", is_any_shipment_held_by_faction_in_space(CARTELS, s))
				for (let sh = 0; sh < 4; ++sh)
					if (is_shipment_held_by_faction_in_space(sh, CARTELS, s))
						gen_action_shipment(sh)
			} else {
				gen_action_resources(CARTELS)
			}
		}

		if (g && c)
			view.prompt += " Take from Government or Cartels!"
		else if (g)
			view.prompt += " Take from Government!"
		else if (c)
			view.prompt += " Take from Cartels!"
		else
			view.prompt += " IMPOSSIBLE!"
	},
	shipment(sh) {
		push_undo()
		game.sa.shipment = sh
		game.state = "kidnap_drug_ransom"
	},
	resources(faction) {
		clear_undo()

		let die = random(6) + 1
		log("Rolled " + die + ".")
		transfer_resources(faction, game.current, die)

		if (die === 6 && can_place_any_available_piece(game.sa.where, AUC)) {
			game.current = AUC
			game.state = "kidnap_place"
		} else {
			resume_kidnap_1()
		}
	},
}

states.kidnap_drug_ransom = {
	prompt() {
		view.prompt = `Kidnap in ${space_name[game.sa.where]}: Place Shipment with a FARC Guerrilla.`
		view.selected_shipment = game.sa.shipment
		gen_piece_in_space(game.sa.where, FARC, GUERRILLA)
	},
	piece(p) {
		place_shipment(game.sa.shipment, p)
		resume_kidnap_1()
	}
}

states.kidnap_place = {
	prompt() {
		view.prompt = `Kidnap in ${space_name[game.sa.where]}: Place an AUC piece.`
		if (can_stack_base(game.sa.where))
			gen_piece_in_space(AVAILABLE, AUC, BASE)
		if (can_stack_piece(game.sa.where, AUC, GUERRILLA))
			gen_piece_in_space(AVAILABLE, AUC, GUERRILLA)
	},
	piece(p) {
		place_piece(p, game.sa.where)
		update_control()
		game.current = FARC
		resume_kidnap_1()
	}
}

function resume_kidnap_1() {
	// ... will be selected for Terror - by Terroring immediately!
	if (!is_selected_op_space(game.sa.where))
		do_terror_space(game.sa.where)
	else
		resume_kidnap_2()
}

function resume_kidnap_2() {
	if (game.sa.spaces.length === 3)
		end_special_activity()
	else
		game.state = "kidnap"
}

// SPECIAL ACTIVITY: ASSASSINATE

function goto_assassinate() {
	push_undo()
	move_cylinder_to_special_activity()
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
			if (has_enemy_piece(s))
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

		view.actions.end_assassinate = 1
	},
	space(s) {
		push_undo()
		log(`S${s}.`)
		set_add(game.sa.spaces, s)
		game.sa.where = s
		game.state = "assassinate_space"
	},
	end_assassinate() {
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

		transfer_or_remove_shipments()
	},
}

// SPECIAL ACTIVITY: CULTIVATE

function goto_cultivate() {
	push_undo()
	move_cylinder_to_special_activity()
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
			if (piece_space(p) !== game.sa.where && piece_space(p) >= 0)
				gen_action_piece(p)
		})
	},
	piece(p) {
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
	move_cylinder_to_special_activity()
	log_h3("Process")
	game.sa = {
		save: game.state,
		count: 2,
		shipment: -1,
	}
	game.state = "process"
}

function can_process() {
	for (let s = first_space; s <= last_space; ++s)
		if (has_cartels_base(s))
			return true
	return false
}

states.process = {
	prompt() {
		if (game.sa.count === 2)
			view.prompt = "Process: Place 1-2 Shipments with any Guerrillas, or remove any Cartels bases for Resources."
		else if (game.sa.count === 1)
			view.prompt = "Process: Place 1-2 Shipments with any Guerrillas."
		else if (game.sa.count < 0)
			view.prompt = "Process: Remove any Cartels bases for Resources."
		else
			view.prompt = "Process: All done."

		if (game.sa.shipment < 0) {
			if (game.sa.count === 2 || game.sa.count < 0) {
				for_each_piece(CARTELS, BASE, p => {
					if (piece_space(p) !== AVAILABLE)
						gen_action_piece(p)
				})
			}
		} else {
			gen_action_shipment(game.sa.shipment)
		}

		if (game.sa.count > 0) {
			if (game.sa.shipment < 0) {
				for (let sh = 0; sh < 4; ++sh)
					if (is_shipment_available(sh))
						gen_action_shipment(sh)
			} else {
				for (let s = first_space; s <= last_space; ++s) {
					if (has_cartels_base(s)) {
						gen_piece_in_space(s, FARC, GUERRILLA)
						gen_piece_in_space(s, AUC, GUERRILLA)
						gen_piece_in_space(s, CARTELS, GUERRILLA)
					}
				}
			}
		}

		view.actions.end_process = 1
	},
	shipment(sh) {
		if (game.sa.shipment >= 0) {
			pop_undo()
		} else {
			push_undo()
			game.sa.shipment = sh
		}
	},
	piece(p) {
		if (is_cartels_base(p)) {
			push_undo()
			add_resources(CARTELS, 3)
			remove_piece(p)
			update_control()
			game.sa.count = -1
		} else {
			log("Placed Shipment.")
			place_shipment(game.sa.shipment, p)
			game.sa.shipment = -1
			game.sa.count--
		}
	},
	end_process() {
		push_undo()
		end_special_activity()
	},
}

// SPECIAL ACTIVITY: BRIBE

function vm_free_bribe() {
	goto_bribe()
	game.sa.where = game.vm.s
	game.sa.targeted = 0
	game.state = "bribe_space"
}

function goto_bribe() {
	push_undo()
	move_cylinder_to_special_activity()
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
	if (game.vm) {
		end_special_activity()
		return
	}
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
		view.actions.end_bribe = 1
	},
	space(s) {
		push_undo()
		game.resources[CARTELS] -= 3
		set_add(game.sa.spaces, s)
		game.sa.where = s
		game.sa.targeted = 0
		game.state = "bribe_space"
	},
	end_bribe() {
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
		remove_piece(p)
		update_control()
		if (game.sa.targeted || is_any_base(p)) {
			resume_bribe()
			transfer_or_remove_shipments()
		} else {
			game.sa.targeted |= target_faction(p)
		}

		transfer_or_remove_shipments()
	},
	flip() {
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
		gen_piece_in_space(game.sa.where, CARTELS, GUERRILLA)

		// Don't flip same piece twice...
		if (game.sa.piece >= 0 && view.actions.piece)
			set_delete(view.actions.piece, game.sa.piece)

		// No need to do maximum damage...
		view.actions.skip = 1
	},
	piece(p) {
		if (is_underground(p))
			set_active(p)
		else
			set_underground(p)
		game.sa.piece = p
		let n = count_pieces(game.sa.where, FARC, GUERRILLA) +
			count_pieces(game.sa.where, AUC, GUERRILLA) +
			count_pieces(game.sa.where, CARTELS, GUERRILLA)
		if (--game.sa.count === 0 || n === 1)
			resume_bribe()
	},
	skip() {
		resume_bribe()
	},
}

// === PROPAGANDA ===

function goto_propaganda_card() {
	game.propaganda = 1
	goto_victory_phase()
}

// PROPAGANDA: VICTORY PHASE

function calc_support() {
	let n = 0
	for (let s = first_pop; s <= last_pop; ++s)
		if (game.support[s] > 0)
			n += data.spaces[s].pop * view.support[s]
	return n
}

function calc_opposition() {
	let n = 0
	for (let s = first_pop; s <= last_pop; ++s)
		if (game.support[s] < 0)
			n -= data.spaces[s].pop * game.support[s]
	return n
}

function calc_bases(faction) {
	let n = 0
	for (let p = first_piece[faction][BASE]; p <= last_piece[faction][BASE]; ++p)
		if (piece_space(p) !== AVAILABLE)
			n += 1
	return n
}

function govt_victory_margin() {
	return calc_support() - 60
}

function farc_victory_margin() {
	return calc_opposition() + calc_bases(FARC) - 25
}

function auc_victory_margin() {
	return calc_bases(AUC) - calc_bases(FARC)
}

function cartels_victory_margin() {
	return Math.min(calc_bases(CARTELS) - 10, game.resources[CARTELS] - 40)
}

function calc_victory(is_final) {
	let g = govt_victory_margin()
	let f = farc_victory_margin()
	let a = auc_victory_margin()
	let c = cartels_victory_margin()

	log("Government: " + g)
	log("FARC: " + f)
	log("AUC: " + a)
	log("Cartels: " + c)

	if (game.scenario === 4) {
		if (is_final || g > 0 || f > 0 || a > 0 || c > 0) {
			if (c >= g && c >= f && c >= a)
				return NAME_CARTELS
			if (a >= g && a >= f && a >= c)
				return NAME_AUC
			if (f >= g && f >= a && f >= c)
				return NAME_FARC
			return NAME_GOVT
		}
	}

	if (game.scenario === 3) {
		let ac = Math.min(a, c)
		if (is_final || g > 0 || f > 0 || ac > 0) {
			if (ac >= g && ac >= f)
				return NAME_AUC_CARTELS
			if (f >= g && f >= ac)
				return NAME_FARC
			return NAME_GOVT
		}
	}

	if (game.scenario === 2) {
		let ga = Math.min(g, a)
		let fc = Math.min(f, c)
		if (is_final || ga > 0 || fc > 0) {
			if (fc >= ga)
				return NAME_FARC_CARTELS
			return NAME_GOVT_AUC
		}
	}

	return null
}

function goto_victory_phase() {
	log_h2("Victory Phase")
	let result = calc_victory(false)
	if (result)
		goto_game_over(result)
	else
		goto_sabotage_phase()
}

function goto_final_victory() {
	log_h2("Final Victory")
	goto_game_over(calc_victory(true))
}

// PROPAGANDA: SABOTAGE

function goto_sabotage_phase() {
	game.propaganda = 2
	game.current = GOVT
	if (can_sabotage_phase())
		game.state = "sabotage"
	else
		goto_resources_phase()
}

function is_adjacent_to_city_farc_control(s) {
	for (let x of data.spaces[s].adjacent)
		if (is_city(x) && has_farc_control(x))
			return true
	return false
}

function can_sabotage_phase_space(s) {
	if (!has_sabotage(s)) {
		if (is_adjacent_to_city_farc_control(s))
			return true
		if (has_shaded_capability(CAP_7TH_SF))
			return count_guerrillas(s) >= count_cubes(s)
		return count_guerrillas(s) > count_cubes(s)
	}
	return false
}

function can_sabotage_phase() {
	for (let s = first_loc; s <= last_loc; ++s)
		if (can_sabotage_phase_space(s))
			return true
}

states.sabotage = {
	prompt() {
		view.prompt = "Sabotage LoCs."
		for (let s = first_loc; s <= last_loc; ++s)
			if (can_sabotage_phase_space(s))
				gen_action_space(s)
	},
	space(s) {
		place_sabotage(s)
		if (!can_sabotage_phase())
			goto_resources_phase()
	},
}

// PROPAGANDA: RESOURCES PHASE

function calc_govt_earnings() {
	let n = 30
	for (let s of game.sabotage)
		n -= data.space[s].econ
	if (game.president === SAMPER)
		return n
	return n + game.aid
}

function calc_farc_earnings() {
	return calc_bases(FARC)
}

function calc_auc_earnings() {
	return calc_bases(FARC)
}

function calc_cartels_earnings() {
	if (has_momentum(MOM_MEXICAN_TRAFFICKERS))
		return calc_bases(CARTELS) * 4
	return calc_bases(CARTELS) * 3
}

function goto_resources_phase() {
	game.propaganda = 3
	log_h2("Resources Phase")
	game.current = GOVT
	game.state = "govt_earnings"
}

states.govt_earnings = {
	prompt() {
		view.prompt = `Earnings: Government +${calc_govt_earnings()} Resources.`
		gen_action_resources(GOVT)
	},
	resources(f) {
		log("Government +" + calc_govt_earnings() + " Resources")
		add_resources(GOVT, calc_govt_earnings())
		game.state = "farc_earnings"
	},
}

states.farc_earnings = {
	prompt() {
		view.prompt = `Earnings: FARC +${calc_farc_earnings()} Resources.`
		gen_action_resources(FARC)
	},
	resources(_) {
		log("FARC +" + calc_farc_earnings() + " Resources")
		add_resources(FARC, calc_farc_earnings())
		game.state = "auc_earnings"
	},
}

states.auc_earnings = {
	prompt() {
		view.prompt = `Earnings: AUC +${calc_auc_earnings()} Resources.`
		gen_action_resources(AUC)
	},
	resources(_) {
		log("AUC +" + calc_auc_earnings() + " Resources")
		add_resources(AUC, calc_auc_earnings())
		game.state = "cartels_earnings"
	},
}

states.cartels_earnings = {
	prompt() {
		view.prompt = `Earnings: Cartels +${calc_cartels_earnings()} Resources.`
		gen_action_resources(CARTELS)
	},
	resources(_) {
		log("Cartels +" + calc_cartels_earnings() + " Resources")
		add_resources(CARTELS, calc_cartels_earnings())
		goto_drug_profits()
	},
}

function goto_drug_profits() {
	game.state = "drug_profits"
	if (is_any_shipment_held_by_faction(FARC)) {
		game.current = FARC
		return
	}
	if (is_any_shipment_held_by_faction(AUC)) {
		game.current = AUC
		return
	}
	if (is_any_shipment_held_by_faction(CARTELS)) {
		game.current = CARTELS
		return
	}
	goto_support_phase()
}

states.drug_profits = {
	prompt() {
		view.prompt = "Drug Profits: Remove Shipments for Base or Resources."
		for (let sh = 0; sh < 4; ++sh)
			if (is_shipment_held_by_faction(sh, game.current))
				gen_action_shipment(sh)
		if (!view.actions.shipment)
			view.actions.done = 1
	},
	shipment(sh) {
		push_undo()
		let p = get_held_shipment_piece(sh)
		let s = piece_space(p)
		game.transfer = s
		remove_shipment(sh)
		game.state = "drug_profits_space"
	},
	done() {
		clear_undo()
		goto_drug_profits()
	}
}

states.drug_profits_space = {
	prompt() {
		if (can_stack_base(game.transfer) && has_piece(AVAILABLE, game.current, BASE)) {
			view.prompt = "Drug Profits: Place Base or +6 Resources."
			gen_place_piece(game.transfer, game.current, BASE)
		} else {
			view.prompt = `Drug Profits: ${faction_name[game.current]} +6 Resources.`
		}
		gen_action_resources(game.current)
	},
	resources(s) {
		add_resources(game.current, 6)
		game.state = "drug_profits"
	},
	piece(p) {
		place_piece(p, game.transfer)
		game.state = "drug_profits"
	},
}

// PROPAGANDA: SUPPORT PHASE

function can_civic_action(s) {
	if (game.support[s] < 2 && has_govt_control(s)) {
		if (has_shaded_capability(CAP_1ST_DIV))
			return count_pieces(s, GOVT, TROOPS) >= 2 && count_pieces(s, GOVT, POLICE) >= 2
		return has_piece(s, GOVT, TROOPS) && has_piece(s, GOVT, POLICE)
	}
	return false
}

function can_agitate(s) {
	if (game.support[s] > -2) {
		if (has_farc_control(s))
			return true
		if (!has_govt_control(s)) {
			if (game.alfonso) {
				if (game.alfonso.length < 3)
					return true
				if (set_has(game.alfonso, s))
					return true
			}
		}
	}
	return false
}

function goto_support_phase() {
	game.propaganda = 4
	log_h2("Support Phase")
	log_h3("Civic Action")
	game.current = GOVT
	game.state = "civic_action"
	game.alfonso = 0
	if (has_momentum(MOM_ALFONSO_CANO))
		game.alfonso = []
}

states.civic_action = {
	prompt() {
		view.prompt = "Civic Action: Build Support in Cities and Departments."
		if (game.resources[GOVT] >= 3) {
			for (let s = first_pop; s <= last_pop; ++s)
				if (can_civic_action(s))
					gen_action_space(s)
		}
		view.actions.next = 1
	},
	space(s) {
		push_undo()
		add_resources(GOVT, -3)
		if (has_terror(s))
			remove_terror(s)
		else
			game.support[s] += 1
	},
	next() {
		clear_undo()
		log_h3("Agitation")
		game.current = FARC
		game.state = "agitation"
	},
}

states.agitation = {
	prompt() {
		view.prompt = "Agitation: Encourage Opposition in Cities and Departments."
		if (game.resources[FARC] >= 1) {
			for (let s = first_pop; s <= last_pop; ++s)
				if (can_agitate(s))
					gen_action_space(s)
		}
		view.actions.next = 1
	},
	space(s) {
		push_undo()
		if (!has_farc_control(s))
			set_add(game.alfonso, s)
		add_resources(FARC, -1)
		if (has_terror(s))
			remove_terror(s)
		else
			game.support[s] -= 1
	},
	next() {
		clear_undo()
		delete game.alfonso
		goto_election()
	},
}

function goto_election() {
	game.current = GOVT
	if (game.president === SAMPER && calc_support() <= 60 ) {
		log_h3("Election")
		log("Pastrana is El Presidente!")
		game.president = PASTRANA
		game.state = "farc_zone_place"
		return
	}
	if (game.president === PASTRANA && calc_support() <= 60 ) {
		log_h3("Election")
		log("Uribe is El Presidente!")
		game.president = URIBE
		if (game.farc_zones.length > 0) {
			game.state = "remove_farc_zones"
			return
		}
	}
	goto_elite_backing()
}

states.remove_farc_zones = {
	prompt() {
		view.prompt = "Election: Remove all FARC Zones."
		for (let s of game.farc_zones)
			gen_action_space(s)
	},
	space(s) {
		log(`Removed Farc Zone from S${s}.`)
		set_delete(game.farc_zones, s)
		if (game.farc_zones.length === 0)
			goto_elite_backing()
	},
}

function goto_elite_backing() {
	log_h3("Elite Backing")
	game.current = AUC
	game.state = "elite_backing"
}

function end_elite_backing() {
	clear_undo()
	goto_redeploy_phase()
}

states.elite_backing = {
	prompt() {
		view.prompt = "Elite Backing: Free Rally in one space."
		view.actions.next = 1
		for (let s = first_space; s <= last_dept; ++s)
			if (!is_opposition(s) && !has_govt_control(s) && !has_farc_control(s))
				gen_action_space(s)
	},
	space(s) {
		push_undo()
		free_rally_elite_backing(s)
	},
	next() {
		end_elite_backing()
	},
}

// PROPAGANDA: REDEPLOY PHASE

function goto_redeploy_phase() {
	game.propaganda = 5
	game.redeploy = -1
	log_h2("Redeploy Phase")
	game.current = GOVT
	game.state = "redeploy"
}

states.redeploy = {
	prompt() {
		view.prompt = "Redeploy"

		let done = true

		if (game.redeploy < 0) {
			for_each_piece(GOVT, TROOPS, (p,s) => {
				if (is_loc(s)) {
					done = false
					gen_action_piece(p)
				}
				if (is_dept(s) && !has_govt_base(s)) {
					done = false
					gen_action_piece(p)
				}
			})
			if (done) {
				for_each_piece(GOVT, TROOPS, (p,s) => {
					if (s !== AVAILABLE)
						gen_action_piece(p)
				})
				for_each_piece(GOVT, POLICE, (p,s) => {
					if (s !== AVAILABLE)
						gen_action_piece(p)
				})
			}
		}

		else {
			let p = game.redeploy
			view.who = p
			done = false
			if (is_troops(p)) {
				for (let s = first_space; s <= last_space; ++s)
					if (is_redeploy_troops_space(s))
						gen_action_space(s)
			}
			if (is_police(p)) {
				for (let s = first_space; s <= last_space; ++s)
					if (is_redeploy_police_space(s))
						gen_action_space(s)
			}
		}

		if (done)
			view.actions.next = 1
		else
			view.actions.next = 0
	},
	piece(p) {
		if (game.redeploy === p)
			game.redeploy = -1
		else
			game.redeploy = p
	},
	space(s) {
		let p = game.redeploy
		game.redeploy = -1
		push_undo()
		place_piece(p, s)
		// NOTE: do not update control yet!
	},
	next() {
		delete game.redeploy
		update_control()
		goto_reset_phase()
	},
}

// PROPAGANDA: RESET PHASE

function goto_reset_phase() {
	game.propaganda = 6
	game.state = "reset"

	log_h2("Reset Phase")

	game.terror = []
	game.sabotage = []

	game.momentum = []

	game.cylinder[GOVT] = ELIGIBLE
	game.cylinder[FARC] = ELIGIBLE
	game.cylinder[AUC] = ELIGIBLE
	game.cylinder[CARTELS] = ELIGIBLE
	game.marked = 0

	for_each_piece(FARC, GUERRILLA, set_underground)
	for_each_piece(AUC, GUERRILLA, set_underground)
	for_each_piece(CARTELS, GUERRILLA, set_underground)

	delete game.propaganda

	if (is_final_propaganda_card()) {
		goto_final_victory()
	} else {
		array_remove(game.deck, 0)
		goto_card()
	}
}

// === FARC ZONE ===

function vm_place_farc_zone() {
	game.state = "farc_zone_place"
}

function has_govt_in_farc_zone() {
	for (let s of game.farc_zones)
		if (has_govt_piece(s))
			return true
	return false
}

states.farc_zone_place = {
	prompt() {
		view.prompt = "Place FARC Zone."
		for (let s = first_dept; s <= last_dept; ++s)
			if (is_possible_farc_zone(s))
				gen_action_space(s)
	},
	space(s) {
		push_undo()
		log(`Placed FARC Zone in S${s}.`)
		set_add(game.farc_zones, s)

		if (game.vm)
			game.vm.farc_zone = s

		if (has_govt_piece(s)) {
			game.state = "farc_zone_redeploy"
			game.redeploy = -1
		} else {
			end_farc_zone_place()
		}
	},
}

states.farc_zone_redeploy = {
	prompt() {
		view.prompt = "Redeploy Government from FARC Zone."
		if (game.redeploy < 0) {
			for (let s of game.farc_zones) {
				gen_piece_in_space(s, GOVT, TROOPS)
				gen_piece_in_space(s, GOVT, POLICE)
				gen_piece_in_space(s, GOVT, BASE)
			}
		} else {
			let p = game.redeploy
			view.who = p
			if (is_troops(p)) {
				for (let s = first_space; s <= last_space; ++s)
					if (is_redeploy_troops_space(s))
						gen_action_space(s)
			}
			if (is_police(p)) {
				for (let s = first_space; s <= last_space; ++s)
					if (is_redeploy_police_space(s))
						gen_action_space(s)
			}
		}
	},
	piece(p) {
		if (is_govt_base(p)) {
			remove_piece(p)
			update_control()
		} else {
			if (game.redeploy === p)
				game.redeploy = -1
			else
				game.redeploy = p
		}
	},
	space(s) {
		let p = game.redeploy
		game.redeploy = -1
		push_undo()
		place_piece(p, s)
		update_control()
		if (!has_govt_in_farc_zone())
			end_farc_zone_place()
	},
}

function end_farc_zone_place() {
	delete game.redeploy
	if (game.vm)
		vm_next()
	else
		goto_elite_backing()
}

// === EVENTS ===

function goto_event() {
	log_h2(faction_name[game.current] + " - Event")
	if (set_has(single_events, this_card()))
		execute_event(0)
	else
		game.state = "event_effect"
}

function end_event() {
	game.vm = null
	resume_event_card()
}

states.event_effect = {
	prompt() {
		let c = this_card()
		view.prompt = `${data.card_title[c]}: Choose effect.`
		view.actions.unshaded = 1
		view.actions.shaded = 1
	},
	unshaded() {
		execute_event(0)
	},
	shaded() {
		execute_event(1)
	},
}

function execute_event(shaded) {
	push_undo()
	move_cylinder_to_event()
	let c = this_card()

	if (shaded) {
		log(`C${c} - Shaded`)
		logi(data.card_flavor_shaded[c] + ".")
		goto_vm(SCODE[c])
	} else {
		log(`C${c}`)
		if (data.card_flavor[c])
			logi(data.card_flavor[c] + ".")
		goto_vm(UCODE[c])
	}
}

// EVENT VM

function is_piece_in_event_space(p) {
	return piece_space(p) === game.vm.s
}

function goto_vm(start) {
	game.state = "vm"
	game.vm = {
		prompt: 0,
		pc: start,
		ss: [],
		s: -1,
		pp: [],
		p: -1,
		m: 0,
	}
	vm_exec()
}

function event_prompt(str, n0, n) {
	if (n0 === 0) {
		str = str.replace(/\bN\b/, "each")
		str = str.replace("(s)", "")
	}
	if (n0 > 0) {
		str = str.replace(/\bN\b/, n)
		if (n === 1)
			str = str.replace("(s)", "")
		else
			str = str.replace("(s)", "s")
	}
	view.prompt = data.card_title[this_card()] + ": " + str
}

function vm_operand(a) {
	a = CODE[game.vm.pc][a]
	if (typeof a === "function")
		return a()
	return a
}

function vm_exec() {
	console.log("VM", game.vm.pc, CODE[game.vm.pc][0].name)
	CODE[game.vm.pc][0]()
}

function vm_next() {
	game.vm.pc ++
	vm_exec()
}

function vm_goto(op, nop, dir, step) {
	let balance = 1
	while (balance > 0) {
		game.vm.pc += dir
		if (CODE[game.vm.pc][0] === op)
			--balance
		if (CODE[game.vm.pc][0] === nop)
			++balance
		if (game.vm.pc < 0 || game.vm.pc > CODE.length)
			throw "ERROR"
	}
	game.vm.pc += step
	vm_exec()
}

function vm_asm() {
	vm_operand(1)
	vm_next()
}

function vm_if() {
	if (!vm_operand(1)) {
		let balance = 1
		while (balance > 0) {
			++game.vm.pc
			console.log("scan else:", CODE[game.vm.pc][0].name)
			switch (CODE[game.vm.pc][0]) {
				case vm_if:
					++balance
					break
				case vm_endif:
					--balance
					break
				case vm_else:
					if (balance === 1)
						--balance
					break
			}
			if (game.vm.pc < 0 || game.vm.pc > CODE.length)
				throw "ERROR"
		}
	}
	vm_next()
}

function vm_else() {
	vm_goto(vm_endif, vm_if, 1, 1)
}

function vm_endif() {
	vm_next()
}

function vm_while() {
	if (vm_operand(1))
		vm_next()
	else
		vm_goto(vm_endwhile, vm_while, 1, 1)
}

function vm_endwhile() {
	vm_goto(vm_while, vm_endwhile, -1, 0)
}


function vm_prompt() {
	game.vm.prompt = game.vm.pc
	vm_next()
}

function vm_log() {
	log(vm_operand(1))
	vm_next()
}

function vm_momentum() {
	set_add(game.momentum, this_card())
	vm_next()
}

function vm_capability() {
	set_add(game.capabilities, this_card())
	vm_next()
}

function vm_shaded_capability() {
	set_add(game.capabilities, -this_card())
	vm_next()
}

function vm_return() {
	game.state = "vm_return"
}

states.vm_return = {
	prompt() {
		event_prompt("All done.")
		view.actions.end_event = 1
	},
	end_event,
}

function vm_mark_space() {
	if (game.vm.m)
		set_add(game.vm.m, game.vm.s)
	else
		game.vm.m = [ game.vm.s ]
	vm_next()
}

// VM: AUTOMATED ACTIONS

function vm_eligible() {
	let faction = vm_operand(1)
	log("Marked " + faction_name[faction] + " Eligible.")
	game.marked |= (16 << faction)
	vm_next()
}

function vm_ineligible() {
	let faction = vm_operand(1)
	log("Marked " + faction_name[faction] + " Ineligible.")
	if (game.cylinder[faction] === ELIGIBLE)
		game.cylinder[faction] = INELIGIBLE
	game.marked |= (1 << faction)
	vm_next()
}

function vm_terror() {
	place_terror(game.vm.s)
	vm_next()
}

function vm_sabotage() {
	place_sabotage(game.vm.s)
	vm_next()
}

function vm_remove_sabotage() {
	remove_sabotage(game.vm.s)
	vm_next()
}

function vm_move() {
	move_piece(game.vm.p, game.vm.s)
	update_control()
	vm_next()
}

function vm_remove() {
	remove_piece(game.vm.p)
	update_control()
	transfer_or_remove_shipments()
	vm_next()
}

function vm_remove_farc_zone() {
	set_delete(game.farc_zones, game.vm.s)
	vm_next()
}

function vm_place_shipment() {
	let sh = find_available_shipment()
	place_shipment(sh, game.vm.p)
	vm_next()
}

function vm_remove_shipment() {
	remove_shipment(game.vm.sh)
	vm_next()
}

function vm_activate() {
	set_active(game.vm.p)
	vm_next()
}

function vm_underground() {
	set_underground(game.vm.p)
	vm_next()
}

function vm_set_neutral() {
	game.support[game.vm.s] = NEUTRAL
	vm_next()
}

function vm_set_active_support() {
	game.support[game.vm.s] = ACTIVE_SUPPORT
	vm_next()
}

function vm_set_passive_support() {
	game.support[game.vm.s] = PASSIVE_SUPPORT
	vm_next()
}

function vm_set_active_opposition() {
	game.support[game.vm.s] = ACTIVE_OPPOSITION
	vm_next()
}

function vm_set_passive_opposition() {
	game.support[game.vm.s] = PASSIVE_OPPOSITION
	vm_next()
}

function vm_shift_support() {
	if (game.support[game.vm.s] < 2)
		game.support[game.vm.s] ++
	vm_next()
}

function vm_shift_opposition() {
	if (game.support[game.vm.s] > -2)
		game.support[game.vm.s] --
	vm_next()
}

// VM: SIMPLE USER ACTIONS

function vm_roll() {
	// TODO: pause for button "Roll" ?
	game.vm.die = random(6) + 1
	log("Rolled " + game.vm.m + ".")
	vm_next()
}

function vm_current() {
	if (vm_operand(1) !== game.current)
		game.state = "vm_current"
	else
		vm_next()
}

states.vm_current = {
	prompt() {
		let list = vm_operand(1)
		event_prompt("Select Faction.")
		if (list === GOVT || (Array.isArray(list) && list.includes(GOVT)))
			view.actions.govt = 1
		if (list === FARC || (Array.isArray(list) && list.includes(FARC)))
			view.actions.farc = 1
		if (list === AUC || (Array.isArray(list) && list.includes(AUC)))
			view.actions.auc = 1
		if (list === CARTELS || (Array.isArray(list) && list.includes(CARTELS)))
			view.actions.cartels = 1
	},
	govt() {
		game.current = GOVT
		vm_next()
	},
	farc() {
		game.current = FARC
		vm_next()
	},
	auc() {
		game.current = AUC
		vm_next()
	},
	cartels() {
		game.current = CARTELS
		vm_next()
	},
}

function vm_aid() {
	game.state = "vm_aid"
}

states.vm_aid = {
	prompt() {
		let n = vm_operand(1)
		if (n >= 0)
			event_prompt(`Aid +${n}.`)
		else
			event_prompt(`Aid ${n}.`)
		view.actions.aid = 1
	},
	aid() {
		let n = vm_operand(1)
		add_aid(n)
		vm_next()
	},
}

function vm_auto_resources() {
	let f = vm_operand(1)
	let n = vm_operand(2)
	add_resources(f, n)
	vm_next()
}

function vm_resources() {
	game.state = "vm_resources"
}

states.vm_resources = {
	prompt() {
		let f = vm_operand(1)
		let n = vm_operand(2)
		if (f >= 0) {
			if (n >= 0)
				event_prompt(`${faction_name[f]} +${n} Resources.`)
			else
				event_prompt(`${faction_name[f]} ${n} Resources.`)
			gen_action_resources(f)
		} else {
			if (n >= 0)
				event_prompt(`Insurgent Faction +${n} Resources.`)
			else
				event_prompt(`Insurgent Faction ${n} Resources.`)
			gen_action_resources(FARC)
			gen_action_resources(AUC)
			gen_action_resources(CARTELS)
		}
	},
	resources(f) {
		let n = vm_operand(2)
		add_resources(f, n)
		vm_next()
	},
}

function vm_transfer() {
	game.state = "vm_transfer"
}

states.vm_transfer = {
	prompt() {
		let from = vm_operand(1)
		let to = vm_operand(2)
		let n = vm_operand(3)
		event_prompt(`Transfer ${n} Resources from ${faction_name[from]} to ${faction_name[to]}.`)
		gen_action_resources(from)
	},
	resources(_) {
		let from = vm_operand(1)
		let to = vm_operand(2)
		let n = vm_operand(3)
		transfer_resources(from, to, n)
		vm_next()
	},
}

function vm_remove_permanently() {
	let faction = vm_operand(1)
	let type = vm_operand(2)
	if (has_piece(AVAILABLE, faction, type))
		game.state = "vm_remove_permanently"
	else
		vm_next()
}

states.vm_remove_permanently = {
	prompt() {
		let faction = vm_operand(1)
		let type = vm_operand(2)
		event_prompt(`Remove ${piece_name[faction][type]} permanently.`)
		gen_place_piece(OUT_OF_PLAY, faction, type)
	},
	piece(p) {
		place_piece(p, OUT_OF_PLAY)
		update_control()
		vm_next()
		transfer_or_remove_shipments()
	},
}

// VM: SPACE ITERATOR

function vm_set_piece_space() {
	game.vm.s = piece_space(game.vm.p)
	vm_next()
}

function vm_set_space() {
	game.vm.s = vm_operand(1)
	vm_next()
}

function vm_save_space() {
	game.vm._ss = game.vm.ss
	game.vm._s = game.vm.s
	game.vm.ss = []
	game.vm.s = -1
	vm_next()
}

function vm_restore_space() {
	game.vm.ss = game.vm._ss
	game.vm.s = game.vm._s
	delete game.vm._ss
	delete game.vm._s
	vm_next()
}

function vm_space() {
	if (can_vm_space()) {
		game.state = "vm_space"
	} else {
		game.vm.ss = []
		game.vm.s = -1
		vm_goto(vm_endspace, vm_space, 1, 1)
	}
}

function vm_endspace() {
	vm_goto(vm_space, vm_endspace, -1, 0)
}

function can_vm_space() {
	let n = CODE[game.vm.pc][3]
	let f = CODE[game.vm.pc][4]
	if (n > 0 && game.vm.ss.length >= n)
		return false
	for (let s = first_space; s <= last_space; ++s)
		if (!set_has(game.vm.ss, s) && f(s))
			return true
	return false
}

states.vm_space = {
	prompt() {
		let n = CODE[game.vm.pc][3]
		let f = CODE[game.vm.pc][4]
		if (game.vm.prompt)
			event_prompt(CODE[game.vm.prompt][1])
		else
			event_prompt("Select space.")
		for (let s = first_space; s <= last_space; ++s)
			if (!set_has(game.vm.ss, s) && f(s))
				gen_action_space(s)
		if (CODE[game.vm.pc][2])
			view.actions.skip = 1
	},
	space(s) {
		if (CODE[game.vm.pc][1])
			push_undo()
		set_add(game.vm.ss, s)
		game.vm.s = s
		vm_next()
	},
	skip() {
		if (CODE[game.vm.pc][1])
			push_undo()
		vm_goto(vm_endspace, vm_space, 1, 1)
	},
}

// VM: PIECE ITERATOR

function vm_piece() {
	if (can_vm_piece()) {
		game.state = "vm_piece"
	} else {
		game.vm.pp = []
		game.vm.p = -1
		vm_goto(vm_endpiece, vm_piece, 1, 1)
	}
}

function vm_endpiece() {
	vm_goto(vm_piece, vm_endpiece, -1, 0)
}

function can_vm_piece() {
	let n = CODE[game.vm.pc][3]
	let f = CODE[game.vm.pc][4]
	if (n > 0 && game.vm.pp.length >= n)
		return false
	for (let p = all_first_piece; p <= all_last_piece; ++p)
		if (piece_space(p) >= 0 && !set_has(game.vm.pp, p) && f(p, piece_space(p)))
			return true
	return false
}

states.vm_piece = {
	prompt() {
		let n = CODE[game.vm.pc][3]
		let f = CODE[game.vm.pc][4]
		view.where = game.vm.s
		if (game.vm.prompt)
			event_prompt(CODE[game.vm.prompt][1])
		else
			event_prompt("Select piece.")
		for (let p = all_first_piece; p <= all_last_piece; ++p)
			if (piece_space(p) >= 0 && !set_has(game.vm.pp, p) && f(p, piece_space(p)))
				gen_action_piece(p)
		if (CODE[game.vm.pc][2])
			view.actions.skip = 1
	},
	piece(p) {
		if (CODE[game.vm.pc][1])
			push_undo()
		set_add(game.vm.pp, p)
		game.vm.p = p
		vm_next()
	},
	skip() {
		if (CODE[game.vm.pc][1])
			push_undo()
		vm_goto(vm_endpiece, vm_piece, 1, 1)
	},
}

// VM: SHIPMENT ITERATOR

function vm_shipment() {
	if (can_vm_shipment())
		game.state = "vm_shipment"
	else
		vm_goto(vm_endshipment, vm_shipment, 1, 1)
}

function vm_endshipment() {
	vm_goto(vm_shipment, vm_endshipment, -1, 0)
}

function can_vm_shipment() {
	let n = CODE[game.vm.pc][3]
	let f = CODE[game.vm.pc][4]
	if (n > 0 && game.vm.m >= n)
		return false
	for (let sh = 0; sh < 4; ++sh) {
		if (is_shipment_held(sh)) {
			let p = get_held_shipment_piece(sh)
			if (f(p, piece_space(p)))
				return true
		}
	}
	return false
}

states.vm_shipment = {
	prompt() {
		let n = CODE[game.vm.pc][3]
		let f = CODE[game.vm.pc][4]
		if (game.vm.prompt)
			event_prompt(CODE[game.vm.prompt][1])
		else
			event_prompt("Select shipment.")
		for (let sh = 0; sh < 4; ++sh) {
			if (is_shipment_held(sh)) {
				let p = get_held_shipment_piece(sh)
				if (f(p, piece_space(p)))
					gen_action_shipment(sh)
			}
		}
		if (CODE[game.vm.pc][2])
			view.actions.skip = 1
	},
	shipment(sh) {
		if (CODE[game.vm.pc][1])
			push_undo()
		game.vm.sh = sh
		vm_next()
	},
	skip() {
		if (CODE[game.vm.pc][1])
			push_undo()
		vm_goto(vm_endshipment, vm_shipment, 1, 1)
	},
}

// VM: PLACE PIECE

function vm_place() {
	if (can_vm_place())
		game.state = "vm_place"
	else
		vm_next()
}

function can_vm_place_imp(s, faction, type) {
	if (type === BASE && !can_stack_base(s))
		return false
	if (game.current === faction)
		return true
	return has_piece(AVAILABLE, faction, type)
}

function can_vm_place() {
	let faction = vm_operand(3)
	let type = vm_operand(4)
	if (typeof faction === "object" && typeof type === "object") {
		for (let f of faction)
			for (let t of type)
				if (can_vm_place_imp(game.vm.s, f, t))
					return true
	} else if (typeof faction === "object") {
		for (let f of faction)
			if (can_vm_place_imp(game.vm.s, f, type))
				return true
	} else if (typeof type === "object") {
		for (let t of type)
			if (can_vm_place_imp(game.vm.s, faction, t))
				return true
	} else {
		if (can_vm_place_imp(game.vm.s, faction, type))
			return true
	}
	return false
}

states.vm_place = {
	prompt() {
		let skip = CODE[game.vm.pc][2]
		let faction = vm_operand(3)
		let type = vm_operand(4)
		let where = space_name[game.vm.s]
		view.where = game.vm.s
		if (typeof faction === "object" && typeof type === "object") {
			event_prompt(`Place piece in ${where}.`)
			for (let f of faction) {
				for (let t of type) {
					if (f === GOVT && (t === BASE || t === TROOPS || t === POLICE))
						skip |= gen_place_piece(game.vm.s, f, t)
					if (f !== GOVT && (t === BASE || t === GUERRILLA))
						skip |= gen_place_piece(game.vm.s, f, t)
				}
			}
		} else if (typeof faction === "object") {
			event_prompt(`Place ${piece_type_name[type]} in ${where}.`)
			for (let f of faction) {
				if (f === GOVT && (type === BASE || type === TROOPS || type === POLICE))
					skip |= gen_place_piece(game.vm.s, f, type)
				if (f !== GOVT && (type === BASE || type === GUERRILLA))
					skip |= gen_place_piece(game.vm.s, f, type)
			}
		} else if (typeof type === "object") {
			event_prompt(`Place ${faction_name[faction]} piece in ${where}.`)
			for (let t of type)
				skip |= gen_place_piece(game.vm.s, faction, t)
		} else {
			event_prompt(`Place ${piece_name[faction][type]} in ${where}.`)
			skip |= gen_place_piece(game.vm.s, faction, type)
		}
		if (skip)
			view.actions.skip = 1
	},
	piece(p) {
		if (CODE[game.vm.pc][1])
			push_undo()
		place_piece(p, game.vm.s)
		update_control()
		vm_next()
	},
	skip() {
		if (CODE[game.vm.pc][1])
			push_undo()
		vm_next()
	},
}

// VM: USER ACTIONS WITH OPTIONS

function vm_set_passive_support_or_passive_opposition() {
	game.state = "vm_set_passive_support_or_passive_opposition"
}

states.vm_set_passive_support_or_passive_opposition = {
	prompt() {
		event_prompt(`Set ${space_name[game.vm.s]} to Passive Support or Opposition.`)
		view.where = game.vm.s
		view.actions.support = 1
		view.actions.opposition = 1
	},
	support() {
		vm_set_passive_support()
	},
	opposition() {
		vm_set_passive_opposition()
	},
}

function vm_place_or_remove_shipment() {
	if (has_available_shipment() ||
		(is_any_shipment_held_in_space(game.vm.s) && has_any_guerrilla(game.vm.s)))
		game.state = "vm_place_or_remove_shipment"
	else
		vm_next()
}

states.vm_place_or_remove_shipment = {
	prompt() {
		event_prompt(`Place or remove Shipment in ${space_name[game.vm.s]}.`)
		for (let sh = 0; sh < 4; ++sh)
			if (is_shipment_held_in_space(sh, game.vm.s))
				gen_action_shipment(sh)
		if (has_available_shipment()) {
			gen_piece_in_space(game.vm.s, FARC, GUERRILLA)
			gen_piece_in_space(game.vm.s, AUC, GUERRILLA)
			gen_piece_in_space(game.vm.s, CARTELS, GUERRILLA)
		}
	},
	shipment(sh) {
		remove_shipment(sh)
		vm_next()
	},
	piece(p) {
		let sh = find_available_shipment()
		place_shipment(sh, p)
		vm_next()
	},
}

function vm_place_or_remove_insurgent_base() {
	let s = game.vm.s
	if (can_stack_base(s) && (has_piece(AVAILABLE, BASE) || has_piece(AVAILABLE, AUC, BASE) || has_piece(AVAILABLE, CARTELS, BASE)))
		game.state = "vm_place_or_remove_insurgent_base"
	else if (has_piece(s, FARC, BASE) || has_piece(s, AUC, BASE) || has_piece(s, CARTELS, BASE))
		game.state = "vm_place_or_remove_insurgent_base"
	else
		vm_next()
}

states.vm_place_or_remove_insurgent_base = {
	prompt() {
		event_prompt(`Place or remove Insurgent Base in ${space_name[game.vm.s]}.`)
		gen_piece_in_space(game.vm.s, FARC, BASE)
		gen_piece_in_space(game.vm.s, AUC, BASE)
		gen_piece_in_space(game.vm.s, CARTELS, BASE)
		if (can_stack_base(game.vm.s)) {
			gen_place_piece(game.vm.s, FARC, BASE)
			gen_place_piece(game.vm.s, AUC, BASE)
			gen_place_piece(game.vm.s, CARTELS, BASE)
		}
	},
	piece(p) {
		if (piece_space(p) === AVAILABLE)
			place_piece(p, game.vm.s)
		else
			remove_piece(p)
		update_control()
		vm_next()
		transfer_or_remove_shipments()
	},
}

function can_vm_select_shipment_or_cartels_piece_in_coastal_space() {
	for (let s = first_space; s <= last_space; ++s) {
		if (is_coastal_space(s)) {
			if (has_piece(s, CARTELS, GUERRILLA))
				return true
			if (has_piece(s, CARTELS, BASE))
				return true
			for (let sh = 0; sh < 4; ++sh)
				if (is_shipment_held_in_space(sh, s))
					return true
		}
	}
	return false
}

function vm_select_shipment_or_cartels_piece_in_coastal_space() {
	if (can_vm_select_shipment_or_cartels_piece_in_coastal_space()) {
		game.state = "vm_select_shipment_or_cartels_piece_in_coastal_space"
	} else {
		game.vm.sh = -1
		game.vm.p = -1
		vm_next()
	}
}

states.vm_select_shipment_or_cartels_piece_in_coastal_space = {
	prompt() {
		event_prompt(CODE[game.vm.prompt][1])
		for (let s = first_space; s <= last_space; ++s) {
			if (is_coastal_space(s)) {
				gen_piece_in_space(s, CARTELS, GUERRILLA)
				gen_piece_in_space(s, CARTELS, BASE)
				for (let sh = 0; sh < 4; ++sh)
					if (is_shipment_held_in_space(sh, s))
						gen_action_shipment(sh)
			}
		}
	},
	piece(p) {
		game.vm.sh = -1
		game.vm.p = p
		vm_next()
	},
	shipment(sh) {
		game.vm.sh = sh
		game.vm.p = -1
		vm_next()
	},
}

function can_vm_select_space_or_piece() {
	let sf = CODE[game.vm.pc][1]
	let pf = CODE[game.vm.pc][2]
	for (let s = first_space; s <= last_space; ++s)
		if (sf(s))
			return true
	for (let p = all_first_piece; p <= all_last_piece; ++p)
		if (piece_space(p) >= 0 && pf(p, piece_space(p)))
			return true
	return false
}

function vm_select_space_or_piece() {
	if (can_vm_select_space_or_piece()) {
		game.state = "vm_select_space_or_piece"
	} else {
		game.vm.s = -1
		game.vm.p = -1
		vm_next()
	}
}

states.vm_select_space_or_piece = {
	prompt() {
		let sf = CODE[game.vm.pc][1]
		let pf = CODE[game.vm.pc][2]
		event_prompt(CODE[game.vm.prompt][1])
		for (let s = first_space; s <= last_space; ++s)
			if (sf(s))
				gen_action_space(s)
		for (let p = all_first_piece; p <= all_last_piece; ++p)
			if (piece_space(p) >= 0 && pf(p, piece_space(p)))
				gen_action_piece(p)
	},
	space(s) {
		game.vm.s = s
		game.vm.p = -1
		vm_next()
	},
	piece(p) {
		game.vm.s = -1
		game.vm.p = p
		vm_next()
	},
}

// VM: FREE OPS/ACTIVITIES

function vm_free_govt_special_activity() { game.state = "vm_free_govt_special_activity" }
function vm_free_train_sweep_assault() { game.state = "vm_free_train_sweep_assault" }
function vm_free_sweep_assault() { game.state = "vm_free_sweep_assault" }
function vm_free_sweep_assault_farc() { game.state = "vm_free_sweep_assault_farc" }
function vm_free_rally_attack_terror() { game.state = "vm_free_rally_attack_terror" }
function vm_free_attack_terror() { game.state = "vm_free_attack_terror" }

states.vm_free_govt_special_activity = {
	prompt() {
		event_prompt(`Free Special Activity.`)
		view.actions.air_lift = 1
		view.actions.air_strike = 1
		view.actions.eradicate = 1
	},
	air_lift: vm_free_air_lift,
	air_strike: vm_free_air_strike,
	eradicate: vm_free_eradicate,
}

states.vm_free_train_sweep_assault = {
	prompt() {
		event_prompt(`Free Train, Sweep, or Assault in ${space_name[game.vm.s]}.`)
		view.where = game.vm.s
		if (can_govt_train(game.vm.s))
			view.actions.train = 1
		else
			view.actions.train = 0
		if (has_any_underground_guerrilla(game.vm.s))
			view.actions.sweep = 1
		else
			view.actions.sweep = 0
		if (can_assault_any(game.vm.s))
			view.actions.assault = 1
		else
			view.actions.assault = 0
	},
	train: vm_free_train,
	sweep: vm_free_sweep,
	assault: vm_free_assault,
}

states.vm_free_sweep_assault = {
	prompt() {
		event_prompt(`Free Sweep or Assault in ${space_name[game.vm.s]}.`)
		view.where = game.vm.s
		if (has_any_underground_guerrilla(game.vm.s))
			view.actions.sweep = 1
		else
			view.actions.sweep = 0
		if (can_assault_any(game.vm.s))
			view.actions.assault = 1
		else
			view.actions.assault = 0
	},
	sweep: vm_free_sweep,
	assault: vm_free_assault,
}

states.vm_free_sweep_assault_farc = {
	prompt() {
		event_prompt(`Free Sweep or Assault FARC in ${space_name[game.vm.s]}.`)
		view.where = game.vm.s
		if (has_underground_guerrilla(game.vm.s, FARC))
			view.actions.sweep = 1
		else
			view.actions.sweep = 0
		if (can_assault(game.vm.s, FARC))
			view.actions.assault = 1
		else
			view.actions.assault = 0
	},
	sweep: vm_free_sweep_farc,
	assault: vm_free_assault_farc,
}

states.vm_free_rally_attack_terror = {
	prompt() {
		event_prompt(`Free Rally, Attack, or Terror in ${space_name[game.vm.s]}.`)
		view.where = game.vm.s
		view.actions.rally = 1
		if (has_enemy_piece(game.vm.s))
			view.actions.attack = 1
		else
			view.actions.attack = 0
		view.actions.terror = 1
	},
	rally: vm_free_rally,
	attack: vm_free_attack,
	terror: vm_free_terror_space,
}

states.vm_free_attack_terror = {
	prompt() {
		event_prompt(`Free Attack or Terror in ${space_name[game.vm.s]}.`)
		view.where = game.vm.s
		if (has_enemy_piece(game.vm.s))
			view.actions.attack = 1
		else
			view.actions.attack = 0
		view.actions.terror = 1
	},
	attack: vm_free_attack,
	terror: vm_free_terror_space,
}

// === GAME OVER ===

function goto_game_over(result) {
	game.state = "game_over"
	game.current = -1
	game.active = "None"
	game.result = result
	game.victory = victory + " won!"
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

	if (game.propaganda)
		view.propaganda = game.propaganda

	if (game.state === "game_over") {
		view.prompt = game.victory
	} else if (!is_current_role(role)) {
		let inactive = states[game.state].inactive || game.state
		view.prompt = `Waiting for ${faction_name[game.current]} \u2014 ${inactive}.`
	} else {
		view.actions = {}

		if (states[game.state])
			states[game.state].prompt()
		else
			view.prompt = "Unknown state: " + game.state

		if (states[game.state])
		if (!states[game.state].disable_negotiation && !game.propaganda) {
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

// === GENERATED EVENT CODE ===

const CODE = [
	[ vm_return ],
// EVENT 1
	[ vm_log, "1 Civic Action space each Support Phase requires Govt Control and any cube." ],
	[ vm_capability ],
	[ vm_return ],
// SHADED 1
	[ vm_log, "Civic Action requires at least 2 Troops and 2 Police." ],
	[ vm_shaded_capability ],
	[ vm_return ],
// EVENT 2
	[ vm_log, "Sweep costs 1 Resource per space." ],
	[ vm_capability ],
	[ vm_return ],
// SHADED 2
	[ vm_log, "Sweep Operations may target only 1 space per card." ],
	[ vm_shaded_capability ],
	[ vm_return ],
// EVENT 3
	[ vm_log, "Assault costs 1 Resource per space." ],
	[ vm_capability ],
	[ vm_return ],
// SHADED 3
	[ vm_log, "Assault Operations may target only 1 space per card." ],
	[ vm_shaded_capability ],
	[ vm_return ],
// EVENT 4
	[ vm_prompt, "Select unsabotaged pipelines." ],
	[ vm_space, 1, 0, 3, (s)=>is_unsabotaged_pipeline(s) ],
	[ vm_resources, GOVT, ()=>(2*data.spaces[game.vm.s].econ) ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 4
	[ vm_prompt, "Sabotage the 3 pipelines with highest value and no cubes." ],
	[ vm_space, 1, 0, 3, (s)=>is_highest_value_pipeline_without_cubes(s) ],
	[ vm_sabotage ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 5
	[ vm_prompt, "Place Police onto Pipelines." ],
	[ vm_space, 1, 0, 1, (s)=>is_pipeline(s) ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_mark_space ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 1, (s)=>is_pipeline(s) ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_mark_space ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 1, (s)=>is_pipeline(s) ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_mark_space ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 1, (s)=>is_pipeline(s) ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_mark_space ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 1, (s)=>is_pipeline(s) ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_mark_space ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 1, (s)=>is_pipeline(s) ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_mark_space ],
	[ vm_endspace ],
	[ vm_prompt, "Flip N Guerrillas there or adjacent to Active." ],
	[ vm_piece, 0, 0, 3, (p,s)=>is_any_guerrilla(p) && is_underground(p) && is_with_or_adjacent_to_mark(s, game.vm.m) ],
	[ vm_activate ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 5
	[ vm_prompt, "Shift space adjacent to a 3-Econ LoC by 2 levels toward Active Opposition." ],
	[ vm_space, 1, 0, 1, (s)=>is_adjacent_to_3econ_loc(s) ],
	[ vm_shift_opposition ],
	[ vm_shift_opposition ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 6
	[ vm_prompt, "Select Opposition or Neutral Departments adjacent to Sabotage." ],
	[ vm_space, 1, 0, 2, (s)=>(!is_support(s) && is_adjacent_to_support(s)) ],
	[ vm_set_passive_support ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 6
	[ vm_prompt, "Sabotage a pipeline." ],
	[ vm_space, 1, 0, 1, (s)=>is_pipeline(s) ],
	[ vm_sabotage ],
	[ vm_endspace ],
	[ vm_prompt, "Shift an Adjacent Department." ],
	[ vm_space, 1, 0, 1, (s)=>is_pop(s) && is_dept(s) && is_adjacent(s, game.vm.s) ],
	[ vm_shift_opposition ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 7
	[ vm_log, "Each Sabotage phase, Govt may remove 1-3 Terror or Sabotage." ],
	[ vm_capability ],
	[ vm_return ],
// SHADED 7
	[ vm_log, "Sabotage phase - Sabotage LoCs with any Guerrillas equal to cubes." ],
	[ vm_shaded_capability ],
	[ vm_return ],
// EVENT 8
	[ vm_current, GOVT ],
	[ vm_free_air_strike ],
	[ vm_free_air_strike ],
	[ vm_free_air_strike ],
	[ vm_return ],
// SHADED 8
	[ vm_resources, GOVT, -9 ],
	[ vm_return ],
// EVENT 9
	[ vm_log, "Assault treats Mountain as City." ],
	[ vm_capability ],
	[ vm_return ],
// SHADED 9
	[ vm_log, "Assault in Mountain removes only 1 piece for 4 Troops." ],
	[ vm_shaded_capability ],
	[ vm_return ],
// EVENT 10
	[ vm_log, "Air Lift moves any number of Troops." ],
	[ vm_capability ],
	[ vm_return ],
// SHADED 10
	[ vm_log, "Air Lift moves only 1 Troops cube." ],
	[ vm_shaded_capability ],
	[ vm_return ],
// EVENT 11
	[ vm_log, "1 Police may enter each Sweep space." ],
	[ vm_capability ],
	[ vm_return ],
// SHADED 11
	[ vm_log, "Operation Activates Guerrillas via Troops or Police, not both." ],
	[ vm_shaded_capability ],
	[ vm_return ],
// EVENT 12
	[ vm_resources, GOVT, ()=>(Math.min(game.aid,20)) ],
	[ vm_aid, 10 ],
	[ vm_return ],
// SHADED 12
	[ vm_log, "No Air Strike or Activation by Patrlo until next Propaganda." ],
	[ vm_momentum ],
	[ vm_return ],
// EVENT 13
	[ vm_log, "Patrol conducts a free Assault in each LoC." ],
	[ vm_capability ],
	[ vm_return ],
// SHADED 13
	[ vm_log, "Patrols do not conduct a free Assault." ],
	[ vm_shaded_capability ],
	[ vm_return ],
// EVENT 14
	[ vm_current, GOVT ],
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) && !is_farc_zone(s) ],
	[ vm_place, 0, 0, GOVT, BASE ],
	[ vm_place, 0, 0, GOVT, TROOPS ],
	[ vm_place, 0, 0, GOVT, TROOPS ],
	[ vm_place, 0, 0, GOVT, TROOPS ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 14
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_piece_in_event_space(p) && is_govt_base(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_piece_in_event_space(p) && (is_troops(p) || is_police(p)) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 15
	[ vm_roll ],
	[ vm_resources, GOVT, ()=>(game.vm.die*4) ],
	[ vm_return ],
// SHADED 15
	[ vm_space, 1, 0, 1, (s)=>is_city() && (is_neutral(s) || is_passive_support(s)) ],
	[ vm_set_passive_opposition ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 16
	[ vm_prompt, "Select each Mountain Department." ],
	[ vm_space, 1, 0, 0, (s)=>is_mountain(s) ],
	[ vm_resources, ()=>(faction_with_most_pieces(game.vm.s)), 5 ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 16
	[ vm_resources, GOVT, -10 ],
	[ vm_return ],
// EVENT 17
	[ vm_resources, GOVT, ()=>(Math.min(game.aid,20)) ],
	[ vm_aid, 6 ],
	[ vm_return ],
// SHADED 17
	[ vm_log, "No Sweep or Assault in Depts until next Propaganda." ],
	[ vm_momentum ],
	[ vm_return ],
// EVENT 18
	[ vm_resources, GOVT, ()=>(Math.min(game.aid,20)) ],
	[ vm_aid, 20 ],
	[ vm_return ],
// SHADED 18
	[ vm_resources, GOVT, -6 ],
	[ vm_roll ],
	[ vm_aid, ()=>(-game.vm.die) ],
	[ vm_return ],
// EVENT 19
	[ vm_if, ()=>game.current === GOVT ],
	[ vm_space, 1, 0, 0, (s)=>has_cube(s) && has_enemy_piece(s) ],
	[ vm_free_sweep_assault ],
	[ vm_endspace ],
	[ vm_else ],
	[ vm_space, 1, 0, 0, (s)=>has_piece(s, game.current, GUERRILLA) ],
	[ vm_free_attack_terror ],
	[ vm_endspace ],
	[ vm_endif ],
	[ vm_return ],
// EVENT 20
	[ vm_current, GOVT ],
	[ vm_piece, 1, 1, 6, (p,s)=>is_farc_guerrilla(p) ],
	[ vm_space, 0, 0, 1, (s)=>is_adjacent(s, game.pieces[game.vm.p]) ],
	[ vm_move ],
	[ vm_endspace ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 20
	[ vm_current, FARC ],
	[ vm_free_march ],
	[ vm_piece, 1, 1, 3, (p,s)=>is_farc_guerrilla(p) && is_active(p) ],
	[ vm_underground ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 21
	[ vm_resources, FARC, -6 ],
	[ vm_piece, 1, 0, 1, (p,s)=>is_farc_base(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 21
	[ vm_resources, FARC, 6 ],
	[ vm_space, 1, 0, 1, (s)=>(is_city(s) || is_dept(s)) && can_stack_base(s) ],
	[ vm_place, 0, 0, FARC, BASE ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 22
	[ vm_space, 1, 0, 1, (s)=>is_opposition(s) ],
	[ vm_set_neutral ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 22
	[ vm_log, "May Agitate also in up to 3 spaces with FARC piece and no Govt Control." ],
	[ vm_momentum ],
	[ vm_return ],
// EVENT 23
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_any_guerrilla(p) && is_underground(p) ],
	[ vm_activate ],
	[ vm_endpiece ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_cartels_base(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 23
	[ vm_current, GOVT ],
	[ vm_piece, 1, 0, 3, (p,s)=>is_troops(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_ineligible, GOVT ],
	[ vm_ineligible, FARC ],
	[ vm_return ],
// EVENT 24
	[ vm_space, 1, 0, 1, (s)=>is_city(s) ],
	[ vm_set_active_support ],
	[ vm_endspace ],
	[ vm_ineligible, FARC ],
	[ vm_return ],
// SHADED 24
	[ vm_space, 1, 0, 1, (s)=>has_farc_piece(s) ],
	[ vm_piece, 0, 0, 2, (p,s)=>is_piece_in_event_space(p) && is_troops(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 1, (s)=>is_city(s) && is_support(s) ],
	[ vm_set_neutral ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 25
	[ vm_space, 1, 0, 1, (s)=>is_mountain(s) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_farc_piece(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 25
	[ vm_space, 1, 0, 1, (s)=>s === ANTIOQUIA || (is_dept(s) && is_adjacent(ANTIOQUIA, s)) ],
	[ vm_place, 0, 0, FARC, [BASE,GUERRILLA] ],
	[ vm_place, 0, 0, FARC, [BASE,GUERRILLA] ],
	[ vm_place, 0, 0, FARC, [BASE,GUERRILLA] ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 26
	[ vm_current, CARTELS ],
	[ vm_space, 1, 0, 0, (s)=>has_cartels_guerrilla(s) && has_farc_piece(s) ],
	[ vm_free_attack ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 26
	[ vm_prompt, "Transfer 6 Resources from Cartels to FARC for each space with CB and FG." ],
	[ vm_space, 1, 0, 0, (s)=>has_cartels_base(s) && has_farc_guerrilla(s) ],
	[ vm_transfer, CARTELS, FARC, 6 ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 27
	[ vm_current, GOVT ],
	[ vm_free_govt_special_activity ],
	[ vm_free_govt_special_activity ],
	[ vm_free_govt_special_activity ],
	[ vm_return ],
// SHADED 27
	[ vm_log, "Until next Propaganda, no Govt Special Activities where Guerrilla." ],
	[ vm_momentum ],
	[ vm_return ],
// EVENT 28
	[ vm_space, 1, 0, 1, (s)=>is_next_to_venezuela(s) ],
	[ vm_piece, 0, 1, 3, (p,s)=>is_piece_in_event_space(p) && is_insurgent_piece(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 28
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) && is_next_to_venezuela(s) && can_stack_base(s) ],
	[ vm_place, 0, 0, FARC, BASE ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 0, (s)=>is_loc(s) && is_adjacent(CUCUTA, s) && is_empty(s) ],
	[ vm_sabotage ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 29
	[ vm_current, GOVT ],
	[ vm_space, 1, 0, 1, (s)=>has_farc_piece(s) && has_govt_piece(s) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_farc_guerrilla(p) && is_underground(p) ],
	[ vm_activate ],
	[ vm_endpiece ],
	[ vm_free_assault ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 29
	[ vm_current, [FARC,AUC] ],
	[ vm_piece, 1, 0, 2, (p,s)=>is_piece(p, game.current, GUERRILLA) && has_enemy_piece(s) ],
	[ vm_free_ambush ],
	[ vm_underground ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 30
	[ vm_space, 1, 0, 1, (s)=>is_farc_zone(s) ],
	[ vm_remove_farc_zone ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_piece_in_event_space(p) && is_farc_base(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 30
	[ vm_current, GOVT ],
	[ vm_place_farc_zone ],
	[ vm_return ],
// EVENT 31
	[ vm_space, 1, 0, 2, (s)=>is_city(s) ],
	[ vm_shift_support ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) ],
	[ vm_shift_support ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 31
	[ vm_space, 1, 0, 3, (s)=>is_passive_opposition(s) ],
	[ vm_set_active_opposition ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 32
	[ vm_space, 1, 0, 2, (s)=>is_neutral(s) || is_passive_opposition(s) ],
	[ vm_set_passive_support ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 32
	[ vm_resources, FARC, 12 ],
	[ vm_return ],
// EVENT 33
	[ vm_space, 1, 0, 1, (s)=>is_next_to_ecuador(s) ],
	[ vm_piece, 0, 1, 3, (p,s)=>is_piece_in_event_space(p) && is_insurgent_piece(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 33
	[ vm_capability ],
	[ vm_space, 1, 0, 1, (s)=>s === ECUADOR ],
	[ vm_place, 0, 0, ()=>(game.current), [BASE,GUERRILLA,TROOPS,POLICE] ],
	[ vm_place, 0, 0, ()=>(game.current), [BASE,GUERRILLA,TROOPS,POLICE] ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 34
	[ vm_resources, -1, -5 ],
	[ vm_return ],
// SHADED 34
	[ vm_current, [FARC,AUC,CARTELS] ],
	[ vm_space, 1, 0, 1, (s)=>is_zero_pop_dept(s) ],
	[ vm_place, 0, 0, ()=>(game.current), GUERRILLA ],
	[ vm_place, 0, 0, ()=>(game.current), GUERRILLA ],
	[ vm_place, 0, 0, ()=>(game.current), BASE ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 35
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_cartels_base(p) ],
	[ vm_remove ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_aid, 3 ],
	[ vm_return ],
// SHADED 35
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) && has_cartels_base(s) ],
	[ vm_shift_opposition ],
	[ vm_shift_opposition ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 36
	[ vm_eligible, ()=>(game.current) ],
	[ vm_asm, ()=>game.vm.m = game.current ],
	[ vm_current, GOVT ],
	[ vm_place_farc_zone ],
	[ vm_asm, ()=>game.current = game.vm.m ],
	[ vm_prompt, "Shift adjacent spaces toward Active Support." ],
	[ vm_space, 1, 0, 2, (s)=>is_pop(s) && !is_active_support(s) && is_adjacent(game.vm.farc_zone, s) ],
	[ vm_shift_support ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 37
	[ vm_current, GOVT ],
	[ vm_space, 1, 0, 0, (s)=>has_cube(s) && has_farc_piece(s) ],
	[ vm_free_sweep_assault_farc ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 37
	[ vm_current, AUC ],
	[ vm_free_march ],
	[ vm_space, 1, 0, 1, (s)=>set_has(game.vm.m, s) && has_underground_guerrilla(s, AUC) ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_piece_in_event_space(p) && is_auc_guerrilla(p) && is_underground(p) ],
	[ vm_free_ambush ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 38
	[ vm_space, 1, 1, 3, (s)=>(has_cube(s) || is_support(s)) && has_active_guerrilla(s, AUC) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_active_guerrilla(p, AUC) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 38
	[ vm_space, 1, 0, 0, (s)=>has_cube(s) || is_support(s) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_active_guerrilla(p, AUC) ],
	[ vm_underground ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 39
	[ vm_prompt, "Place Police into each of 6 Departments." ],
	[ vm_space, 1, 0, 6, (s)=>is_dept(s) && !is_farc_zone(s) ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 39
	[ vm_prompt, "In up to 3 Depts, replace 1 Police with AUC Guerrilla." ],
	[ vm_space, 1, 1, 3, (s)=>is_dept(s) && has_police(s) ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_piece_in_event_space(p) && is_police(p) ],
	[ vm_remove ],
	[ vm_place, 0, 0, AUC, GUERRILLA ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 40
	[ vm_prompt, "Replace 3 AUC Guerrillas with Police." ],
	[ vm_piece, 1, 0, 3, (p,s)=>is_auc_guerrilla(p) ],
	[ vm_set_piece_space ],
	[ vm_remove ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 40
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) && has_auc_piece(s) && has_cube(s) ],
	[ vm_prompt, "Move all cubes to any Cities." ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_cube(p) ],
	[ vm_save_space ],
	[ vm_space, 0, 0, 1, (s)=>is_city(s) ],
	[ vm_move ],
	[ vm_endspace ],
	[ vm_restore_space ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_prompt, "Place AUC pieces in Cities." ],
	[ vm_space, 1, 0, 2, (s)=>is_city(s) ],
	[ vm_place, 0, 0, AUC, [BASE,GUERRILLA] ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 41
	[ vm_resources, AUC, -6 ],
	[ vm_space, 1, 0, 1, (s)=>has_auc_piece(s) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_auc_piece(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 41
	[ vm_prompt, "Select each space with AUC and Cartels pieces." ],
	[ vm_space, 1, 0, 0, (s)=>has_auc_piece(s) && has_cartels_piece(s) ],
	[ vm_resources, AUC, 3 ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 42
	[ vm_space, 1, 0, 2, (s)=>is_neutral(s) ],
	[ vm_set_passive_support ],
	[ vm_endspace ],
	[ vm_resources, GOVT, 3 ],
	[ vm_return ],
// SHADED 42
	[ vm_log, ()=>(`No Sweep or Assault against ${faction_name[game.current]} until next Propaganda.`) ],
	[ vm_asm, ()=>game.senado = game.current ],
	[ vm_momentum ],
	[ vm_return ],
// EVENT 43
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) && has_troops(s) ],
	[ vm_terror ],
	[ vm_terror ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_farc_base(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 43
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) && has_troops(s) ],
	[ vm_terror ],
	[ vm_terror ],
	[ vm_endspace ],
	[ vm_aid, -9 ],
	[ vm_return ],
// EVENT 44
	[ vm_space, 1, 0, 1, (s)=>is_city(s) && !is_opposition(s) ],
	[ vm_set_active_support ],
	[ vm_endspace ],
	[ vm_resources, GOVT, 3 ],
	[ vm_return ],
// SHADED 44
	[ vm_space, 1, 0, 1, (s)=>is_city(s) && is_support(s) ],
	[ vm_set_neutral ],
	[ vm_endspace ],
	[ vm_resources, GOVT, -3 ],
	[ vm_return ],
// EVENT 45
	[ vm_space, 1, 0, 0, (s)=>has_cube(s) && has_terror(s) ],
	[ vm_shift_support ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 45
	[ vm_prompt, "Select each space with AUC pieces." ],
	[ vm_space, 1, 0, 0, (s)=>has_auc_piece(s) ],
	[ vm_aid, -1 ],
	[ vm_endspace ],
	[ vm_roll ],
	[ vm_resources, GOVT, ()=>(-game.vm.die) ],
	[ vm_return ],
// EVENT 46
	[ vm_current, [FARC,AUC,CARTELS] ],
	[ vm_prompt, "Execute free Terror with any Guerrilla." ],
	[ vm_space, 1, 0, 1, (s)=>has_piece(s, game.current, GUERRILLA) ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_piece_in_event_space(p) && is_piece(p, game.current, GUERRILLA) ],
	[ vm_free_terror ],
	[ vm_terror ],
	[ vm_terror_aid_cut ],
	[ vm_endpiece ],
	[ vm_prompt, "Remove enemy pieces." ],
	[ vm_piece, 0, 0, 2, (p,s)=>is_piece_in_event_space(p) && is_enemy_piece(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_if, ()=>is_pop(game.vm.s) ],
	[ vm_set_passive_support_or_passive_opposition ],
	[ vm_endif ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 47
	[ vm_piece, 0, 0, 0, (p,s)=>is_auc_guerrilla(p) && is_underground(p) ],
	[ vm_activate ],
	[ vm_endpiece ],
	[ vm_space, 1, 0, 0, (s)=>has_police(s) && has_auc_piece(s) ],
	[ vm_free_assault_auc ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 47
	[ vm_current, AUC ],
	[ vm_set_space, CUCUTA ],
	[ vm_prompt, "Place AUC Guerrillas in Cúcuta." ],
	[ vm_place, 0, 0, AUC, GUERRILLA ],
	[ vm_place, 0, 0, AUC, GUERRILLA ],
	[ vm_prompt, "Execute free Terror in Cúcuta." ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_piece_in_event_space(p) && is_auc_guerrilla(p) && is_underground(p) ],
	[ vm_free_terror ],
	[ vm_terror_aid_cut ],
	[ vm_endpiece ],
	[ vm_prompt, "Flip any AUC Guerrillas Underground." ],
	[ vm_piece, 0, 0, 2, (p,s)=>is_auc_guerrilla(p) && is_active(p) ],
	[ vm_underground ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 48
	[ vm_prompt, "Remove Opposition or FARC Base adjacent to 3-Econ pipeline." ],
	[ vm_select_space_or_piece, (s)=>(is_opposition(s)&&is_adjacent_to_3econ_pipeline(s)), (p,s)=>(is_farc_base(p)&&is_adjacent_to_3econ_pipeline(s)) ],
	[ vm_if, ()=>game.vm.p >= 0 ],
	[ vm_remove ],
	[ vm_endif ],
	[ vm_if, ()=>game.vm.s >= 0 ],
	[ vm_shift_support ],
	[ vm_endif ],
	[ vm_return ],
// SHADED 48
	[ vm_space, 1, 0, 2, (s)=>s !== BOGOTA && is_city(s) ],
	[ vm_shift_opposition ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 49
	[ vm_remove_permanently, AUC, GUERRILLA ],
	[ vm_remove_permanently, AUC, GUERRILLA ],
	[ vm_remove_permanently, AUC, GUERRILLA ],
	[ vm_return ],
// SHADED 49
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) ],
	[ vm_place, 0, 0, AUC, GUERRILLA ],
	[ vm_place, 0, 0, AUC, BASE ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 50
	[ vm_current, GOVT ],
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) && !is_farc_zone(s) ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) && !is_farc_zone(s) ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 1, (s)=>is_dept(s) && !is_farc_zone(s) ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 50
	[ vm_piece, 0, 0, 2, (p,s)=>is_police(p) ],
	[ vm_set_piece_space ],
	[ vm_remove ],
	[ vm_place, 0, 1, AUC, GUERRILLA ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 51
	[ vm_if, ()=>is_any_pipeline_sabotaged() ],
	[ vm_prompt, "Remove all Pipeline Sabotage." ],
	[ vm_space, 1, 0, 0, (s)=>is_pipeline(s) && has_sabotage(s) ],
	[ vm_remove_sabotage ],
	[ vm_endspace ],
	[ vm_return ],
	[ vm_endif ],
	[ vm_resources, GOVT, 12 ],
	[ vm_return ],
// SHADED 51
	[ vm_prompt, "Sabotage Pipelines with or adjacent to FARC Guerrillas." ],
	[ vm_space, 1, 0, 3, (s)=>is_pipeline(s) && is_with_or_adjacent_to_farc_guerrilla(s) ],
	[ vm_sabotage ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 52
	[ vm_space, 1, 0, 2, (s)=>is_city(s) || is_mountain(s) ],
	[ vm_shift_support ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 52
	[ vm_space, 1, 0, 1, (s)=>has_auc_piece(s) && can_stack_base(s) ],
	[ vm_place, 0, 0, AUC, BASE ],
	[ vm_endspace ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_auc_base(p) ],
	[ vm_resources, AUC, 1 ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 53
	[ vm_current, [FARC,AUC,CARTELS] ],
	[ vm_prompt, "Select Departments to move Guerrillas between." ],
	[ vm_space, 1, 0, 2, (s)=>is_dept(s) ],
	[ vm_mark_space ],
	[ vm_endspace ],
	[ vm_prompt, "Move Guerrillas between Departments." ],
	[ vm_piece, 0, 0, 2, (p,s)=>is_any_guerrilla(p) && (s === game.vm.m[0] || s === game.vm.m[1]) ],
	[ vm_if, ()=>game.pieces[game.vm.p] === game.vm.m[0] ],
	[ vm_set_space, ()=>(game.vm.m[1]) ],
	[ vm_else ],
	[ vm_set_space, ()=>(game.vm.m[0]) ],
	[ vm_endif ],
	[ vm_move ],
	[ vm_underground ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 54
	[ vm_piece, 0, 1, 2, (p,s)=>is_any_guerrilla(p) ],
	[ vm_set_piece_space ],
	[ vm_remove ],
	[ vm_if, ()=>piece_faction(game.vm.p) === FARC ],
	[ vm_place, 0, 1, [AUC,CARTELS], GUERRILLA ],
	[ vm_endif ],
	[ vm_if, ()=>piece_faction(game.vm.p) === AUC ],
	[ vm_place, 0, 1, [FARC,CARTELS], GUERRILLA ],
	[ vm_endif ],
	[ vm_if, ()=>piece_faction(game.vm.p) === CARTELS ],
	[ vm_place, 0, 1, [FARC,AUC], GUERRILLA ],
	[ vm_endif ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 55
	[ vm_shipment, 0, 0, 2, (p,s)=>true ],
	[ vm_remove_shipment ],
	[ vm_endpiece ],
	[ vm_prompt, "Remove N Cartels Guerrillas." ],
	[ vm_piece, 0, 0, 5, (p,s)=>is_cartels_guerrilla(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_aid, 3 ],
	[ vm_return ],
// SHADED 55
	[ vm_prompt, "Shift N spaces with Cartels pieces 1 level toward Active Opposition." ],
	[ vm_space, 1, 0, 3, (s)=>has_cartels_piece(s) && !is_active_opposition(s) ],
	[ vm_shift_opposition ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 56
	[ vm_transfer, CARTELS, GOVT, 15 ],
	[ vm_return ],
// SHADED 56
	[ vm_piece, 0, 0, 0, (p,s)=>is_cartels_piece(p) && is_city(s) ],
	[ vm_resources, CARTELS, 2 ],
	[ vm_endpiece ],
	[ vm_space, 1, 0, 2, (s)=>is_city(s) && can_stack_base(s) ],
	[ vm_place, 0, 0, CARTELS, BASE ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 57
	[ vm_prompt, "Replace Cartels pieces with Police." ],
	[ vm_piece, 0, 1, 3, (p,s)=>is_cartels_piece(p) ],
	[ vm_set_piece_space ],
	[ vm_remove ],
	[ vm_place, 0, 0, GOVT, POLICE ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 57
	[ vm_prompt, "In 2 spaces replace 1 Police with any Cartels piece." ],
	[ vm_space, 1, 0, 2, (s)=>has_police(s) ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_piece_in_event_space(p) && is_police(p) ],
	[ vm_remove ],
	[ vm_place, 0, 0, CARTELS, [BASE,GUERRILLA] ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 58
	[ vm_resources, CARTELS, -6 ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_cartels_guerrilla(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 58
	[ vm_current, CARTELS ],
	[ vm_prompt, "Relocate up to 4 Police to any spaces." ],
	[ vm_piece, 0, 1, 4, (p,s)=>is_police(p) ],
	[ vm_space, 1, 0, 1, (s)=>is_space(s) ],
	[ vm_move ],
	[ vm_endspace ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 59
	[ vm_current, GOVT ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_cartels_guerrilla(p) && is_underground(p) ],
	[ vm_activate ],
	[ vm_endpiece ],
	[ vm_space, 1, 0, 0, (s)=>can_assault(s, CARTELS) ],
	[ vm_free_assault_cartels ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 59
	[ vm_current, CARTELS ],
	[ vm_prompt, "Flip all Cartels Guerrillas underground." ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_cartels_guerrilla(p) && is_active(p) ],
	[ vm_underground ],
	[ vm_endpiece ],
	[ vm_prompt, "Relocate Cartels Guerrillas anywhere." ],
	[ vm_piece, 0, 1, 3, (p,s)=>is_cartels_guerrilla(p) ],
	[ vm_space, 1, 0, 1, (s)=>is_space(s) ],
	[ vm_move ],
	[ vm_endspace ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 60
	[ vm_space, 1, 0, 2, (s)=>has_cartels_piece(s) && ((is_city(s) && (game.vm.ss.length === 0 || is_city(game.vm.ss[0]))) || (is_dept(s) && game.vm.ss.length === 0)) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_cartels_piece(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_resources, GOVT, 6 ],
	[ vm_return ],
// SHADED 60
	[ vm_current, CARTELS ],
	[ vm_space, 1, 0, 2, (s)=>is_city(s) && can_stack_base(s) ],
	[ vm_place, 0, 0, CARTELS, BASE ],
	[ vm_endspace ],
	[ vm_space, 1, 0, 1, (s)=>is_space(s) ],
	[ vm_free_bribe ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 61
	[ vm_space, 1, 0, 1, (s)=>is_city(s) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_cartels_piece(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_resources, CARTELS, -6 ],
	[ vm_return ],
// SHADED 61
	[ vm_space, 1, 0, 3, (s)=>!has_cartels_piece(s) && can_stack_base(s) ],
	[ vm_place, 0, 0, CARTELS, BASE ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 62
	[ vm_piece, 0, 1, 3, (p,s)=>is_insurgent_piece(p) && is_zero_pop_forest(s) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 62
	[ vm_space, 1, 0, 3, (s)=>s === GUAINIA || s === VAUPES || s === AMAZONAS ],
	[ vm_place, 0, 0, CARTELS, BASE ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 63
	[ vm_current, CARTELS ],
	[ vm_space, 1, 0, 0, (s)=>has_cartels_guerrilla(s) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_cartels_guerrilla(p) && count_pieces(s, CARTELS, GUERRILLA) > 1 ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_piece_in_event_space(p) && is_cartels_guerrilla(p) ],
	[ vm_free_terror ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_terror_aid_cut ],
	[ vm_ineligible, CARTELS ],
	[ vm_return ],
// EVENT 64
	[ vm_prompt, "Place Shipments with FARC Guerrillas." ],
	[ vm_piece, 0, 0, 2, (p,s)=>is_farc_guerrilla(p) && has_cartels_base(s) && has_available_shipment() ],
	[ vm_place_shipment ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 64
	[ vm_prompt, "Select each Cartels Base in a City." ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_cartels_base(p) && is_city(s) ],
	[ vm_resources, CARTELS, 2 ],
	[ vm_endpiece ],
	[ vm_prompt, "Select each Cartels Base in a Dept." ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_cartels_base(p) && is_dept(s) ],
	[ vm_resources, CARTELS, 1 ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 65
	[ vm_space, 1, 0, 1, (s)=>is_mountain(s) ],
	[ vm_place_or_remove_shipment ],
	[ vm_place_or_remove_insurgent_base ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 66
	[ vm_piece, 0, 0, 3, (p,s)=>is_cartels_base(p) && is_forest(s) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 66
	[ vm_space, 1, 0, 0, (s)=>is_forest(s) && has_cartels_base(s) && can_stack_base(s) ],
	[ vm_place, 0, 0, CARTELS, BASE ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 67
	[ vm_resources, CARTELS, -20 ],
	[ vm_return ],
// SHADED 67
	[ vm_log, "This Resources phase, Cartels add Resources equal to 4 x Bases." ],
	[ vm_momentum ],
	[ vm_return ],
// EVENT 68
	[ vm_prompt, "Remove 2 Cartels pieces or up to 2 Shipments in coastal spaces." ],
	[ vm_select_shipment_or_cartels_piece_in_coastal_space ],
	[ vm_if, ()=>game.vm.p >= 0 ],
	[ vm_remove ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_coastal_space(s) && is_cartels_piece(p) ],
	[ vm_remove ],
	[ vm_endpiece ],
	[ vm_endif ],
	[ vm_if, ()=>game.vm.sh >= 0 ],
	[ vm_remove_shipment ],
	[ vm_shipment, 0, 1, 1, (p,s)=>is_coastal_space(s) ],
	[ vm_remove_shipment ],
	[ vm_endshipment ],
	[ vm_endif ],
	[ vm_return ],
// SHADED 68
	[ vm_prompt, "Select each Cartels piece in coastal spaces." ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_cartels_piece(p) && is_coastal_space(s) ],
	[ vm_resources, CARTELS, 2 ],
	[ vm_endpiece ],
	[ vm_return ],
// EVENT 69
	[ vm_prompt, "Select source space." ],
	[ vm_if, ()=>game.current === GOVT ],
	[ vm_space, 1, 0, 1, (s)=>has_cube(s) ],
	[ vm_mark_space ],
	[ vm_endspace ],
	[ vm_else ],
	[ vm_space, 1, 0, 1, (s)=>has_piece(s, game.current, GUERRILLA) ],
	[ vm_mark_space ],
	[ vm_endspace ],
	[ vm_endif ],
	[ vm_prompt, "Select destination space." ],
	[ vm_if, ()=>game.current === GOVT ],
	[ vm_space, 1, 0, 1, (s)=>(s !== game.vm.m[0]) && !is_farc_zone(s) && is_within_adjacent_depts(s, game.vm.m[0], 3) ],
	[ vm_prompt, "Move cubes to destination." ],
	[ vm_piece, 0, 1, 0, (p,s)=>(s === game.vm.m[0]) && is_cube(p) ],
	[ vm_move ],
	[ vm_endpiece ],
	[ vm_free_train_sweep_assault ],
	[ vm_endspace ],
	[ vm_else ],
	[ vm_space, 1, 0, 1, (s)=>(s !== game.vm.m[0]) && is_within_adjacent_depts(s, game.vm.m[0], 3) ],
	[ vm_prompt, "Move Guerrillas to destination." ],
	[ vm_piece, 0, 1, 0, (p,s)=>console.log("CHECK",p,s) || ((s === game.vm.m[0]) && is_piece(p, game.current, GUERRILLA)) ],
	[ vm_move ],
	[ vm_endpiece ],
	[ vm_free_rally_attack_terror ],
	[ vm_endspace ],
	[ vm_endif ],
	[ vm_return ],
// EVENT 70
	[ vm_prompt, "Select each Forest without Guerrillas." ],
	[ vm_space, 1, 0, 0, (s)=>is_forest(s) && !has_any_guerrilla(s) ],
	[ vm_resources, GOVT, 6 ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 70
	[ vm_current, [FARC,AUC,CARTELS] ],
	[ vm_space, 1, 0, 0, (s)=>is_forest(s) && has_piece(s, game.current, GUERRILLA) ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_piece_in_event_space(p) && is_piece(p, game.current, GUERRILLA) ],
	[ vm_free_terror ],
	[ vm_resources, ()=>(game.current), 3 ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_terror_aid_cut ],
	[ vm_return ],
// EVENT 71
	[ vm_prompt, "Remove a Guerrilla from Chocó." ],
	[ vm_set_space, CHOCO ],
	[ vm_piece, 0, 0, 1, (p,s)=>is_any_guerrilla(p) && s === CHOCO ],
	[ vm_remove ],
	[ vm_resources, ()=>(piece_faction(game.vm.p)), -5 ],
	[ vm_endpiece ],
	[ vm_return ],
// SHADED 71
	[ vm_capability ],
	[ vm_space, 1, 0, 1, (s)=>s === PANAMA ],
	[ vm_place, 0, 0, ()=>(game.current), BASE ],
	[ vm_place, 0, 0, ()=>(game.current), BASE ],
	[ vm_endspace ],
	[ vm_return ],
// EVENT 72
	[ vm_space, 1, 0, 2, (s)=>has_cartels_guerrilla(s) ],
	[ vm_piece, 0, 0, 0, (p,s)=>is_piece_in_event_space(p) && is_cartels_guerrilla(p) ],
	[ vm_remove ],
	[ vm_place, 0, 0, [FARC,AUC], GUERRILLA ],
	[ vm_endpiece ],
	[ vm_endspace ],
	[ vm_return ],
// SHADED 72
	[ vm_prompt, "Place all available Cartels Guerrillas into spaces with Cartels Bases." ],
	[ vm_while, ()=>has_piece(AVAILABLE, CARTELS, GUERRILLA) && count_pieces(AVAILABLE, CARTELS, BASE) < 15 ],
	[ vm_space, 1, 0, 1, (s)=>has_cartels_base(s) ],
	[ vm_place, 0, 0, CARTELS, GUERRILLA ],
	[ vm_endspace ],
	[ vm_endwhile ],
	[ vm_return ],
]
const UCODE = [0,1,7,13,19,29,65,79,85,92,98,104,110,116,122,139,146,153,159,166,176,189,199,206,222,236,248,258,266,279,293,303,314,320,332,341,354,364,377,389,402,424,436,445,459,469,480,497,519,532,541,558,572,583,599,613,627,636,651,664,684,699,710,718,730,744,749,757,762,782,811,825,838]
const SCODE = [0,4,10,16,24,59,70,82,90,95,101,107,113,119,130,142,151,156,162,0,183,194,203,215,227,242,253,263,272,287,300,310,318,326,334,349,0,369,383,394,409,431,441,453,464,473,0,504,528,536,552,567,576,0,0,622,629,643,656,672,691,706,714,0,735,0,753,759,777,0,816,832,845]
