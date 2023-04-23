"use strict"

/* global view, data, player, send_action, action_button, scroll_with_middle_mouse */

// :r !python3 tools/genlayout.py
// BEGIN LAYOUT DATA
const LAYOUT = {
	"Santa Marta": [682, 436],
	"Cartagena": [500, 512],
	"Sincelejo": [514, 708],
	"Medellin": [513, 1066],
	"Ibague": [507, 1278],
	"Cali": [391, 1497],
	"Pasto": [274, 1783],
	"Neiva": [589, 1542],
	"Bogota": [754, 1336],
	"Bucaramanga": [839, 980],
	"Cucuta": [951, 864],
	"Guainia": [1409, 1542],
	"Vaupes": [1167, 1785],
	"Amazonas": [1085, 2064],
	"Vichada": [1340, 1274],
	"Ecuador": [94, 1792],
	"Panama": [188, 686],
	"Cesar": [802, 533],
	"Atlantico": [646, 642],
	"Antioquia": [666, 910],
	"Choco": [373, 1040],
	"Narino": [212, 1642],
	"Huila": [457, 1628],
	"Santander": [818, 1177],
	"Arauca": [1092, 1128],
	"Meta East": [973, 1410],
	"Meta West": [720, 1539],
	"Guaviare": [976, 1669],
	"Putumayo": [680, 1826],
	"Ayacucho-Sincelejo LoC": [642, 696],
	"Arauca-Cucuta LoC": [994, 977],
	"Bogota-Bucaramanga-Ibague LoC": [626, 1224],
	"Bogota-Yopal LoC": [887, 1276],
	"Bogota-Neiva LoC": [612, 1414],
	"Bogota-San Jose LoC": [826, 1474],
	"Neiva-Pasto LoC": [530, 1698],
	"Pasto-Tumaco LoC": [146, 1766],
	"Cali-Pasto LoC": [348, 1625],
	"Buenaventura-Cali LoC": [368, 1412],
	"Cali-Ibague LoC": [436, 1362],
	"Ibague-Medellin LoC": [511, 1169],
	"Cartagena-Sincelejo LoC": [514, 613],
	"Medellin-Sincelejo LoC": [563, 876],
	"Ayacucho-Bucaramanga LoC": [778, 830],
	"Ayacucho-Cucuta LoC": [872, 708],
	"Ayacucho-Santa Marta LoC": [746, 601],
	"Cartagena-Santa Marta LoC": [588, 466],
	"Atlantico Govt": [619, 504],
	"Atlantico AUC": [580, 603],
	"Atlantico Cartels": [634, 548],
	"Atlantico FARC": [702, 664],
	"Atlantico DRUGS": [713, 573],
	"Choco Govt": [338, 1097],
	"Choco AUC": [366, 915],
	"Choco Cartels": [365, 1272],
	"Choco FARC": [408, 1179],
	"Choco DRUGS": [297, 1184],
	"Narino Govt": [185, 1562],
	"Narino AUC": [293, 1554],
	"Narino Cartels": [217, 1688],
	"Narino FARC": [140, 1687],
	"Narino DRUGS": [274, 1469],
	"Meta West Govt": [678, 1461],
	"Meta West AUC": [679, 1549],
	"Meta West Cartels": [819, 1540],
	"Meta West FARC": [702, 1632],
	"Meta West DRUGS": [751, 1576],
	"Guaviare Govt": [907, 1615],
	"Guaviare AUC": [1091, 1603],
	"Guaviare Cartels": [972, 1724],
	"Guaviare FARC": [837, 1682],
	"Guaviare DRUGS": [998, 1575],
	"Putumayo Govt": [552, 1798],
	"Putumayo AUC": [621, 1866],
	"Putumayo Cartels": [882, 1876],
	"Putumayo FARC": [749, 1886],
	"Putumayo DRUGS": [622, 1704],
	"Cesar Govt": [805, 437],
	"Cesar AUC": [819, 584],
	"Cesar Cartels": [985, 338],
	"Cesar FARC": [901, 399],
	"Cesar DRUGS": [1054, 298],
	"Antioquia Govt": [621, 766],
	"Antioquia AUC": [707, 807],
	"Antioquia Cartels": [603, 978],
	"Antioquia FARC": [703, 965],
	"Antioquia DRUGS": [594, 1138],
	"Santander Govt": [848, 824],
	"Santander AUC": [779, 1074],
	"Santander Cartels": [824, 1219],
	"Santander FARC": [716, 1180],
	"Santander DRUGS": [880, 1089],
	"Huila Govt": [618, 1318],
	"Huila AUC": [507, 1468],
	"Huila Cartels": [550, 1387],
	"Huila FARC": [410, 1688],
	"Huila DRUGS": [486, 1553],
	"Arauca Govt": [981, 1113],
	"Arauca AUC": [1217, 1036],
	"Arauca Cartels": [1196, 1118],
	"Arauca FARC": [1062, 1195],
	"Arauca DRUGS": [1073, 1033],
	"Meta East Govt": [964, 1283],
	"Meta East AUC": [870, 1385],
	"Meta East Cartels": [1036, 1445],
	"Meta East FARC": [931, 1460],
	"Meta East DRUGS": [1055, 1326],
	"Vichada Govt": [1246, 1255],
	"Vichada AUC": [1278, 1344],
	"Vichada Cartels": [1392, 1333],
	"Vichada FARC": [1415, 1220],
	"Vichada DRUGS": [1315, 1182],
	"Guainia Govt": [1314, 1498],
	"Guainia AUC": [1490, 1460],
	"Guainia Cartels": [1489, 1582],
	"Guainia FARC": [1328, 1596],
	"Guainia DRUGS": [1413, 1628],
	"Vaupes Govt": [1101, 1752],
	"Vaupes AUC": [1212, 1720],
	"Vaupes Cartels": [1183, 1871],
	"Vaupes FARC": [1091, 1835],
	"Vaupes DRUGS": [1259, 1801],
	"Amazonas Govt": [987, 2038],
	"Amazonas AUC": [881, 2072],
	"Amazonas Cartels": [1048, 2132],
	"Amazonas FARC": [940, 2154],
	"Amazonas DRUGS": [1077, 1968],
	"Ecuador Govt": [42, 1780],
	"Ecuador AUC": [57, 1831],
	"Ecuador Cartels": [177, 1854],
	"Ecuador FARC": [111, 1857],
	"Ecuador DRUGS": [258, 1889],
	"Panama Govt": [65, 666],
	"Panama AUC": [228, 842],
	"Panama Cartels": [135, 709],
	"Panama FARC": [222, 754],
	"Panama DRUGS": [201, 907],
	"Ayacucho-Sincelejo LoC COIN": [700, 731],
	"Ayacucho-Sincelejo LoC INSURGENTS": [614, 676],
	"Ayacucho-Bucaramanga LoC COIN": [771, 779],
	"Ayacucho-Bucaramanga LoC INSURGENTS": [782, 875],
	"Ayacucho-Cucuta LoC COIN": [829, 740],
	"Ayacucho-Cucuta LoC INSURGENTS": [899, 736],
	"Ayacucho-Santa Marta LoC COIN": [766, 643],
	"Ayacucho-Santa Marta LoC INSURGENTS": [716, 564],
	"Bogota-Yopal LoC COIN": [853, 1309],
	"Bogota-Yopal LoC INSURGENTS": [912, 1231],
	"Bogota-Neiva LoC COIN": [655, 1413],
	"Bogota-Neiva LoC INSURGENTS": [600, 1458],
	"Bogota-San Jose LoC COIN": [784, 1447],
	"Bogota-San Jose LoC INSURGENTS": [871, 1495],
	"Bogota-Bucaramanga-Ibague LoC COIN": [659, 1256],
	"Bogota-Bucaramanga-Ibague LoC INSURGENTS": [640, 1166],
	"Arauca-Cucuta LoC COIN": [951, 947],
	"Arauca-Cucuta LoC INSURGENTS": [1053, 985],
	"Neiva-Pasto LoC COIN": [545, 1652],
	"Neiva-Pasto LoC INSURGENTS": [492, 1735],
	"Pasto-Tumaco LoC COIN": [182, 1789],
	"Pasto-Tumaco LoC INSURGENTS": [110, 1744],
	"Cali-Pasto LoC COIN": [312, 1650],
	"Cali-Pasto LoC INSURGENTS": [373, 1595],
	"Buenaventura-Cali LoC COIN": [343, 1400],
	"Buenaventura-Cali LoC INSURGENTS": [304, 1394],
	"Cali-Ibague LoC COIN": [424, 1407],
	"Cali-Ibague LoC INSURGENTS": [452, 1340],
	"Ibague-Medellin LoC COIN": [508, 1193],
	"Ibague-Medellin LoC INSURGENTS": [512, 1142],
	"Cartagena-Sincelejo LoC COIN": [522, 643],
	"Cartagena-Sincelejo LoC INSURGENTS": [529, 579],
	"Medellin-Sincelejo LoC COIN": [550, 931],
	"Medellin-Sincelejo LoC INSURGENTS": [541, 831],
	"Cartagena-Santa Marta LoC COIN": [563, 469],
	"Cartagena-Santa Marta LoC INSURGENTS": [608, 441],
}
// END LAYOUT DATA

