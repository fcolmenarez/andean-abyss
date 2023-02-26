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

const space_name = data.space_name

const first_piece = data.first_piece
const last_piece = data.last_piece

const first_pop = data.first_pop
const first_city = data.first_city
const last_city = data.last_city
const first_dept = data.first_dept
const last_pop = data.last_pop
const last_dept = data.last_dept
const first_foreign = data.first_foreign
const last_foreign = data.last_foreign
const first_loc = data.first_loc
const last_loc = data.last_loc

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

		op_spaces: null,
		sa_spaces: null,

		deck: [],
		president: 0,
		aid: 0,
		cylinder: [ ELIGIBLE, ELIGIBLE, ELIGIBLE, ELIGIBLE ],
		resources: [ 0, 0, 0, 0 ],
		shipments: [ AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE ],
		pieces: Array(153).fill(AVAILABLE),
		underground: [ 0, -1, -1, -1 ],
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

	set_support(ATLANTICO, ACTIVE_SUPPORT)
	set_support(SANTANDER, ACTIVE_SUPPORT)
	for (let s = first_city; s <= last_city; ++s)
		if (s !== CALI)
			set_support(s, ACTIVE_SUPPORT)

	set_support(CHOCO, ACTIVE_OPPOSITION)
	set_support(ARAUCA, ACTIVE_OPPOSITION)
	set_support(META_EAST, ACTIVE_OPPOSITION)
	set_support(META_WEST, ACTIVE_OPPOSITION)
	set_support(GUAVIARE, ACTIVE_OPPOSITION)
	set_support(PUTUMAYO, ACTIVE_OPPOSITION)
	set_support(NARINO, ACTIVE_OPPOSITION)

	place_piece(GOVT, TROOPS, 3, BOGOTA)
	place_piece(GOVT, TROOPS, 3, MEDELLIN)
	place_piece(GOVT, TROOPS, 3, CALI)
	place_piece(GOVT, TROOPS, 3, SANTANDER)
	place_piece(GOVT, POLICE, 2, BOGOTA)
	for (let s = first_city; s <= last_city; ++s)
		if (s !== BOGOTA)
			place_piece(GOVT, POLICE, 1, s)
	place_piece(GOVT, BASE, 1, SANTANDER)

	place_piece(FARC, GUERRILLA, 1, NARINO)
	place_piece(FARC, GUERRILLA, 1, CHOCO)
	place_piece(FARC, GUERRILLA, 1, SANTANDER)
	place_piece(FARC, GUERRILLA, 1, HUILA)
	place_piece(FARC, GUERRILLA, 1, ARAUCA)
	place_piece(FARC, GUERRILLA, 1, META_EAST)
	place_piece(FARC, GUERRILLA, 2, META_WEST)
	place_piece(FARC, GUERRILLA, 2, GUAVIARE)
	place_piece(FARC, GUERRILLA, 2, PUTUMAYO)
	place_piece(FARC, BASE, 1, CHOCO)
	place_piece(FARC, BASE, 1, HUILA)
	place_piece(FARC, BASE, 1, ARAUCA)
	place_piece(FARC, BASE, 1, META_EAST)
	place_piece(FARC, BASE, 1, META_WEST)
	place_piece(FARC, BASE, 1, GUAVIARE)

	place_piece(AUC, GUERRILLA, 1, ATLANTICO)
	place_piece(AUC, GUERRILLA, 1, ANTIOQUIA)
	place_piece(AUC, GUERRILLA, 1, SANTANDER)
	place_piece(AUC, GUERRILLA, 1, ARAUCA)
	place_piece(AUC, GUERRILLA, 1, GUAVIARE)
	place_piece(AUC, GUERRILLA, 1, PUTUMAYO)
	place_piece(AUC, BASE, 1, ANTIOQUIA)

	place_piece(CARTELS, GUERRILLA, 1, CALI)
	place_piece(CARTELS, GUERRILLA, 1, PUTUMAYO)
	place_piece(CARTELS, BASE, 1, CALI)
	place_piece(CARTELS, BASE, 1, META_EAST)
	place_piece(CARTELS, BASE, 1, META_WEST)
	place_piece(CARTELS, BASE, 1, GUAVIARE)
	place_piece(CARTELS, BASE, 2, PUTUMAYO)
}

