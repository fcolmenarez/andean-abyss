"use strict"

let states = {}
let game = null
let view = null

const data = require("./data.js")

const GOVT = "Government"
const AUC = "AUC"
const CARTELS = "Cartels"
const FARC = "FARC"

// For 3 and 2 player games
const AUC_CARTELS = "AUC + Cartels"
const GOVT_AUC = "Government + AUC"
const FARC_CARTELS = "FARC + Cartels"

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

// Control ?
const UNCONTROLLED = 0
const CTL_GOVERNMENT = 1
const CTL_AUC = 2
const CTL_CARTELS = 3
const CTL_FARC = 4

const SAMPER = 1
const PASTRANA = 2
const URIBE = 3

const first_pop = 1
const first_city = 0
const last_city = 10
const first_dept = 11
const last_pop = 22
const last_dept = 26
const first_foreign = 27
const last_foreign = 31
const first_loc = 32
const last_loc = 49

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
		return [ GOVT_AUC, FARC_CARTELS ]
	if (scenario.startsWith("3P"))
		return [ GOVT, FARC, AUC_CARTELS ]
	return [ GOVT, AUC, CARTELS, FARC ]
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
	if (game.scenario !== 4)
		game.active = game.save_active
}

function save_game() {
	if (game.scenario === 3) {
		game.save_active = game.active
		if (game.active === AUC || game.active === CARTELS)
			game.active = AUC_CARTELS
	}
	if (game.scenario === 2) {
		game.save_active = game.active
		if (game.active === GOVT || game.active === AUC)
			game.active = GOVT_AUC
		if (game.active === FARC || game.active === CARTELS)
			game.active = FARC_CARTELS
	}
	return game
}

exports.setup = function (seed, scenario, options) {
	game = {
		seed,
		log: [],
		undo: [],

		scenario: 4,
		active: null,
		state: null,

		op_spaces: null,
		sa_spaces: null,

		deck: [],
		misc: {
			aid: 0,
			president: 0,
			shipments: [ AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE ],
			control: Array(27).fill(0),
			support: Array(23).fill(NEUTRAL),
			farc_zones: [],
			terror: [],
			sabotage: [],
		},
		govt: {
			cylinder: ELIGIBLE,
			resources: 0,
			troops: Array(30).fill(AVAILABLE),
			police: Array(30).fill(AVAILABLE),
			bases: Array(3).fill(AVAILABLE),
		},
		auc: {
			cylinder: ELIGIBLE,
			resources: 0,
			guerrillas: Array(18).fill(AVAILABLE),
			bases: Array(6).fill(AVAILABLE),
			active: 0,
		},
		cartels: {
			cylinder: ELIGIBLE,
			resources: 0,
			guerrillas: Array(12).fill(AVAILABLE),
			bases: Array(15).fill(AVAILABLE),
			active: 0,
		},
		farc: {
			cylinder: ELIGIBLE,
			resources: 0,
			guerrillas: Array(30).fill(AVAILABLE),
			bases: Array(9).fill(AVAILABLE),
			active: 0,
		},
	}

	if (scenario.startsWith("3P"))
		game.scenario = 3
	if (scenario.startsWith("2P"))
		game.scenario = 2

	setup_standard()

	if (scenario === "Quick") {
		log_h1("Scenario: Quick")
		setup_quick()
		setup_quick_deck()
	} else if (scenario === "Short") {
		setup_short_deck()
	} else {
		setup_standard_deck()
	}

	update_control()

	goto_card()

	return save_game()
}

function setup_standard() {
	game.misc.aid = 9
	game.misc.president = SAMPER
	game.govt.resources = 40
	game.auc.resources = 10
	game.cartels.resources = 10
	game.farc.resources = 10

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

	place_piece(game.govt.troops, 3, BOGOTA)
	place_piece(game.govt.troops, 3, MEDELLIN)
	place_piece(game.govt.troops, 3, CALI)
	place_piece(game.govt.troops, 3, SANTANDER)
	place_piece(game.govt.police, 2, BOGOTA)
	for (let s = first_city; s <= last_city; ++s)
		if (s !== BOGOTA)
			place_piece(game.govt.police, 1, s)
	place_piece(game.govt.bases, 1, SANTANDER)

	place_piece(game.farc.guerrillas, 1, NARINO)
	place_piece(game.farc.guerrillas, 1, CHOCO)
	place_piece(game.farc.guerrillas, 1, SANTANDER)
	place_piece(game.farc.guerrillas, 1, HUILA)
	place_piece(game.farc.guerrillas, 1, ARAUCA)
	place_piece(game.farc.guerrillas, 1, META_EAST)
	place_piece(game.farc.guerrillas, 2, META_WEST)
	place_piece(game.farc.guerrillas, 2, GUAVIARE)
	place_piece(game.farc.guerrillas, 2, PUTUMAYO)
	place_piece(game.farc.bases, 1, CHOCO)
	place_piece(game.farc.bases, 1, HUILA)
	place_piece(game.farc.bases, 1, ARAUCA)
	place_piece(game.farc.bases, 1, META_EAST)
	place_piece(game.farc.bases, 1, META_WEST)
	place_piece(game.farc.bases, 1, GUAVIARE)

	place_piece(game.auc.guerrillas, 1, ATLANTICO)
	place_piece(game.auc.guerrillas, 1, ANTIOQUIA)
	place_piece(game.auc.guerrillas, 1, SANTANDER)
	place_piece(game.auc.guerrillas, 1, ARAUCA)
	place_piece(game.auc.guerrillas, 1, GUAVIARE)
	place_piece(game.auc.guerrillas, 1, PUTUMAYO)
	place_piece(game.auc.bases, 1, ANTIOQUIA)

	place_piece(game.cartels.guerrillas, 1, CALI)
	place_piece(game.cartels.guerrillas, 1, PUTUMAYO)
	place_piece(game.cartels.bases, 1, CALI)
	place_piece(game.cartels.bases, 1, META_EAST)
	place_piece(game.cartels.bases, 1, META_WEST)
	place_piece(game.cartels.bases, 1, GUAVIARE)
	place_piece(game.cartels.bases, 2, PUTUMAYO)
}

