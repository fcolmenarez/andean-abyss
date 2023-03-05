"use strict"

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
const BRASIL = 27
const ECUADOR = 28
const PANAMA = 29
const PERU = 30
const VENEZUELA = 31

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

		deck: [],
		president: 0,
		aid: 0,
		cylinder: [ ELIGIBLE, ELIGIBLE, ELIGIBLE, ELIGIBLE ],
		resources: [ 0, 0, 0, 0 ],
		shipments: [ AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE ],
		pieces: Array(153).fill(AVAILABLE),
		underground: [ 0, 0, 0, 0 ],
		farc_control: 0,
		govt_control: 0,
		support: Array(23).fill(NEUTRAL),
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

function is_city(s) {
	return s >= first_city && s <= last_city
}

function is_dept(s) {
	return s >= first_dept && s <= last_dept
}

function is_loc(s) {
	return s >= first_loc && s <= last_loc
}

function is_adjacent(a, b) {
	return set_has(data.spaces[a].adjacent, b)
}

function is_active(p) {
	return !is_underground(p)
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
	set_underground(p)
	game.pieces[p] = AVAILABLE
}

function place_piece(p, s) {
	set_underground(p)
	game.pieces[p] = s
}

function move_piece(p, s) {
	game.pieces[p] = s
}

function has_govt_control(s) {
	return game.govt_control & (1 << s)
}

function has_farc_control(s) {
	return game.farc_control & (1 << s)
}

function can_govt_civic_action(s) {
	return game.support[s] < 2 && has_govt_control(s) && has_piece(s, GOVT, TROOPS) && has_piece(s, GOVT, POLICE)
}

function for_each_piece(faction, type, f) {
	let p0 = first_piece[faction][type]
	let p1 = last_piece[faction][type]
	for (let p = p0; p <= p1; ++p)
		f(p)
}