const LAYOUT_CACHE = {
	Center: [],
	Govt: [],
	FARC: [],
	AUC: [],
	Cartels: [],
	COIN: [],
	INSURGENTS: [],
	DRUGS: [],
}

// Factions
const GOVT = 0
const FARC = 1
const AUC = 2
const CARTELS = 3
const GOVT_AUC = 4
const FARC_CARTELS = 5
const AUC_CARTELS = 6

// Pieces
const BASE = 0
const GUERRILLA = 1
const TROOPS = 2
const POLICE = 3

const MOM_SENADO_FARC = 5
const MOM_SENADO_AUC = 6
const MOM_SENADO_CARTELS = 7

const ATLANTICO = 11
const META_WEST = 14

const first_piece = data.first_piece
const last_piece = data.last_piece

const last_city = data.last_city
const last_pop = data.last_pop
const first_dept = data.first_dept
const last_dept = data.last_dept
const first_loc = data.first_loc
const last_loc = data.last_loc

// Spaces
const AVAILABLE = -1
const OUT_OF_PLAY = -2

// Sequence of Play options
const ELIGIBLE = 0
const SOP_A1 = 1
const SOP_A2 = 2
const SOP_B1 = 3
const SOP_B2 = 4
const SOP_C1 = 5
const SOP_C2 = 6
const SOP_PASS = 7
const INELIGIBLE = 8

const capability_cards = [ 1, 2, 3, 7, 9, 10, 11, 13, 1, 2, 3, 7, 9, 10, 11, 13, 17, 18 ]
const momentum_cards = [ 12, 17, 22, 27, 67, 42, 42, 42 ]

function has_momentum(bit) {
	return view.momentum & (1 << bit)
}

function has_capability(bit) {
	return view.capabilities & (1 << bit)
}

let ui = {
	map: document.getElementById("map"),
	favicon: document.getElementById("favicon"),
	header: document.querySelector("header"),
	status: document.getElementById("status"),
	player: [
		document.getElementById("role_Government"),
		document.getElementById("role_FARC"),
		document.getElementById("role_AUC"),
		document.getElementById("role_Cartels"),
		document.getElementById("role_Government_+_AUC"),
		document.getElementById("role_FARC_+_Cartels"),
		document.getElementById("role_AUC_+_Cartels"),
	],
	capabilities: [
		document.getElementById("cap_first_div"),
		document.getElementById("cap_ospina"),
		document.getElementById("cap_tapias"),
		document.getElementById("cap_seventh_sf"),
		document.getElementById("cap_mtn_bns"),
		document.getElementById("cap_black_hawks"),
		document.getElementById("cap_ndsc"),
		document.getElementById("cap_meteoro"),
		document.getElementById("s_cap_first_div"),
		document.getElementById("s_cap_ospina"),
		document.getElementById("s_cap_tapias"),
		document.getElementById("s_cap_seventh_sf"),
		document.getElementById("s_cap_mtn_bns"),
		document.getElementById("s_cap_black_hawks"),
		document.getElementById("s_cap_ndsc"),
		document.getElementById("s_cap_meteoro"),
		document.getElementById("rem_darien"),
		document.getElementById("rem_sucumbios"),
	],
	momentum: [
		document.getElementById("mom_12"),
		document.getElementById("mom_17"),
		document.getElementById("mom_22"),
		document.getElementById("mom_27"),
		document.getElementById("mom_67"),
		document.getElementById("mom_42_farc"),
		document.getElementById("mom_42_auc"),
		document.getElementById("mom_42_cartels"),
	],
	spaces: [],
	control: [],
	support: [],
	farc_zone: [],
	sabotage: [],
	terror: [],
	card_tip: document.getElementById("card_tip"),
	next_card: document.getElementById("next_card"),
	this_card: document.getElementById("this_card"),
	shaded_event: document.getElementById("shaded_event"),
	unshaded_event: document.getElementById("unshaded_event"),
	deck_outer: document.getElementById("deck_outer"),
	deck_size: document.getElementById("deck_size"),
	tokens: {
		aid: document.getElementById("token_aid"),
		total_support: document.getElementById("token_total_support"),
		oppose_plus_bases: document.getElementById("token_oppose_plus_bases"),
		president: document.getElementById("token_el_presidente"),
		propaganda: document.getElementById("token_prop_card"),
		senado_farc: document.getElementById("rem_senado_farc"),
		senado_auc: document.getElementById("rem_senado_auc"),
		senado_cartels: document.getElementById("rem_senado_cartels"),
	},
	pieces: [],
	resources: [
		document.getElementById("govt_resources"),
		document.getElementById("farc_resources"),
		document.getElementById("auc_resources"),
		document.getElementById("cartels_resources"),
	],
	cylinder: [
		document.getElementById("govt_cylinder"),
		document.getElementById("farc_cylinder"),
		document.getElementById("auc_cylinder"),
		document.getElementById("cartels_cylinder"),
	],
}

