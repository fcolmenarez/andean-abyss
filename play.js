// TODO: FARC zone
// TODO: terror markers

// Spaces
const AVAILABLE = -1

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

let ui = {
	favicon: document.getElementById("favicon"),
	header: document.querySelector("header"),
	player: {
		govt: document.getElementById("role_Government"),
		auc: document.getElementById("role_AUC"),
		cartels: document.getElementById("role_Cartels"),
		farc: document.getElementById("role_FARC"),
	},
	spaces: [],
	control: [],
	support: [],
	sabotage: [],
	next_card: document.getElementById("next_card"),
	this_card: document.getElementById("this_card"),
	deck_size: document.getElementById("deck_size"),
	sop: [
		null,
		document.getElementById("SOP_A1"),
		document.getElementById("SOP_A2"),
		document.getElementById("SOP_B1"),
		document.getElementById("SOP_B2"),
		document.getElementById("SOP_C1"),
		document.getElementById("SOP_C2"),
		document.getElementById("SOP_PASS"),
	],
	misc: {
		aid: document.getElementById("token_aid"),
		total_support: document.getElementById("token_total_support"),
		oppose_plus_bases: document.getElementById("token_oppose_plus_bases"),
		president: document.getElementById("token_el_presidente"),
		propaganda: document.getElementById("token_prop_card"),
		shipments: [],
	},
	govt: {
		resources: document.getElementById("govt_resources"),
		cylinder: document.getElementById("govt_cylinder"),
		police: [],
		troops: [],
		bases: [],
	},
	auc: {
		resources: document.getElementById("auc_resources"),
		cylinder: document.getElementById("auc_cylinder"),
		guerrillas: [],
		bases: [],
	},
	cartels: {
		resources: document.getElementById("cartels_resources"),
		cylinder: document.getElementById("cartels_cylinder"),
		guerrillas: [],
		bases: [],
	},
	farc: {
		resources: document.getElementById("farc_resources"),
		cylinder: document.getElementById("farc_cylinder"),
		guerrillas: [],
		bases: [],
	},
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

function toggle_pieces() {
	document.getElementById("pieces").classList.toggle("hide")
}

function on_click_action(evt) {
	if (evt.button === 0)
		send_action(evt.target.my_action, evt.target.my_id)
}

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

const center_xy = {
	"Santa Marta": [682,436],
	"Cartagena": [500,512],
	"Sincelejo": [514,708],
	"Medellin": [513,1066],
	"Ibague": [507,1278],
	"Cali": [391,1497],
	"Pasto": [274,1783],
	"Neiva": [589,1542],
	"Bogota": [754,1336],
	"Bucaramanga": [839,980],
	"Cucuta": [951,864],
	"Guainia": [1409,1542],
	"Vaupes": [1167,1785],
	"Amazonas": [1085,2064],
	"Vichada": [1340,1274],
	"Ecuador": [94,1792],
	"Panama": [188,686],
	"Cesar": [802,533],
	"Atlantico": [646,642],
	"Antioquia": [666,910],
	"Choco": [373,1040],
	"Narino": [212,1642],
	"Huila": [457,1628],
	"Santander": [818,1177],
	"Arauca": [1092,1128],
	"Meta East": [973,1410],
	"Meta West": [720,1539],
	"Guaviare": [976,1669],
	"Putumayo": [680,1826],
	"Sincelejo / Ayacucho": [642,696],
	"Cucuta / Arauca": [994,977],
	"Bucaramanga / Ibague / Bogota": [626,1224],
	"Bogota / Yopal": [887,1276],
	"Bogota / Neiva": [612,1414],
	"Bogota / San Jose": [826,1474],
	"Neiva / Pasto": [530,1698],
	"Pasto / Tumaco": [146,1766],
	"Cali / Pasto": [348,1625],
	"Cali / Buenaventura": [368,1412],
	"Ibague / Cali": [436,1362],
	"Medellin / Ibague": [511,1169],
	"Cartagena / Sincelejo": [514,613],
	"Sincelejo / Medellin": [563,876],
	"Bucaramanga / Ayacucho": [778,830],
	"Cucuta / Ayacucho": [872,708],
	"Santa Marta / Ayacucho": [746,601],
	"Santa Marta / Cartagena": [588,466],
	// TODO:
	"Brasil": [10, 10],
	"Peru": [30, 10],
	"Venezuela": [40, 10],
}

const layout_xy = {
	"Atlantico": [620,540],
	"Choco": [370,1190],
	"Narino": [260,1530],

	"Cesar": [860,420],
	"Antioquia": [640,1010],
	"Santander": [710,1175],
	"Huila": [525,1425],

	"Arauca": [1210,1090],
	"Vichada": [1210,1305],
	"Meta East": [971,1320],

	"Meta West": [720,1630],
	"Guaviare": [860,1670],
	"Putumayo": [840,1880],

	"Guainia": [1310,1540],
	"Vaupes": [1080,1810],
	"Amazonas": [950,2080],

	"Ecuador": [190,1870],
	"Panama": [235,810],
	"Brasil": [1300, 1900],
	"Peru": [720, 2170],
	"Venezuela": [1130, 880],
}

function get_center_xy(s) {
	let id = data.spaces[s].id
	return center_xy[id]
}

function get_layout_xy(s) {
	let id = data.spaces[s].id
	if (layout_xy[id])
		return layout_xy[id]
	return center_xy[id]
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

function init_ui() {
	for (let i = 0; i < data.spaces.length; ++i) {
		let id = data.spaces[i].id
		let type = data.spaces[i].type
		let e = null
		if (type === "road" || type === "pipeline") {
			e = document.createElement("div")
			let [ x, y ] = center_xy[id]
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
			let [x, y] = center_xy[id]
			if (i <= last_city)
				ui.support[i] = e = create("div", { className: "hide" })
			else
				ui.support[i] = e = create("div", { className: "hide" })
			if (i <= last_city) {
				let r = get_layout_radius(i)
				e.style.left = (x - 20) + "px"
				e.style.top = (y - 20 - r) + "px"
			} else {
				e.style.left = (x + 14) + "px"
				e.style.top = (y - 45) + "px"
			}
			document.getElementById("tokens").appendChild(e)
		}

		if (i <= last_dept || id === "Panama" || id === "Ecuador") {
			let [x, y] = center_xy[id]
			if (i <= last_city)
				ui.control[i] = e = create("div", { className: "token govt_control" })
			else
				ui.control[i] = e = create("div", { className: "hide" })
			if (i <= last_city) {
				let r = get_layout_radius(i)
				e.style.left = (x - 25 + r) + "px"
				e.style.top = (y - 25) + "px"
			} else if (i > last_pop) {
				e.style.left = (x - 25) + "px"
				e.style.top = (y - 25) + "px"
			} else {
				e.style.left = (x - 57) + "px"
				e.style.top = (y - 49) + "px"
			}
			document.getElementById("tokens").appendChild(e)
		}

		if (i >= first_loc && i <= last_loc) {
			let [x, y] = center_xy[id]
			ui.sabotage[i] = e = create("div", { className: "hide" })
			e.style.left = (x - 20) + "px"
			e.style.top = (y - 20) + "px"
			document.getElementById("tokens").appendChild(e)
		}
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

	function create_piece_list(list, c, action, n, x, y) {
		for (let i = 0; i < n; ++i)
			list[i] = create_piece(c, action, i, x, y)
	}

	create_piece_list(ui.misc.shipments, "token shipment", "shipment", 4, 0, 0)

	create_piece_list(ui.govt.police, "piece govt police", "govt_police", 30, 0, 4)
	create_piece_list(ui.govt.troops, "piece govt troops", "govt_troops", 30, 0, 4)
	create_piece_list(ui.govt.bases, "piece govt base", "govt_base", 3, -4, 10)

	create_piece_list(ui.auc.guerrillas, "piece auc guerrilla", "auc_guerrilla", 18, 2, 0)
	create_piece_list(ui.auc.bases, "piece auc base", "auc_base", 6, -4, 10)

	create_piece_list(ui.cartels.guerrillas, "piece cartels guerrilla", "cartels_guerrilla", 12, 2, 0)
	create_piece_list(ui.cartels.bases, "piece cartels base", "cartels_base", 15, -4, 10)

	create_piece_list(ui.farc.guerrillas, "piece farc guerrilla", "farc_guerrilla", 30, 2, 0)
	create_piece_list(ui.farc.bases, "piece farc base", "farc_base", 9, -4, 10)

	register_action(ui.sop[1], "sop", 1)
	register_action(ui.sop[2], "sop", 2)
	register_action(ui.sop[3], "sop", 3)
	register_action(ui.sop[4], "sop", 4)
	register_action(ui.sop[5], "sop", 5)
	register_action(ui.sop[6], "sop", 6)
	register_action(ui.sop[7], "sop", 7)
}

function filter_piece_list(list, slist, elist, space) {
	for (let i = 0; i < slist.length; ++i)
		if (slist[i] === space)
			list.push(elist[i])
}

function layout_cubes_available(slist, elist, space, xorig, yorig) {
	let list = []
	filter_piece_list(list, slist, elist, space)
	layout_pieces(list, xorig, yorig)
}

function layout_guerrillas_available(slist, elist, space, xorig, yorig) {
	let list = []
	filter_piece_list(list, slist, elist, space)
	layout_pieces(list, xorig, yorig)
}

function layout_pieces(list, xorig, yorig) {
	const dx = 17
	const dy = 11
	if (list.length > 0) {
		let ncol = Math.round(Math.sqrt(list.length))
		let nrow = Math.ceil(list.length / ncol)
		function layout_piece(row, col, e, z) {
			// basic piece size = 29x36
			let x = xorig - (row * dx - col * dx) - 15 + (nrow-ncol) * 6
			let y = yorig - (row * dy + col * dy) - 24 + (nrow-1) * 8
			let xo = e.my_x_offset
			let yo = e.my_y_offset
			e.style.left = (xo + x) + "px"
			e.style.top = (yo + y) + "px"
			e.style.zIndex = z
		}
		let z = 50
		let i = 0
		for (let row = 0; row < nrow; ++row)
			for (let col = 0; col < ncol && i < list.length; ++col)
				layout_piece(row, col, list[list.length-(++i)], z--)
	}
}

function place_piece(p, x, y, z) {
	p.style.top = y + "px"
	p.style.left = x + "px"
	if (z)
		p.style.zIndex = z
}

function layout_space_bases(list, xc, yc, r) {
	// base is 44x38
	if (r > 0) {
		let a = 45 * Math.PI / 180
		let dx = Math.round((r) * Math.cos(a))
		let dy = Math.round((r) * Math.sin(a))
		if (list.length > 0)
			place_piece(list[0], xc - 22 + dx, yc - 19 + dy)
		if (list.length > 1)
			place_piece(list[1], xc - 22 - dx, yc - 19 + dy)
	} else {
		if (list.length > 0)
			place_piece(list[0], xc - 20 - 34, yc + 13)
		if (list.length > 1)
			place_piece(list[1], xc - 20 + 31, yc + 13)
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

const SHORT_LIST = [ "govt", "auc", "cartels", "farc" ]
const SHORT = {
	"Government": "govt",
	"AUC": "auc",
	"Cartels": "cartels",
	"FARC": "farc",
}

function layout_sop() {
	let x, y, z

	// Eligible
	x = 1164 - 22
	y = 480
	z = 1
	let order = data.cards[view.deck[0]].order
	if (!order)
		order = [ "Government", "AUC", "Cartels", "FARC" ]
	for (let faction of order) {
		faction = SHORT[faction]
		if (view[faction].cylinder === ELIGIBLE) {
			place_piece(ui[faction].cylinder, x, y, z)
			y += 40
			z += 1
		}
	}

	// Ineligible
	x = 1510 - 22
	y = 480
	z = 1
	for (let faction of SHORT_LIST) {
		if (view[faction].cylinder === INELIGIBLE) {
			place_piece(ui[faction].cylinder, x, y, z)
			y += 40
			z += 1
		}
	}

	// Pass
	x = 1164 - 22 - 24
	y = 688 - 28
	z = 1
	i = 0
	for (let faction of SHORT_LIST) {
		if (view[faction].cylinder === SOP_PASS) {
			place_piece(ui[faction].cylinder, x, y, z)
			x += 48
			z += 1
			if (++i === 2) { x -= 72; y += 28 }
		}
	}

	for (let [i, x, y] of sop_xy) {
		if (view.govt.cylinder === i) place_piece(ui.govt.cylinder, x, y)
		if (view.auc.cylinder === i) place_piece(ui.auc.cylinder, x, y)
		if (view.cartels.cylinder === i) place_piece(ui.cartels.cylinder, x, y)
		if (view.farc.cylinder === i) place_piece(ui.farc.cylinder, x, y)
	}

	for (let i = 1; i <= 7; ++i) {
		if (view.actions && view.actions.sop && set_has(view.actions.sop, i))
			ui.sop[i].classList.add("action")
		else
			ui.sop[i].classList.remove("action")
	}
}

function calc_oppose_bases() {
	let total = 0
	for (let s = 0; s <= last_pop; ++s) {
		if (view.misc.support[s] < 0)
			total -= data.spaces[s].pop * view.misc.support[s]
	}
	for (let b of view.farc.bases)
		if (b !== AVAILABLE)
			total += 1
	return total
}

function calc_support() {
	let total = 0
	for (let s = 0; s <= last_pop; ++s) {
		if (view.misc.support[s] > 0)
			total += data.spaces[s].pop * view.misc.support[s]
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

		if (total_support === i) list.push(ui.misc.total_support)
		if (oppose_plus_bases === i) list.push(ui.misc.oppose_plus_bases)
		if (view.misc.aid === i) list.push(ui.misc.aid)

		if (view.govt.resources === i) list.push(ui.govt.resources)
		if (view.auc.resources === i) list.push(ui.auc.resources)
		if (view.cartels.resources === i) list.push(ui.cartels.resources)
		if (view.farc.resources === i) list.push(ui.farc.resources)

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

function update_guerrillas_active(elts, guerrillas, active) {
	for (let i = 0; i < guerrillas.length; ++i) {
		if (active & (1 << i))
			elts[i].classList.add("active")
		else
			elts[i].classList.remove("active")
	}
}

function on_update() {
	ui.header.classList.toggle("govt", view.active === "Government")
	ui.header.classList.toggle("auc", view.active === "AUC")
	ui.header.classList.toggle("cartels", view.active === "Cartels")
	ui.header.classList.toggle("farc", view.active === "FARC")

	switch (player) {
	case "Government": favicon.href = "images/icon_govt.png"; break
	case "AUC": favicon.href = "images/icon_auc.png"; break
	case "Cartels": favicon.href = "images/icon_cartels.png"; break
	case "FARC": favicon.href = "images/icon_farc.png"; break
	}

	ui.misc.president.style.left = [ 0, "254px", "337px", "420px" ][view.misc.president]

	ui.player.govt.classList.toggle("active", view.active === "Government")
	ui.player.auc.classList.toggle("active", view.active === "AUC")
	ui.player.cartels.classList.toggle("active", view.active === "Cartels")
	ui.player.farc.classList.toggle("active", view.active === "FARC")

	if (view.propaganda > 0) {
		ui.misc.propaganda.style.top = "744px"
		ui.misc.propaganda.style.left = (1124 + 75 * (view.propaganda - 1)) + "px"
	} else {
		ui.misc.propaganda.style.top = "666px"
		ui.misc.propaganda.style.left = "1029px"
	}

	ui.this_card.className = "card card_" + view.deck[0]
	ui.next_card.className = "card card_" + view.deck[1]
	ui.deck_size.textContent = view.deck[2]

	layout_sop()
	layout_score()

	layout_cubes_available(view.govt.troops, ui.govt.troops, AVAILABLE, 114, 248)
	layout_cubes_available(view.govt.police, ui.govt.police, AVAILABLE, 114, 448)
	layout_guerrillas_available(view.auc.guerrillas, ui.auc.guerrillas, AVAILABLE, 196, 2370)
	layout_guerrillas_available(view.cartels.guerrillas, ui.cartels.guerrillas, AVAILABLE, 1465, 1970)
	layout_guerrillas_available(view.farc.guerrillas, ui.farc.guerrillas, AVAILABLE, 1396, 234)

	let list = []
	for (let s = 0; s < data.spaces.length; ++s) {
		if (s <= last_pop) {
			switch (view.misc.support[s]) {
				case -2: ui.support[s].className = "token active_opposition"; break
				case -1: ui.support[s].className = "token passive_opposition"; break
				case 0: ui.support[s].className = "hide"; break
				case 1: ui.support[s].className = "token passive_support"; break
				case 2: ui.support[s].className = "token active_support"; break
			}
		}

		if (s >= first_loc && s <= last_loc) {
			if (set_has(view.misc.sabotage, s))
				ui.sabotage[s].className = "token sabotage"
			else
				ui.sabotage[s].className = "hide"
		}
	
		if (s <= last_dept) {
			if (set_has(view.misc.farc_zones, s))
				ui.control[s].className = "token farc_zone"
			else switch (view.misc.control[s]) {
				case 0: ui.control[s].className = "hide"; break
				case 1: ui.control[s].className = "token govt_control"; break
				case 2: ui.control[s].className = "token farc_control"; break
			}
		}

		update_guerrillas_active(ui.auc.guerrillas, view.auc.guerrillas, view.auc.active)
		update_guerrillas_active(ui.cartels.guerrillas, view.cartels.guerrillas, view.cartels.active)
		update_guerrillas_active(ui.farc.guerrillas, view.farc.guerrillas, view.farc.active)

		list.length = 0
		filter_piece_list(list, view.auc.guerrillas, ui.auc.guerrillas, s)
		filter_piece_list(list, view.cartels.guerrillas, ui.cartels.guerrillas, s)
		filter_piece_list(list, view.farc.guerrillas, ui.farc.guerrillas, s)
		filter_piece_list(list, view.govt.troops, ui.govt.troops, s)
		filter_piece_list(list, view.govt.police, ui.govt.police, s)

		// TODO: associate shipments with other piece, not space
		filter_piece_list(list, view.misc.shipments, ui.misc.shipments, s)

		let xy = get_layout_xy(s)
		if (xy)
			layout_pieces(list, xy[0], xy[1])

		list.length = 0
		filter_piece_list(list, view.govt.bases, ui.govt.bases, s)
		filter_piece_list(list, view.auc.bases, ui.auc.bases, s)
		filter_piece_list(list, view.farc.bases, ui.farc.bases, s)
		filter_piece_list(list, view.cartels.bases, ui.cartels.bases, s)

		xy = get_center_xy(s)
		if (xy)
			layout_space_bases(list, xy[0], xy[1], s <= last_city ? get_layout_radius(s) : 0)
		else
			console.log("NO SPACE", s, data.spaces[s].name)

		ui.spaces[s].classList.toggle("action", is_action("space", s))
	}

	list.length = 0
	filter_piece_list(list, view.misc.shipments, ui.misc.shipments, AVAILABLE)
	layout_available_bases(list, 1532, 1722, 2, 2, 89, 69)

	list.length = 0
	filter_piece_list(list, view.govt.bases, ui.govt.bases, AVAILABLE)
	layout_available_bases(list, 287 + 177, 371, 3, 1, 61, 0)

	list.length = 0
	filter_piece_list(list, view.auc.bases, ui.auc.bases, AVAILABLE)
	layout_available_bases(list, 446 + 360, 2386, 6, 1, 61, 0)

	list.length = 0
	filter_piece_list(list, view.farc.bases, ui.farc.bases, AVAILABLE)
	layout_available_bases(list, 446 + 543, 2295, 9, 1, 61, 0)

	list.length = 0
	filter_piece_list(list, view.cartels.bases, ui.cartels.bases, AVAILABLE)
	layout_available_bases(list, 1373 + 183, 2117, 3, 5, 63, 63)

	action_button("train", "Train")
	action_button("patrol", "Patrol")
	action_button("sweep", "Sweep")
	action_button("assault", "Assault")

	action_button("rally", "Rally")
	action_button("march", "March")
	action_button("attack", "Attack")
	action_button("terror", "Terror")

	action_button("air_lift", "Air Lift")
	action_button("air_strike", "Air Strike")
	action_button("eradicate", "Eradicate")

	action_button("extort", "Extort")
	action_button("ambush", "Ambush")
	action_button("kidnap", "Assassinate")
	action_button("kidnap", "Kidnap")
	action_button("kidnap", "Cultivate")
	action_button("kidnap", "Process")
	action_button("kidnap", "Bribe")

	action_button("unshaded", "Unshaded")
	action_button("shaded", "Shaded")

	action_button("event", "Event")
	action_button("limop", "LimOp")
	action_button("undo", "Undo")
}

function on_focus_card_tip(c) {
	document.getElementById("card_tip").className = "card card_" + c
}

function on_blur_card_tip(c) {
	document.getElementById("card_tip").className = "hide"
}

function sub_card(match, p1) {
	let x = p1 | 0
	let n = data.cards[x].name
	return `<span class="tip" onmouseenter="on_focus_card_tip(${x})" onmouseleave="on_blur_card_tip(${x})" onclick="on_click_card_tip(${x})">${n}</span>`
}

function sub_space(match, p1) {
	let x = p1 | 0
	let n = data.spaces[x].name
	return `<span class="tip" onmouseenter="on_focus_space_tip(${x})" onmouseleave="on_blur_space_tip(${x})" onclick="on_click_space_tip(${x})">${n}</span>`
}

function on_log(text) {
	let p = document.createElement("div")

	if (text.match(/^>/)) {
                text = text.substring(1)
                p.className = "i"
        }

	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/>/g, "&gt;")

	text = text.replace(/C(\d+)/g, sub_card)
	text = text.replace(/S(\d+)/g, sub_space)

	if (text.match(/^\.h1/)) {
		text = text.substring(4)
		p.className = "h1"
	}
	else if (text.match(/^\.h2 Government/)) {
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
	else if (text.match(/^\.h3/)) {
		text = text.substring(4)
		p.className = "h3"
	}
	else if (text.match(/^\.h4/)) {
		text = text.substring(4)
		p.className = "h4"
	}

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

init_ui()
scroll_with_middle_mouse("main")