function setup_quick() {
	place_piece(CARTELS, GUERRILLA, 4, MEDELLIN)
	place_piece(CARTELS, BASE, 1, MEDELLIN)

	set_support(CALI, ACTIVE_SUPPORT)
	place_piece(GOVT, POLICE, 4, CALI)
	remove_piece(CARTELS, GUERRILLA, 1, CALI)
	remove_piece(CARTELS, BASE, 1, CALI)

	place_piece(GOVT, TROOPS, 6, BOGOTA)

	place_piece(AUC, BASE, 1, SANTANDER)

	set_support(ARAUCA, NEUTRAL)
	place_piece(AUC, GUERRILLA, 1, ARAUCA)

	set_add(game.farc_zones, META_WEST)
	place_piece(FARC, GUERRILLA, 4, META_WEST)

	set_support(HUILA, ACTIVE_OPPOSITION)
	place_piece(FARC, GUERRILLA, 3, HUILA)
	place_piece(AUC, GUERRILLA, 2, HUILA)
	place_piece(CARTELS, BASE, 1, HUILA)

	place_piece(FARC, GUERRILLA, 2, VAUPES)

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

function set_support(place, amount) {
	game.support[place] = amount
}

function get_support(place, amount) {
	return game.support[place]
}

function place_piece(faction, type, count, where) {
	for (let p = first_piece[faction][type]; count > 0; ++p) {
		if (game.pieces[p] < 0) {
			game.pieces[p] = where
			--count
		}
	}
}

function remove_piece(faction, type, count, where) {
	for (let p = first_piece[faction][type]; count > 0; ++p) {
		if (game.pieces[p] === where) {
			game.pieces[p] = AVAILABLE
			--count
		}
	}
}

function count_pieces_imp(s, faction, type) {
	let first = first_piece[faction][type]
	let last = last_piece[faction][type]
	let n = 0
	for (let p = first; p <= last; ++p)
		if (game.pieces[p] === s)
			++n
	return n
}

function update_control() {
	game.govt_control = 0
	game.farc_control = 0
	for (let s = 0; s <= last_dept; ++s) {
		let g = count_pieces_imp(s, GOVT, BASE) +
			count_pieces_imp(s, GOVT, TROOPS) +
			count_pieces_imp(s, GOVT, POLICE)
		let f = count_pieces_imp(s, FARC, BASE) +
			count_pieces_imp(s, FARC, GUERRILLA)
		let a = count_pieces_imp(s, AUC, BASE) +
			count_pieces_imp(s, AUC, GUERRILLA)
		let c = count_pieces_imp(s, CARTELS, BASE) +
			count_pieces_imp(s, CARTELS, GUERRILLA)
		if (g > a + c + f)
			game.govt_control |= (1 << s)
		else if (f > g + a + c)
			game.farc_control |= (1 << s)
	}
}

function is_city(s) {
	return s <= last_city
}

function has_govt_base(s) {
	return set_has(game.govt.bases, s)
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

// === SEQUENCE OF PLAY ===

function this_card() {
	return game.deck[0]
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
				goto_op_only()
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
	game.state = "op"
	game.op_spaces = []
	game.sa_spaces = null
}

function goto_op_and_sa() {
	log_h2(faction_name[game.current] + " - Op + Special")
	game.state = "op"
	game.op_spaces = []
	game.sa_spaces = []
}

function goto_limop() {
	log_h2(faction_name[game.current] + " - LimOp")
	game.state = "op"
	game.op_spaces = []
	game.sa_spaces = null
}

function can_use_special_activity() {
	let faction = current_faction()
	if (faction.cylinder === SOP_1ST_OP_AND_SA || faction.cylinder === SOP_2ND_OP_AND_SA)
		return true
	return false
}

states.op = {
	prompt() {
		view.prompt = "Choose an Operation."
		if (game.current === GOVT) {
			view.actions.train = 1
			view.actions.patrol = 1
			view.actions.sweep = 1
			view.actions.assault = 1
		} else {
			view.actions.rally = 1
			view.actions.march = 1
			view.actions.attack = 1
			view.actions.terror = 1
		}
		view.actions.remove = 1
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

	remove() {
		push_undo()
		game.save_state = game.state
		game.state = "remove"
	},
}

function for_each_own_piece(f) {
	f(p)
}

states.remove = {
	prompt() {
		view.prompt = "Remove pieces to Available Forces."
		for_each_own_piece(p => {
			if (game.pieces[p] !== AVAILABLE)
				gen_action("piece", p)
		})
		view.actions.done = 1
	},
	piece(p) {
		push_undo()
		game.pieces[p] = AVAILABLE
	},
	done() {
		game.state = game.save_state
		game.save_state = 0
	}
}

states.train = {
	prompt() {
		let faction = current_faction()

		view.prompt = "Train: Select spaces."

		if (can_use_special_activity()) {
			view.actions.air_lift = 1
			view.actions.eradicate = 1
		}

		// Any Departments or Cities
		if (faction.resources >= 3) {
			for (let s = 0; s <= last_dept; ++s) {
				if (!set_has(game.op_spaces, s))
					gen_action("space", s)
			}
		}
	},
	air_lift() {
		push_undo()
		game.state = "air_lift"
	},
	eradicate() {
		push_undo()
		game.state = "eradicate"
	},
	space(s) {
		push_undo()
		logi(`S${s}.`)
		let faction = current_faction()
		faction.resources -= 3
		set_add(game.op_spaces, s)
		game.where = s
		if (is_city(s) || has_govt_base(s)) {
			game.state = "train_place_cubes"
			game.selected = -1
			game.count = 6
		} else {
			game.state = "train_base_or_civic"
		}
	},
}

function gen_select_available(action, list) {
	for (let i = list.length; i-- > 0; ) {
		if (list[i] === AVAILABLE) {
			gen_action(action, i)
			return
		}
	}
	for (let i = 0; i < list.length; ++i)
		gen_action(action, i)
}

states.train_place_cubes = {
	prompt() {
		view.prompt = `Train in ${space_name[game.where]}: Place up to ${game.count} cubes.`

		if (game.selected < 0) {
			gen_select_available("govt_police", game.govt.police)
			gen_select_available("govt_troops", game.govt.troops)
		}
	},
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
	// Object.seal(game) // XXX: don't allow adding properties
	let S = states[game.state]
	if (S && action in S) {
		S[action](arg)
	} else {
		if (action === "undo" && game.undo && game.undo.length > 0)
			pop_undo()
		else
			throw new Error("Invalid action: " + action)
	}
	return save_game()
}

exports.is_checkpoint = function (a, b) {
	return a.turn !== b.turn
}

// === COMMON LIBRARY ===

// Packed array of small numbers in one word

function pack1_get(word, n) {
	return (word >>> n) & 1
}

function pack2_get(word, n) {
	n = n << 1
	return (word >>> n) & 3
}

function pack4_get(word, n) {
	n = n << 2
	return (word >>> n) & 15
}

function pack1_set(word, n, x) {
	return (word & ~(1 << n)) | (x << n)
}

function pack2_set(word, n, x) {
	n = n << 1
	return (word & ~(3 << n)) | (x << n)
}

function pack4_set(word, n, x) {
	n = n << 2
	return (word & ~(15 << n)) | (x << n)
}

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