function action_menu_item(action) {
	let menu = document.getElementById(action + "_menu")
	if (view.actions && action in view.actions) {
		menu.classList.toggle("hide", false)
		menu.classList.toggle("disabled", view.actions[action] === 0)
		return 1
	} else {
		menu.classList.toggle("hide", true)
		return 0
	}
}

function action_menu(menu, action_list) {
	let x = 0
	for (let action of action_list)
		x |= action_menu_item(action)
	menu.classList.toggle("hide", !x)
}

function create(t, p, ...c) {
	let e = document.createElement(t)
	Object.assign(e, p)
	e.append(c)
	return e
}

function register_action(e, action, id) {
	e.my_action = action
	e.my_id = id
	e.onclick = on_click_action
}

function is_action(action, arg) {
	if (arg === undefined)
		return !!(view.actions && view.actions[action] === 1)
	return !!(view.actions && view.actions[action] && set_has(view.actions[action], arg))
}

function toggle_zoom2() {
	document.querySelector("main").classList.toggle("fit")
	toggle_zoom()
}

function toggle_pieces() {
	if (ui.map.classList.contains("hide_tokens")) {
		ui.map.classList.remove("hide_tokens")
		ui.map.classList.remove("hide_pieces")
	} else if (ui.map.classList.contains("hide_pieces")) {
		ui.map.classList.add("hide_tokens")
	} else {
		ui.map.classList.add("hide_pieces")
	}
}

function on_click_action(evt) {
	if (evt.button === 0)
		send_action(evt.target.my_action, evt.target.my_id)
}

function get_layout_xy(s, f = "Center") {
	if (!LAYOUT_CACHE[f][s]) {
		let id = (f !== "Center") ? data.spaces[s].id + " " + f : data.spaces[s].id
		LAYOUT_CACHE[f][s] = LAYOUT[id]
	}
	return LAYOUT_CACHE[f][s]
}

function get_layout_radius(s) {
	switch (data.spaces[s].pop) {
	case 0: return 0
	case 1: return 53
	case 2: return 57
	case 3: return 61
	case 8: return 68
	}
}

function on_focus_next_event() {
	let c = view.deck[1]
	if (c > 0)
		ui.status.textContent = data.card_title[c]
}

function on_focus_this_event() {
	let c = view.deck[0]
	if (c > 0)
		ui.status.textContent = data.card_title[c]
}

function on_focus_unshaded_event() {
	let c = view.deck[0]
	if (c > 0) {
		let f = data.card_flavor[c]
		if (f)
			ui.status.textContent = data.card_title[c] + " - " + f
		else
			ui.status.textContent = data.card_title[c]
	}
}

function on_focus_shaded_event() {
	let c = view.deck[0]
	if (c > 0) {
		ui.status.textContent = data.card_title[c] + " - " + data.card_flavor_shaded[c]
	}
}

function on_blur_event() {
	ui.status.textContent = ""
}