function setup_quick() {
	place_piece(game.cartels.guerrillas, 4, MEDELLIN)
	place_piece(game.cartels.bases, 1, MEDELLIN)

	set_support(CALI, ACTIVE_SUPPORT)
	place_piece(game.govt.police, 4, CALI)
	remove_piece(game.cartels.guerrillas, 1, CALI)
	remove_piece(game.cartels.bases, 1, CALI)

	place_piece(game.govt.troops, 6, BOGOTA)

	place_piece(game.auc.bases, 1, SANTANDER)

	set_support(ARAUCA, NEUTRAL)
	place_piece(game.auc.guerrillas, 1, ARAUCA)

	set_add(game.misc.farc_zones, META_WEST)
	place_piece(game.farc.guerrillas, 4, META_WEST)

	set_support(HUILA, ACTIVE_OPPOSITION)
	place_piece(game.farc.guerrillas, 3, HUILA)
	place_piece(game.auc.guerrillas, 2, HUILA)
	place_piece(game.cartels.bases, 1, HUILA)

	place_piece(game.farc.guerrillas, 2, VAUPES)

	game.auc.resources = 5
	game.farc.resources = 10
	game.cartels.resources = 20
	game.govt.resources = 30

	game.misc.president = PASTRANA
}

function shuffle_all_cards() {
	let deck = []
	for (let i = 1; i <= 72; ++i)
		deck.push(i)
	shuffle(deck)
	return deck
}

function setup_standard_deck() {
	let cards = shuffle_all_cards()
	let piles = [
		cards.slice(0, 15),
		cards.slice(15, 15+15),
		cards.slice(30, 30+15),
		cards.slice(45, 45+15),
	]
	piles[0].push(73)
	piles[1].push(74)
	piles[2].push(75)
	piles[3].push(76)
	shuffle(piles[0])
	shuffle(piles[1])
	shuffle(piles[2])
	shuffle(piles[3])
	game.deck = piles[0].concat(piles[1], piles[2], piles[3])
}

function setup_short_deck() {
	let cards = shuffle_all_cards()
	let piles = [
		cards.slice(0, 15),
		cards.slice(15, 15+15),
		cards.slice(30, 30+15),
	]
	piles[0].push(73)
	piles[1].push(74)
	piles[2].push(75)
	shuffle(piles[0])
	shuffle(piles[1])
	shuffle(piles[2])
	game.deck = piles[0].concat(piles[1], piles[2], piles[3])
}

function setup_quick_deck() {
	let cards = shuffle_all_cards()
	let piles = [
		cards.slice(0, 6),
		cards.slice(6, 6+6),
		cards.slice(12, 12+6),
		cards.slice(24, 24+6),
	]
	piles[1].push(73)
	piles[3].push(74)
	shuffle(piles[1])
	shuffle(piles[3])
	game.deck = piles[0].concat(piles[1], piles[2], piles[3])
}

function set_support(place, amount) {
	game.misc.support[place] = amount
}

function get_support(place, amount) {
	return game.misc.support[place]
}

function place_piece(list, count, where) {
	for (let i = 0; i < list.length && count > 0; ++i) {
		if (list[i] < 0) {
			list[i] = where
			--count
		}
	}
	if (count !== 0)
		throw Error("bad piece count")
}

function remove_piece(list, count, where) {
	for (let i = 0; i < list.length && count > 0; ++i) {
		if (list[i] === where) {
			list[i] = AVAILABLE
			--count
		}
	}
	if (count !== 0)
		throw Error("bad piece count")
}

function count_pieces_imp(s, list) {
	let n = 0
	for (let i = 0; i < list.length; ++i)
		if (list[i] === s)
			++n
	return n
}