function gen_piece_in_space(faction, type, space) {
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

function gen_activate_guerrilla(s, faction) {
	for_each_piece(faction, GUERRILLA, p => {
		if (game.pieces[p] === s)
			if (is_underground(p))
				gen_action_piece(p)
	})
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
	inactive: "1st Eligible",
	prompt() {
		view.prompt = "1st Eligible: Choose a Sequence of Play option."
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
	inactive: "2nd Eligible",
	prompt() {
		view.prompt = "2nd Eligible: Choose a Sequence of Play option."
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
		game.resources[game.current] += 3
	else
		game.resources[game.current] += 1
	resume_event_card()
}

function goto_limop_or_event() {
	push_undo()
	game.state = "limop_or_event"
}

states.limop_or_event = {
	prompt() {
		view.prompt = "2nd Eligible: Event or Limited Operation?"
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
	log("TODO: Event")
	resume_event_card()
}

function goto_op_only() {
	log_h2(faction_name[game.current] + " - Op Only")
	goto_operation(0, 0, 0)
}

function goto_op_and_sa() {
	log_h2(faction_name[game.current] + " - Op + Special")
	goto_operation(0, 0, 1)
}

function goto_limop() {
	log_h2(faction_name[game.current] + " - LimOp")
	goto_operation(0, 1, 0)
}

function goto_operation(free, limited, special) {
	game.state = "op"
	game.op = {
		free,
		limited,
		spaces: [],
		pieces: 0,
		count: 0,
	}
	game.sa = special
}

function end_operation() {
	game.op = null
	resume_event_card()
}

function can_use_special_activity() {
	return game.sa === 1
}

function action_remove() {
	push_undo()
	game.save_state = game.state
	game.state = "remove"
}

states.remove = {
	prompt() {
		view.prompt = "Remove pieces to Available Forces."
		for (let p = first_piece[game.current][BASE]; p <= last_piece[game.current][BASE]; ++p)
			if (game.pieces[p] !== AVAILABLE)
				gen_action_piece(p)
		if (game.current === GOVT) {
			for (let p = first_piece[game.current][TROOPS]; p <= last_piece[game.current][TROOPS]; ++p)
				if (game.pieces[p] !== AVAILABLE)
					gen_action_piece(p)
			for (let p = first_piece[game.current][POLICE]; p <= last_piece[game.current][POLICE]; ++p)
				if (game.pieces[p] !== AVAILABLE)
					gen_action_piece(p)
		} else {
			for (let p = first_piece[game.current][GUERRILLA]; p <= last_piece[game.current][GUERRILLA]; ++p)
				if (game.pieces[p] !== AVAILABLE)
					gen_action_piece(p)
		}
		view.actions.done = 1
	},
	piece(p) {
		remove_piece(p)
		update_control()
	},
	done() {
		game.state = game.save_state
		game.save_state = 0
	},
}

// === OPERATIONS ===

states.op = {
	prompt() {
		view.prompt = "Choose an Operation."
		if (game.current === GOVT) {
			view.actions.train = 1
			if (game.op.free || game.resources[game.current] >= 3)
				view.actions.patrol = 1
			else
				view.actions.patrol = 0
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
		game.state = "patrol"
		if (!game.op.free)
			game.resources[game.current] -= 3
	},
	sweep() {
		push_undo()
		log_h3("Sweep")
		game.state = "sweep"
	},
	assault() {
		push_undo()
		log_h3("Assault")
		game.state = "assault"
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
		view.actions.done = 1
	else
		view.actions.done = 0
}

function can_select_op_space(cost) {
	if (!game.free && game.resources[game.current] < cost)
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
	if (!game.free)
		game.resources[game.current] -= cost
}

// OPERATION: TRAIN

states.train = {
	prompt() {
		view.prompt = "Train: Place cubes first, then replace with Base or buy Civic Action."

		if (can_use_special_activity()) {
			view.actions.air_lift = 1
			view.actions.eradicate = 1
		}

		// Any Departments or Cities
		if (can_select_op_space(3)) {
			for (let s = first_space; s <= last_dept; ++s)
				if (is_city(s) || has_piece(s, GOVT, BASE))
					if (!is_selected_op_space(s))
						gen_action_space(s)
		}

		// place base
		view.actions.base = 1

		// buy civic action
		if (game.resources[game.current] >= 3)
			view.actions.civic = 1
		else
			view.actions.civic = 0

		gen_operation_common()
	},
	space(s) {
		push_undo()

		logi(`S${s}.`)

		select_op_space(s, 3)

		game.state = "train_place"
		game.op.where = s
		game.op.count = 6
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
	done() {
		end_operation()
	},
	air_lift: goto_air_lift,
	eradicate: goto_eradicate,
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
		push_undo()
		place_piece(p, game.op.where)
		if (--game.op.count == 0)
			game.state = "train"
		update_control()
	},
	next() {
		game.op.count = 0
		game.state = "train"
	},
}

states.train_base = {
	prompt() {
		if (game.op.where < 0) {
			view.prompt = `Train: Replace 3 cubes with a Base.`
			for (let s = first_space; s <= last_dept; ++s) {
				if (can_select_op_space(3) || is_selected_op_space(s))
					if (count_bases(s) < 2 && count_cubes(s) >= 3)
						gen_action_space(s)
			}
		} else {
			if (game.op.count < 0) {
				view.prompt = `Train: All done.`
				view.actions.done = 1
			} else if (game.op.count > 0) {
				view.prompt = `Train: ${game.op.count} cubes with a Base.`
				gen_piece_in_space(GOVT, POLICE, game.op.where)
				gen_piece_in_space(GOVT, TROOPS, game.op.where)
			} else {
				view.prompt = `Train: Place Base.`
				gen_place_piece(game.op.where, GOVT, BASE)
			}
		}
	},
	space(s) {
		push_undo()
		if (!is_selected_op_space(s))
			select_op_space(s, 3)
		game.op.where = s
		game.op.count = 3
	},
	piece(p) {
		push_undo()
		if (game.op.count > 0)
			remove_piece(p)
		else
			place_piece(p, game.op.where)
		--game.op.count
		update_control()
	},
	done: end_operation,
}

states.train_civic = {
	prompt() {
		let res = game.resources[game.current]
		if (game.op.where < 0) {
			view.prompt = `Train: Buy Civic Action.`
			if (res >= 3) {
				for (let s = first_space; s <= last_dept; ++s) {
					if (can_select_op_space(6) || is_selected_op_space(s))
						if (can_govt_civic_action(s))
							gen_action_space(s)
				}
			}
		} else {
			view.prompt = `Train: Buy Civic Action in ${space_name[game.op.where]}.`
			view.where = game.op.where
			if (res >= 3 && can_govt_civic_action(game.op.where))
				gen_action_space(game.op.where)
			else
				view.prompt = `Train: All done.`
			view.actions.done = 1
		}
	},
	space(s) {
		push_undo()
		if (!is_selected_op_space(s))
			select_op_space(s, 3)
		game.op.where = s
		game.resources[game.current] -= 3
		game.support[game.op.where] += 1
	},
	done: end_operation,
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

		if (can_use_special_activity()) {
			if (game.current === FARC)
				view.actions.extort = 1
			if (game.current === AUC)
				view.actions.extort = 1
			if (game.current === CARTELS) {
				view.actions.cultivate = 1
				view.actions.process = 1
				view.actions.bribe = 1
			}
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

		game.state = "rally_place"
		game.op.where = s
		game.op.count = rally_count()
	},
	done: end_operation,
	extort: goto_extort,
	cultivate: goto_cultivate,
	process: goto_process,
	bribe: goto_bribe,
}

states.rally_place = {
	prompt() {
		view.prompt = `Rally: Place up to ${game.op.count} Guerrillas.`
		view.where = game.op.where

		if (game.op.count === rally_count()) {
			view.actions.base = 0
			view.actions.flip = 0
			view.actions.move = 0
			if (count_pieces(game.op.where, game.current, GUERRILLA) >= 2) {
				if (count_bases(game.op.where) < 2)
					view.actions.base = 1
			}
			if (has_piece(game.op.where, game.current, BASE)) {
				if (has_active_guerrilla(game.op.where, game.current))
					view.actions.flip = 1
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
	flip() {
		push_undo()
		logi("Flipped.")
		for_each_piece(game.current, GUERRILLA, p => {
			if (game.pieces[p] === game.op.where)
				set_underground(p)
		})
		game.state = "rally"
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
			gen_piece_in_space(game.current, GUERRILLA, game.op.where)
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
		}
		update_control()
	},
}

states.rally_move = {
	prompt() {
		view.where = game.op.where

		view.prompt = `Rally: Move any Guerrillas to ${space_name[game.op.where]}.`

		for_each_piece(game.current, GUERRILLA, p => {
			if (game.pieces[p] !== game.op.where && game.pieces[p] !== AVAILABLE)
				gen_action_piece(p)
		})

		view.actions.next = 1
	},
	piece(p) {
		push_undo()
		move_piece(p, game.op.where)
		game.op.count++
		update_control()
	},
	next() {
		push_undo()
		game.op.count = 0
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

		if (can_use_special_activity()) {
			if (game.current === FARC)
				view.actions.extort = 1
			if (game.current === AUC)
				view.actions.extort = 1
			if (game.current === CARTELS) {
				view.actions.cultivate = 1
				view.actions.process = 1
				view.actions.bribe = 1
			}
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
	done: end_operation,
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
	console.log("MARCH", group)
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

states.attack = {
	prompt() {
		view.prompt = "Attack: Select space with Guerrilla and enemy piece."

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
	done: end_operation,
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
	ambush() {
		push_undo()
		game.state = "ambush"
		game.sa = 0
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
}

states.ambush = {
	prompt() {
		view.prompt = `Ambush in ${space_name[game.op.where]}: Activate an Underground Guerrilla.`
		gen_activate_guerrilla(game.op.where, game.current)
	},
	piece(p) {
		set_active(p)
		game.state = "attack_remove"
		game.op.count = 2
	}
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
		game.state = "attack_remove"
		game.op.count = 2
	}
}

function gen_remove_piece(s, faction) {
	if (faction === GOVT) {
		gen_piece_in_space(GOVT, TROOPS, game.op.where)
		gen_piece_in_space(GOVT, POLICE, game.op.where)
		if (!has_piece(game.op.where, GOVT, TROOPS) && !has_piece(game.op.where, GOVT, POLICE))
			gen_piece_in_space(GOVT, BASE, game.op.where)
	} else {
		gen_piece_in_space(faction, GUERRILLA, game.op.where)
		if (!has_piece(game.op.where, faction, GUERRILLA))
			gen_piece_in_space(faction, BASE, game.op.where)
	}
}

states.attack_remove = {
	prompt() {
		view.prompt = `Attack in ${space_name[game.op.where]}: Remove up to ${game.op.count} enemy pieces.`
		view.where = game.op.where
		view.actions.next = 1

		gen_remove_piece(game.op.where, GOVT)
		if (game.current !== FARC)
			gen_remove_piece(game.op.where, FARC)
		if (game.current !== AUC)
			gen_remove_piece(game.op.where, AUC)
		if (game.current !== CARTELS)
			gen_remove_piece(game.op.where, CARTELS)
	},
	piece(p) {
		push_undo()
		remove_piece(p)
		if (--game.op.count === 0 || !has_enemy_piece(game.op.where, game.current))
			game.state = "attack"
	},
	next() {
		game.state = "attack"
		game.op.count = 0
	}
}

// OPERATION: TERROR

states.terror = {
	prompt() {
	},
	space(s) {
	},
}

// === SPECIAL ACTIVITIES ===

function goto_air_lift() {
	push_undo()
	game.save_state = game.state
	game.state = "air_lift"
}

function goto_air_strike() {
	push_undo()
	game.save_state = game.state
	game.state = "air_strike"
}

function goto_eradicate() {
	push_undo()
	game.save_state = game.state
	game.state = "eradicate"
}

function goto_extort() {
	push_undo()
	game.save_state = game.state
	game.state = "extort"
}

function goto_ambush() {
	push_undo()
	game.save_state = game.state
	game.state = "ambush"
}

function goto_kidnap() {
	push_undo()
	game.save_state = game.state
	game.state = "kidnap"
}

function goto_assassinate() {
	push_undo()
	game.save_state = game.state
	game.state = "assassinate"
}

function goto_cultivate() {
	push_undo()
	game.save_state = game.state
	game.state = "cultivate"
}

function goto_process() {
	push_undo()
	game.save_state = game.state
	game.state = "process"
}

function goto_bribe() {
	push_undo()
	game.save_state = game.state
	game.state = "bribe"
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

		if (game.op) {
			view.actions.remove = 1
			/*
			if (game.active === "Government + AUC")
				view.actions.trade = [ FARC, CARTELS ]
			if (game.active === "FARC + Cartels")
				view.actions.trade = [ GOVT, AUC ]
			if (game.active === "AUC + Cartels")
				view.actions.trade = [ GOVT, FARC ]
			if (game.active === "Government")
				view.actions.trade = [ FARC, AUC, CARTELS ]
			if (game.active === "FARC")
				view.actions.trade = [ GOVT, AUC, CARTELS ]
			if (game.active === "AUC")
				view.actions.trade = [ GOVT, FARC, CARTELS ]
			if (game.active === "Cartels")
				view.actions.trade = [ GOVT, FARC, AUC ]
			*/
		}

		if (states[game.state])
			states[game.state].prompt()
		else
			view.prompt = "Unknown state: " + game.state

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
	Object.seal(game) // XXX: don't allow adding properties

	let S = states[game.state]
	if (S && action in S) {
		S[action](arg)
	} else {
		if (action === "undo" && game.undo && game.undo.length > 0)
			pop_undo()
		else if (action === "remove")
			action_remove()
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