function init_ui() {
	register_action(ui.this_card, "event", undefined)
	register_action(ui.unshaded_event, "unshaded", undefined)
	register_action(ui.shaded_event, "shaded", undefined)
	register_action(ui.tokens.aid, "aid", undefined)
	register_action(ui.resources[GOVT], "resources", GOVT)
	register_action(ui.resources[FARC], "resources", FARC)
	register_action(ui.resources[AUC], "resources", AUC)
	register_action(ui.resources[CARTELS], "resources", CARTELS)

	ui.this_card.onmouseenter = on_focus_this_event
	ui.this_card.onmouseleave = on_blur_event
	ui.shaded_event.onmouseenter = on_focus_shaded_event
	ui.shaded_event.onmouseleave = on_focus_this_event
	ui.unshaded_event.onmouseenter = on_focus_unshaded_event
	ui.unshaded_event.onmouseleave = on_focus_this_event
	ui.next_card.onmouseenter = on_focus_next_event
	ui.next_card.onmouseleave = on_blur_event

	for (let i = 0; i < momentum_cards.length; ++i)
		register_card_tip(ui.momentum[i], momentum_cards[i])
	for (let i = 0; i < capability_cards.length; ++i)
		register_card_tip(ui.capabilities[i], capability_cards[i])

	register_card_tip(ui.tokens.senado_farc, 42)
	register_card_tip(ui.tokens.senado_auc, 42)
	register_card_tip(ui.tokens.senado_cartels, 42)

	ui.farc_zones = [
		document.getElementById("tokens").appendChild(create("div", { className: "hide" })),
		document.getElementById("tokens").appendChild(create("div", { className: "hide" })),
		document.getElementById("tokens").appendChild(create("div", { className: "hide" })),
	]

	for (let i = 0; i < data.spaces.length; ++i) {
		let id = data.spaces[i].id
		let type = data.spaces[i].type
		let e = null
		if (type === "road" || type === "pipeline") {
			e = document.createElement("div")
			let [ x, y ] = LAYOUT[id]
			e.className = "box loc"
			e.style.left = x - 28 + "px"
			e.style.top = y - 28 + "px"
			e.style.width = 56 + "px"
			e.style.height = 56 + "px"
			document.getElementById("boxes").appendChild(e)
		} else if (type === "city") {
			e = document.getElementById(id)
		} else {
			e = document.getElementById("svgmap").getElementById(id)
		}
		if (!e)
			console.log("MISSING SPACE", id)
		else {
			ui.spaces[i] = e
			register_action(e, "space", i)
		}

		if (i <= last_pop) {
			let [x, y] = LAYOUT[id]
			if (i <= last_city)
				ui.support[i] = e = create("div", { className: "hide" })
			else
				ui.support[i] = e = create("div", { className: "hide" })
			if (i <= last_city) {
				let r = get_layout_radius(i)
				e.style.left = (x - 20) + "px"
				e.style.top = (y - 20 - r) + "px"
			} else {
				e.style.left = (x - 20) + "px"
				e.style.top = (y - 20 - 40) + "px"
			}
			document.getElementById("tokens").appendChild(e)
		}

		if (i <= last_dept) {
			let [x, y] = LAYOUT[id]

			if (i <= last_city)
				ui.control[i] = e = create("div", { className: "token govt_control" })
			else
				ui.control[i] = e = create("div", { className: "hide" })
			if (i <= last_city) {
				let r = get_layout_radius(i)
				e.style.left = (x - 25 + r) + "px"
				e.style.top = (y - 25) + "px"
			} else if (i <= last_pop) {
				e.style.left = (x - 25 + 50) + "px"
				e.style.top = (y - 25 - 25) + "px"
			} else {
				e.style.left = (x - 25) + "px"
				e.style.top = (y - 25) + "px"
			}
			document.getElementById("tokens").appendChild(e)

			if (i >= first_dept) {
				ui.farc_zone[i] = e = create("div", { className: "token farc_zone hide" })
				if (i <= last_pop) {
					e.style.left = (x - 25 - 49) + "px"
					if (i === ATLANTICO || i === META_WEST)
						e.style.top = (y - 25 - 50) + "px"
					else
						e.style.top = (y - 25 - 25) + "px"
				} else {
					e.style.top = (y - 25) + "px"
					e.style.left = (x - 25 + 55) + "px"
				}
			}
			document.getElementById("tokens").appendChild(e)
		}


		if (i >= first_loc && i <= last_loc) {
			let [x, y] = LAYOUT[id]
			ui.sabotage[i] = e = create("div", { className: "hide" })
			e.style.left = (x - 20) + "px"
			e.style.top = (y - 20) + "px"
			document.getElementById("tokens").appendChild(e)
		}
	}

	for (let i = 0; i < 40; ++i) {
		let e = ui.terror[i] = create("div", { className: "hide" })
		document.getElementById("tokens").appendChild(e)
	}

	function create_piece(c, action, id, x, y) {
		let e = create("div", {
			className: c,
			my_action: action,
			my_id: id,
			my_x_offset: x,
			my_y_offset: y,
			onclick: on_click_action
		})
		document.getElementById("pieces").appendChild(e)
		return e
	}

	function create_piece_list(faction, type, c, x, y) {
		for (let p = first_piece[faction][type]; p <= last_piece[faction][type]; ++p)
			ui.pieces[p] = create_piece(c, "piece", p, x, y)
	}

	ui.shipments = [
		create_piece("token shipment", "shipment", 0, 0, 0),
		create_piece("token shipment", "shipment", 1, 0, 0),
		create_piece("token shipment", "shipment", 2, 0, 0),
		create_piece("token shipment", "shipment", 3, 0, 0),
	]

	ui.pieces = []

	create_piece_list(GOVT, BASE, "piece govt base", -4, 10)
	create_piece_list(GOVT, POLICE, "piece govt police", 0, 4)
	create_piece_list(GOVT, TROOPS, "piece govt troops", 0, 4)

	create_piece_list(FARC, BASE, "piece farc base", -4, 10)
	create_piece_list(FARC, GUERRILLA, "piece farc guerrilla", 2, 0)

	create_piece_list(AUC, BASE, "piece auc base", -4, 10)
	create_piece_list(AUC, GUERRILLA, "piece auc guerrilla", 2, 0)

	create_piece_list(CARTELS, GUERRILLA, "piece cartels guerrilla", 2, 0)
	create_piece_list(CARTELS, BASE, "piece cartels base", -4, 10)
}

function is_carrying_shipment(p) {
	for (let i = 0; i < 4; ++i)
		if (view.shipments[i] === p << 2)
			return true
	return false
}

function filter_piece_list(list, space, faction, type) {
	for (let i = first_piece[faction][type]; i <= last_piece[faction][type]; ++i)
		if (view.pieces[i] === space && (type !== GUERRILLA || !is_carrying_shipment(i)))
			list.push(ui.pieces[i])
}

function layout_available(faction, type, xorig, yorig) {
	let list = []
	filter_piece_list(list, AVAILABLE, faction, type)
	layout_pieces(list, xorig, yorig + 35, null, AVAILABLE)
}

function layout_pieces(list, xorig, yorig, bases, s) {
	const dx = 17
	const dy = 11
	let off_x = 0
	let off_y = 0

	if (bases && bases.length === 0)
		off_y = 25

	if (bases && bases.length > 0) {
		if (data.spaces[s].type === "mountain")
			off_x = 20
		else
			off_x = -20
	}

	function layout_piece_rowcol(nrow, ncol, row, col, e, z) {
		// basic piece size = 29x36
		let x = xorig - (row * dx - col * dx) - 15 + off_x
		let y = yorig - (row * dy + col * dy) - 24 + off_y
		let xo = e.my_x_offset
		let yo = e.my_y_offset
		e.style.left = (xo + x) + "px"
		e.style.top = (yo + y) + "px"
		e.style.zIndex = y
		e.my_x = x + 15
		e.my_y = y + 24
		e.my_z = z
	}
	if (list.length > 0) {
		let nrow = Math.round(Math.sqrt(list.length))
		let ncol = Math.ceil(list.length / nrow)
		let z = 50
		let i = 0
		if ((s >= 0 && s <= last_city) || s >= first_loc) {
			off_x = (nrow - ncol) * 6
			off_y = (nrow - 1) * 8
		}
		for (let row = 0; row < nrow; ++row)
			for (let col = 0; col < ncol; ++col)
				if (i < list.length)
					layout_piece_rowcol(nrow, ncol, row, col, list[list.length-(++i)], z--)
	}
	if (bases)
		layout_dept_bases(bases, xorig + off_x, yorig + 12 + off_y, s)
}

function place_piece(p, x, y, z) {
	p.style.left = x + "px"
	p.style.top = y + "px"
	if (z)
		p.style.zIndex = z
	p.my_x = x
	p.my_y = y
	p.my_z = z
}

function layout_dept_bases(list, xc, yc, s) {
	if (data.spaces[s].type !== "mountain") {
		if (list.length === 1) {
			place_piece(list[0], xc - 20 + 32, yc - 10, 52)
		}
		if (list.length === 2) {
			place_piece(list[0], xc - 20 + 18, yc - 0, 52)
			place_piece(list[1], xc - 20 + 18 + 32, yc - 21, 51)
		}
	} else {
		if (list.length === 1) {
			place_piece(list[0], xc - 20 - 32, yc - 10, 52)
		}
		if (list.length === 2) {
			place_piece(list[0], xc - 20 - 18, yc - 0, 52)
			place_piece(list[1], xc - 20 - 18 - 31, yc - 21, 51)
		}
	}
}