function update_control() {
	for (let s = 0; s <= last_dept; ++s) {
		let g = count_pieces_imp(s, game.govt.troops) +
			count_pieces_imp(s, game.govt.police) +
			count_pieces_imp(s, game.govt.bases)
		let a = count_pieces_imp(s, game.auc.guerrillas) +
			count_pieces_imp(s, game.auc.bases)
		let c = count_pieces_imp(s, game.cartels.guerrillas) +
			count_pieces_imp(s, game.cartels.bases)
		let f = count_pieces_imp(s, game.farc.guerrillas) +
			count_pieces_imp(s, game.farc.bases)
		if (g > a + c + f)
			game.misc.control[s] = 1
		else if (f > g + a + c)
			game.misc.control[s] = 2
		else
			game.misc.control[s] = 0
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
	if (faction.cylinder === INELIGIBLE || faction.cylinder === SOP_PASS)
		faction.cylinder = ELIGIBLE
	else if (faction.cylinder !== ELIGIBLE)
		faction.cylinder = INELIGIBLE
}

function end_card() {
	adjust_eligibility(game.govt)
	adjust_eligibility(game.auc)
	adjust_eligibility(game.cartels)
	adjust_eligibility(game.farc)

	clear_undo()
	array_remove(game.deck, 0)
	goto_card()
}

function current_faction() {
	switch (game.active) {
	case GOVT: return game.govt
	case AUC: return game.auc
	case CARTELS: return game.cartels
	case FARC: return game.farc
	}
}

function is_eligible(faction) {
	switch (faction) {
	case GOVT: return game.govt.cylinder === ELIGIBLE
	case AUC: return game.auc.cylinder === ELIGIBLE
	case CARTELS: return game.cartels.cylinder === ELIGIBLE
	case FARC: return game.farc.cylinder === ELIGIBLE
	}
	return false
}

function next_eligible_faction() {
	let order = data.cards[this_card()].order
	for (let faction of order)
		if (is_eligible(faction))
			return faction
	return null
}

function did_option(e) {
	return (
		game.govt.cylinder === e ||
		game.auc.cylinder === e ||
		game.cartels.cylinder === e ||
		game.farc.cylinder === e
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
	game.active = next_eligible_faction()
	if (game.active === null)
		end_card()
	else
		game.state = "eligible1"
}

function goto_eligible2() {
	game.active = next_eligible_faction()
	if (game.active === null)
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
	sop(e) {
		push_undo()
		let faction = current_faction()
		faction.cylinder = e
		switch (e) {
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
	sop(e) {
		push_undo()
		let faction = current_faction()
		faction.cylinder = e
		switch (e) {
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
	log_h2(game.active + " - Pass")
	let faction = current_faction()
	if (game.active === GOVT)
		faction.resources += 3
	else
		faction.resources += 1
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
	log_h2(game.active + " - Event")
	log("TODO: Event")
	resume_event_card()
}

function goto_op_only() {
	log_h2(game.active + " - Op only")
	game.state = "op"
	game.op_spaces = []
	game.sa_spaces = null
}

function goto_op_and_sa() {
	log_h2(game.active + " - Op + Special")
	game.state = "op"
	game.op_spaces = []
	game.sa_spaces = []
}

function goto_limop() {
	log_h2(game.active + " - LimOp")
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
		if (game.active === GOVT) {
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
	},
}

// === GAME OVER ===

function goto_game_over(result, victory) {
	game = { ...game } // make a copy so we can add properties!
	game.state = "game_over"
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

function is_current_active(current) {
	switch (current) {
		case GOVT_AUC:
			return game.active === GOVT || game.active === AUC
		case FARC_CARTELS:
			return game.active === FARC || game.active === CARTELS
		case AUC_CARTELS:
			return game.active === AUC || game.active === CARTELS
		default:
			return game.active === current
	}
}

exports.view = function (state, current) {
	load_game(state)

	let this_card = game.deck[0]
	let next_card = game.deck[1]
	let deck_size = Math.max(0, game.deck.length - 2)

	view = {
		active: game.active,
		prompt: null,
		actions: null,
		log: game.log,

		deck: [ this_card, next_card, deck_size ],
		op_spaces: game.op_spaces,
		sa_spaces: game.sa_spaces,
		misc: game.misc,
		govt: game.govt,
		auc: game.auc,
		cartels: game.cartels,
		farc: game.farc,
	}

	if (game.state === "game_over") {
		view.prompt = game.victory
	} else if (current === "Observer" || !is_current_active(current)) {
		let inactive = states[game.state].inactive || game.state
		view.prompt = `Waiting for ${game.active} \u2014 ${inactive}.`
	} else {
		view.actions = {}
		view.who = game.who
		if (states[game.state])
			states[game.state].prompt(current)
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

exports.action = function (state, current, action, arg) {
	load_game(state)
	Object.seal(game) // XXX: don't allow adding properties
	let S = states[game.state]
	if (S && action in S) {
		S[action](arg, current)
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