function layout_city_bases(list, xc, yc, s) {
	if (data.spaces[s].pop > 1) {
		if (list.length > 0)
			place_piece(list[0], xc - 21 + 25, yc - 20, 51)
		if (list.length > 1)
			place_piece(list[1], xc - 21 - 25, yc - 20, 52)
	} else {
		if (list.length > 0)
			place_piece(list[0], xc - 21 - 25, yc - 20, 51)
		if (list.length > 1)
			place_piece(list[1], xc - 21 + 25, yc - 20, 52)
	}
}

function layout_available_bases(list, x0, y0, cols, rows, dx, dy) {
	let x = x0
	let y = y0
	// for (let i = list.length-1; i >= 0; --i) {
	for (let i = 0; i < list.length; ++i) {
		place_piece(list[list.length-i-1], x - 44 - 6, y + 8)
		y += dy
		if (i % rows === rows - 1) {
			x -= dx
			y = y0
		}
	}
}

const sop_xy = [
	[SOP_A1, 1298-22, 475-24],
	[SOP_A2, 1374-22, 475-24],
	[SOP_B1, 1298-22, 554-24],
	[SOP_B2, 1374-22, 554-24],
	[SOP_C1, 1298-22, 632-24],
	[SOP_C2, 1374-22, 632-24],
]

function layout_sop() {
	let i, x, y, z

	// Eligible
	x = 1164 - 22
	y = 480
	z = 1
	let order = data.card_order[view.deck[0]]
	for (let faction of order) {
		if (view.cylinder[faction] === ELIGIBLE) {
			place_piece(ui.cylinder[faction], x, y, z)
			y += 40
			z += 1
		}
	}

	// Ineligible
	x = 1510 - 22
	y = 480
	z = 1
	for (let faction = 0; faction < 4; ++faction) {
		if (view.cylinder[faction] === INELIGIBLE) {
			place_piece(ui.cylinder[faction], x, y, z)
			y += 40
			z += 1
		}
	}

	// Pass
	x = 1164 - 22 - 24
	y = 688 - 28
	z = 1
	i = 0
	for (let faction = 0; faction < 4; ++faction) {
		if (view.cylinder[faction] === SOP_PASS) {
			place_piece(ui.cylinder[faction], x, y, z)
			x += 48
			z += 1
			if (++i === 2) { x -= 72; y += 28 }
		}
	}

	for (let [i, x, y] of sop_xy) {
		for (let faction = 0; faction < 4; ++faction)
			if (view.cylinder[faction] === i)
				place_piece(ui.cylinder[faction], x, y)
	}
}

function calc_oppose_bases() {
	let total = 0
	for (let s = 0; s <= last_pop; ++s) {
		if (view.support[s] < 0)
			total -= data.spaces[s].pop * view.support[s]
	}
	for (let p = first_piece[FARC][BASE]; p <= last_piece[FARC][BASE]; ++p)
		if (view.pieces[p] !== AVAILABLE)
			total += 1
	return total
}

function calc_support() {
	let total = 0
	for (let s = 0; s <= last_pop; ++s) {
		if (view.support[s] > 0)
			total += data.spaces[s].pop * view.support[s]
	}
	return total
}

function layout_score_cell(list, x, y, dx, dy) {
	let z = 1
	if (list.length > 1) {
		if (dy > 0) y -= 12
		if (dy < 0) y += 12
		if (dx > 0) x -= 12
		if (dx < 0) x += 12
	}
	for (let p of list) {
		if (p.classList.contains("token"))
			place_piece(p, x - 24, y - 24, z)
		else
			place_piece(p, x - 22, y - 24, z)
		x += dx
		y += dy
		z += 1
	}
}

function layout_score() {
	let list = []
	let x, y
	for (let i = 0; i <= 99; ++i) {

		let total_support = calc_support()
		let oppose_plus_bases = calc_oppose_bases()

		if (total_support === i) list.push(ui.tokens.total_support)
		if (oppose_plus_bases === i) list.push(ui.tokens.oppose_plus_bases)
		if (view.aid === i) list.push(ui.tokens.aid)

		for (let faction = 0; faction < 4; ++faction)
			if (view.resources[faction] === i) list.push(ui.resources[faction])

		if (i <= 30) y = 16
		else if (i >= 77) y = 2486
		else y = 16 + (i - 30) * 52.55

		if (i < 1) x = 19 + 4
		else if (i <= 30) x = 80 + (i - 1) * 52.07
		else if (i <= 77) x = 1590
		else x = 1590 - (i - 77) * 52.09

		x = Math.round(x) + 24
		y = Math.round(y) + 24

		if (i < 1) layout_score_cell(list, x, y, 15, 25)
		else if (i < 30) layout_score_cell(list, x, y, 0, 28)
		else if (i === 30) layout_score_cell(list, x, y, -18, 25)
		else if (i < 77) layout_score_cell(list, x, y, -41, 0)
		else if (i === 77) layout_score_cell(list, x, y, -15, -19)
		else layout_score_cell(list, x, y, 0, -19)
		if (list.length > 0)
			list.length = 0
	}
}

function update_guerrillas_underground(faction, type, underground) {
	let p0 = first_piece[faction][type]
	let p1 = last_piece[faction][type]
	for (let i = 0, p = p0; p <= p1; ++i, ++p) {
		if (underground & (1 << i))
			ui.pieces[p].classList.remove("active")
		else
			ui.pieces[p].classList.add("active")
	}
}

function layout_terror(tix, s, n) {
	let [ tx, ty ] = get_layout_xy(s)
	tx -= 20
	ty -= 20
	if (s <= last_city) {
		let r = get_layout_radius(s)
		if (data.spaces[s].pop === 1)
			r += 14
		else if (data.spaces[s].pop === 2)
			r += 12
		else if (data.spaces[s].pop === 3)
			r += 8
		else if (data.spaces[s].pop === 8)
			r += 8
		let a = (312 * Math.PI) / 180
		tx += Math.round(r * Math.cos(a))
		ty += Math.round(r * Math.sin(a))
	} else {
		if (view.farc_zones & (1<<s)) {
			if (s <= last_pop) {
				ty -= 85
			} else {
				ty -= 52
				tx += 25
			}
		} else {
			if (s <= last_pop) {
				ty -= 25
				tx -= 45
			} else {
				ty -= 0
				tx += 50
			}
		}
	}
	for (let i = 0; i < n; ++i) {
		ui.terror[tix].className = "token terror"
		ui.terror[tix].style.left = tx + "px"
		ui.terror[tix].style.top = ty + "px"
		if (s <= last_city || s > last_pop || (view.farc_zones & (1<<s))) {
			tx += 10
			ty -= 10
		} else {
			tx -= 10
			ty -= 10
		}
		++tix
	}
	return tix
}

const shipment_layout_dept = [
	[ -18, 0, 2 ],
	[  18, 0, 3 ],
	[ -54, 0, 1 ],
	[  54, 0, 4 ],
]

const shipment_layout_loc = [
	[  30, -18, 1 ],
	[  30,  18, 1 ],
	[ -30,  18, 1 ],
	[ -30, -18, 1 ],
]

function layout_shipments_push(list, pc, sh) {
	for (let i = 0; i < list.length; ++i) {
		if (list[i][0] === pc) {
			list[i].push(sh)
			return
		}
	}
	list.push([pc, sh])
}

function layout_dept_shipments(s, list, xc, yc) {
	for (let i = 0; i < list.length; ++i) {
		let [xo, yo, zo] = shipment_layout_dept[i]
		let x = xc + xo - 27
		let y = yc + yo - 27
		let z = zo * 4
		let pc = list[i][0]
		if (pc) {
			pc.style.left = (x+5) + "px"
			pc.style.top = (y-8) + "px"
			pc.style.zIndex = z + 1
		}
		for (let k = 1; k < list[i].length; ++k) {
			let sh = list[i][k]
			sh.style.left = (x) + "px"
			sh.style.top = (y) + "px"
			sh.style.zIndex = z--
			x += 8
			y += 8
		}
	}
}

function layout_city_shipments(s, list, xc, yc) {
	let r = get_layout_radius(s) + 10
	for (let i = 0; i < list.length; ++i) {
		let a = (160 + i * 20) * Math.PI / 180
		let xo = Math.round(r * Math.cos(a))
		let yo = Math.round(r * Math.sin(a))
		let zo = 4-i
		let x = xc + xo - 27
		let y = yc + yo - 27
		let z = zo * 4
		let pc = list[i][0]
		if (pc) {
			pc.style.left = (x+5) + "px"
			pc.style.top = (y-8) + "px"
			pc.style.zIndex = z + 1
		}
		for (let k = 1; k < list[i].length; ++k) {
			let sh = list[i][k]
			sh.style.left = (x) + "px"
			sh.style.top = (y) + "px"
			sh.style.zIndex = z--
			x += 8
			y += 8
		}
	}
}

function layout_loc_shipments(s, list, xc, yc) {
	for (let i = 0; i < list.length; ++i) {
		let [xo, yo, zo] = shipment_layout_loc[i]
		let x = xc + xo - 27
		let y = yc + yo - 27
		let z = zo * 4
		let pc = list[i][0]
		if (pc) {
			pc.style.left = (x+5) + "px"
			pc.style.top = (y-8) + "px"
			pc.style.zIndex = z + 1
		}
		for (let k = 1; k < list[i].length; ++k) {
			let sh = list[i][k]
			sh.style.left = (x) + "px"
			sh.style.top = (y) + "px"
			sh.style.zIndex = z--
			x += 8
			y += 8
		}
	}
}

function make_card_class_name(c) {
	if (set_has([1,2,3,7,9,10,11,13], view.deck[0]))
		return "card card_" + c + " u" + data.card_unshaded_lines[c] + " s" + data.card_shaded_lines[c] + " c"
	else
		return "card card_" + c + " u" + data.card_unshaded_lines[c] + " s" + data.card_shaded_lines[c]
}

function on_update() {
	switch (player) {
	case "Government": ui.favicon.href = "images/icon_govt.png"; break
	case "AUC": ui.favicon.href = "images/icon_auc.png"; break
	case "Cartels": ui.favicon.href = "images/icon_cartels.png"; break
	case "FARC": ui.favicon.href = "images/icon_farc.png"; break
	}

	ui.header.classList.toggle("govt", view.current === GOVT)
	ui.header.classList.toggle("auc", view.current === AUC)
	ui.header.classList.toggle("cartels", view.current === CARTELS)
	ui.header.classList.toggle("farc", view.current === FARC)

	ui.tokens.aid.classList.toggle("action", is_action("aid"))
	ui.resources[GOVT].classList.toggle("action", is_action("resources", GOVT))
	ui.resources[FARC].classList.toggle("action", is_action("resources", FARC))
	ui.resources[AUC].classList.toggle("action", is_action("resources", AUC))
	ui.resources[CARTELS].classList.toggle("action", is_action("resources", CARTELS))

	ui.player[GOVT].classList.toggle("hide", view.scenario < 3)
	ui.player[AUC].classList.toggle("hide", view.scenario < 4)
	ui.player[CARTELS].classList.toggle("hide", view.scenario < 4)
	ui.player[FARC].classList.toggle("hide", view.scenario < 3)
	ui.player[GOVT_AUC].classList.toggle("hide", view.scenario !== 2)
	ui.player[FARC_CARTELS].classList.toggle("hide", view.scenario !== 2)
	ui.player[AUC_CARTELS].classList.toggle("hide",  view.scenario !== 3)

	ui.player[GOVT].classList.toggle("active", view.current === GOVT)
	ui.player[AUC].classList.toggle("active", view.current === AUC)
	ui.player[CARTELS].classList.toggle("active", view.current === CARTELS)
	ui.player[FARC].classList.toggle("active", view.current === FARC)
	ui.player[GOVT_AUC].classList.toggle("active", view.current === GOVT || view.current === AUC)
	ui.player[FARC_CARTELS].classList.toggle("active", view.current === FARC || view.current === CARTELS)
	ui.player[AUC_CARTELS].classList.toggle("active",  view.current === AUC || view.current === CARTELS)

	ui.tokens.president.style.left = [ 0, "254px", "337px", "420px" ][view.president]

	ui.tokens.senado_farc.classList.toggle("hide", !has_momentum(MOM_SENADO_FARC))
	ui.tokens.senado_auc.classList.toggle("hide", !has_momentum(MOM_SENADO_AUC))
	ui.tokens.senado_cartels.classList.toggle("hide", !has_momentum(MOM_SENADO_CARTELS))

	for (let i = 0; i < capability_cards.length; ++i)
		ui.capabilities[i].classList.toggle("hide", !has_capability(i))
	for (let i = 0; i < momentum_cards.length; ++i)
		ui.momentum[i].classList.toggle("hide", !has_momentum(i))

	if (view.propaganda > 0) {
		ui.tokens.propaganda.style.top = "744px"
		ui.tokens.propaganda.style.left = (1124 + 75 * (view.propaganda - 1)) + "px"
	} else {
		ui.tokens.propaganda.style.top = "666px"
		ui.tokens.propaganda.style.left = "1029px"
	}

	ui.this_card.className = make_card_class_name(view.deck[0])
	ui.next_card.className = view.deck[1] > 0 ? "card card_" + view.deck[1] : "hide"
	if (view.deck[2] > 0) {
		ui.deck_outer.className = "card card_back"
		ui.deck_size.textContent = view.deck[2]
	} else {
		ui.deck_outer.className = "hide"
	}

	ui.this_card.classList.toggle("action", !!(view.actions && view.actions.event === 1))
	ui.shaded_event.classList.toggle("action", !!(view.actions && view.actions.shaded === 1))
	ui.unshaded_event.classList.toggle("action", !!(view.actions && view.actions.unshaded === 1))

	layout_sop()
	layout_score()

	layout_available(GOVT, TROOPS, 114, 248)
	layout_available(GOVT, POLICE, 114, 448)
	layout_available(FARC, GUERRILLA, 1396, 234)
	layout_available(AUC, GUERRILLA, 196, 2370)
	layout_available(CARTELS, GUERRILLA, 1465, 1970)

	for (let i = view.farc_zones.length; i < ui.farc_zones.length; ++i)
		ui.farc_zones[i].className = "hide"

	let tix = 0

	let list = []
	let bases = []
	for (let s = 0; s < data.spaces.length; ++s) {
		let id = data.spaces[s].id
		let xy

		if (s <= last_pop) {
			switch (view.support[s]) {
				case -2: ui.support[s].className = "token active_opposition"; break
				case -1: ui.support[s].className = "token passive_opposition"; break
				case 0: ui.support[s].className = "hide"; break
				case 1: ui.support[s].className = "token passive_support"; break
				case 2: ui.support[s].className = "token active_support"; break
			}
		}

		if (s >= first_loc && s <= last_loc) {
			if (set_has(view.sabotage, s))
				ui.sabotage[s].className = "token sabotage"
			else
				ui.sabotage[s].className = "hide"
		}

		if (s >= first_dept && s <= last_dept) {
			ui.farc_zone[s].classList.toggle("hide", !(view.farc_zones & (1<<s)))
		}

		if (s <= last_dept) {
			if (view.govt_control & (1<<s))
				ui.control[s].className = "token govt_control"
			else if (view.farc_control & (1<<s))
				ui.control[s].className = "token farc_control"
			else
				ui.control[s].className = "hide"
		}

		tix = layout_terror(tix, s, map_get(view.terror, s, 0) * 1)

		update_guerrillas_underground(FARC, GUERRILLA, view.underground[FARC])
		update_guerrillas_underground(AUC, GUERRILLA, view.underground[AUC])
		update_guerrillas_underground(CARTELS, GUERRILLA, view.underground[CARTELS])

		if (s <= last_city) {
			list.length = bases.length = 0
			filter_piece_list(list, s, FARC, GUERRILLA)
			filter_piece_list(list, s, AUC, GUERRILLA)
			filter_piece_list(list, s, CARTELS, GUERRILLA)
			filter_piece_list(list, s, GOVT, TROOPS)
			filter_piece_list(list, s, GOVT, POLICE)
			filter_piece_list(bases, s, GOVT, BASE)
			filter_piece_list(bases, s, FARC, BASE)
			filter_piece_list(bases, s, AUC, BASE)
			filter_piece_list(bases, s, CARTELS, BASE)
			xy = get_layout_xy(s)
			layout_pieces(list, xy[0], xy[1], null, s)
			layout_city_bases(bases, xy[0], xy[1] + get_layout_radius(s) - 12, s)
		} else if (s <= last_dept) {
			list.length = bases.length = 0
			filter_piece_list(list, s, FARC, GUERRILLA)
			filter_piece_list(bases, s, FARC, BASE)
			xy = get_layout_xy(s, "FARC")
			layout_pieces(list, xy[0], xy[1], bases, s)

			list.length = bases.length = 0
			filter_piece_list(list, s, AUC, GUERRILLA)
			filter_piece_list(bases, s, AUC, BASE)
			xy = get_layout_xy(s, "AUC")
			layout_pieces(list, xy[0], xy[1], bases, s)

			list.length = bases.length = 0
			filter_piece_list(list, s, CARTELS, GUERRILLA)
			filter_piece_list(bases, s, CARTELS, BASE)
			xy = get_layout_xy(s, "Cartels")
			layout_pieces(list, xy[0], xy[1], bases, s)

			list.length = bases.length = 0
			filter_piece_list(list, s, GOVT, TROOPS)
			filter_piece_list(list, s, GOVT, POLICE)
			filter_piece_list(bases, s, GOVT, BASE)
			xy = get_layout_xy(s, "Govt")
			layout_pieces(list, xy[0], xy[1], bases, s)
		} else {
			list.length = 0
			filter_piece_list(list, s, FARC, GUERRILLA)
			filter_piece_list(list, s, AUC, GUERRILLA)
			filter_piece_list(list, s, CARTELS, GUERRILLA)
			xy = get_layout_xy(s, "INSURGENTS")
			layout_pieces(list, xy[0], xy[1], null, s)

			list.length = 0
			filter_piece_list(list, s, GOVT, TROOPS)
			filter_piece_list(list, s, GOVT, POLICE)
			xy = get_layout_xy(s, "COIN")
			layout_pieces(list, xy[0], xy[1], null, s)
		}

		list.length = 0
		for (let i = 0; i < 4; ++i) {
			let shx = view.shipments[i]
			if (shx !== 0) {
				if ((shx & 3) === 0 && view.pieces[(shx >> 2)] === s)
					layout_shipments_push(list, ui.pieces[shx >> 2], ui.shipments[i])
				else if ((shx & 3) !== 0 && (shx >> 2) === s)
					layout_shipments_push(list, null, ui.shipments[i])
			}
		}
		if (list.length > 0) {
			if (s <= last_city) {
				xy = get_layout_xy(s)
				layout_city_shipments(s, list, xy[0], xy[1])
			} else if (s <= last_dept) {
				xy = get_layout_xy(s, "DRUGS")
				layout_dept_shipments(s, list, xy[0], xy[1])
			} else {
				xy = get_layout_xy(s)
				layout_loc_shipments(s, list, xy[0], xy[1])
			}
		}

		ui.spaces[s].classList.toggle("action", is_action("space", s))
		ui.spaces[s].classList.toggle("selected", view.where === s)
	}

	for (; tix < 40; ++tix)
		ui.terror[tix].className = "hide"

	for (let i = first_piece[AUC][GUERRILLA]; i <= last_piece[AUC][GUERRILLA]; ++i)
		ui.pieces[i].classList.toggle("hide", view.pieces[i] === OUT_OF_PLAY)

	list.length = 0
	for (let i = 0; i < 4; ++i) {
		let shx = view.shipments[i]
		let shf = shx & 3
		if (shx === 0)
			list.push(ui.shipments[i])
		if (shf === 0)
			ui.shipments[i].className = "token shipment"
		else if (shf === FARC)
			ui.shipments[i].className = "token shipment farc"
		else if (shf === AUC)
			ui.shipments[i].className = "token shipment auc"
		else if (shf === CARTELS)
			ui.shipments[i].className = "token shipment cartels"
		if (view.actions && view.actions.shipment && set_has(view.actions.shipment, i))
			ui.shipments[i].classList.add("action")
		if (view.selected_shipment === i)
			ui.shipments[i].classList.add("selected")
	}
	layout_available_bases(list, 1532, 1722, 2, 2, 89, 69)

	list.length = 0
	filter_piece_list(list, AVAILABLE, GOVT, BASE)
	layout_available_bases(list, 287 + 177, 371, 3, 1, 61, 0)

	list.length = 0
	filter_piece_list(list, AVAILABLE, FARC, BASE)
	layout_available_bases(list, 446 + 543, 2295, 9, 1, 61, 0)

	list.length = 0
	filter_piece_list(list, AVAILABLE, AUC, BASE)
	layout_available_bases(list, 446 + 360, 2386, 6, 1, 61, 0)

	list.length = 0
	filter_piece_list(list, AVAILABLE, CARTELS, BASE)
	layout_available_bases(list, 1373 + 183, 2117, 3, 5, 63, 63)

	if (view.actions && view.actions.piece)
		for (let i = 0; i < ui.pieces.length; ++i)
			ui.pieces[i].classList.toggle("action", set_has(view.actions.piece, i))
	else
		for (let i = 0; i < ui.pieces.length; ++i)
			ui.pieces[i].classList.remove("action")
	for (let i = 0; i < ui.pieces.length; ++i)
		ui.pieces[i].classList.toggle("selected", view.who === i)

	action_menu(document.getElementById("negotiate_menu"), [
		"remove_pieces",
		"transfer_resources",
		"transfer_shipment",
		"ask_resources",
		"ask_shipment",
	])

	// Select Faction
	action_button("govt", "Government")
	action_button("farc", "FARC")
	action_button("auc", "AUC")
	action_button("cartels", "Cartels")

	// Select Operation
	action_button("train", "Train")
	action_button("patrol", "Patrol")
	action_button("sweep", "Sweep")
	action_button("assault", "Assault")
	action_button("rally", "Rally")
	action_button("march", "March")
	action_button("attack", "Attack")
	action_button("terror", "Terror")

	// Select Special Activity
	action_button("air_lift", "Air Lift")
	action_button("air_strike", "Air Strike")
	action_button("eradicate", "Eradicate")
	action_button("extort", "Extort")
	action_button("ambush", "Ambush")
	action_button("assassinate", "Assassinate")
	action_button("kidnap", "Kidnap")
	action_button("cultivate", "Cultivate")
	action_button("process", "Process")
	action_button("bribe", "Bribe")

	// Train/Rally sub-actions
	action_button("move", "Move")
	action_button("flip", "Flip")
	action_button("base", "Base")
	action_button("civic", "Civic Action")

	action_button("support", "Support")
	action_button("opposition", "Opposition")

	action_button("remove", "Remove")
	action_button("roll", "Roll")
	action_button("skip", "Skip")
	action_button("next", "Next")
	action_button("pass", "Pass")

	action_button("end_train", "End Train")
	action_button("end_patrol", "End Patrol")
	action_button("end_sweep", "End Sweep")
	action_button("end_assault", "End Assault")
	action_button("end_rally", "End Rally")
	action_button("end_march", "End March")
	action_button("end_attack", "End Attack")
	action_button("end_terror", "End Terror")

	action_button("end_air_lift", "End Air Lift")
	action_button("end_extort", "End Extort")
	action_button("end_assassinate", "End Assassinate")
	action_button("end_kidnap", "End Kidnap")
	action_button("end_process", "End Process")
	action_button("end_bribe", "End Bribe")

	action_button("end_event", "End Event")

	action_button("deny", "Deny")
	action_button("done", "Done")
	action_button("undo", "Undo")
}

function register_card_tip(e, c) {
	e.onmouseenter = () => on_focus_card_tip(c)
	e.onmouseleave = on_blur_card_tip
}

function on_focus_card_tip(c) {
	ui.card_tip.className = "card card_" + c
}

function on_blur_card_tip() {
	ui.card_tip.className = "hide"
}

function on_focus_space_tip(s) {
	ui.spaces[s].classList.add("tip")
}

function on_blur_space_tip(s) {
	ui.spaces[s].classList.remove("tip")
}

function on_click_space_tip(s) {
	ui.spaces[s].scrollIntoView({ block:"center", inline:"center", behavior:"smooth" })
}

function sub_card(match, p1) {
	let x = p1 | 0
	let n = data.card_title[x]
	return `<span class="tip" onmouseenter="on_focus_card_tip(${x})" onmouseleave="on_blur_card_tip()">${n}</span>`
}

function sub_space(match, p1) {
	let x = p1 | 0
	let n = data.space_name[x]
	return `<span class="tip" onmouseenter="on_focus_space_tip(${x})" onmouseleave="on_blur_space_tip(${x})" onclick="on_click_space_tip(${x})">${n}</span>`
}

function on_log(text) {
	let p = document.createElement("div")

	if (text.match(/^>/)) {
                text = text.substring(1)
                p.className = "indent"
        }

	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/>/g, "&gt;")

	if (text.match(/^\.h1/)) {
		text = text.substring(4)
		p.className = "h1"
	}
	else if (text.match(/^\.h2 Gov/)) {
		text = text.substring(3)
		p.className = "h2 govt"
	}
	else if (text.match(/^\.h2 AUC/)) {
		text = text.substring(3)
		p.className = "h2 auc"
	}
	else if (text.match(/^\.h2 Cartels/)) {
		text = text.substring(3)
		p.className = "h2 cartels"
	}
	else if (text.match(/^\.h2 FARC/)) {
		text = text.substring(3)
		p.className = "h2 farc"
	}
	else if (text.match(/^\.h2 /)) {
		text = text.substring(3)
		p.className = "h2"
	}
	else if (text.match(/^\.h3/)) {
		text = text.substring(4)
		p.className = "h3"
	}
	else if (text.match(/^\.h4/)) {
		text = text.substring(4)
		p.className = "h4"
	}
	else if (text.match(/^\.n/)) {
		text = text.substring(3)
		p.className = "italic"
	}
	else if (text.match(/^\.i/)) {
		text = text.substring(3)
		p.className = "indent italic"
	}

	text = text.replace(/C(\d+)/g, sub_card)
	text = text.replace(/S(\d+)/g, sub_space)

	p.innerHTML = text
	return p
}

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

init_ui()
scroll_with_middle_mouse("main")
