// Cylinder spaces on map are 48x48

// SIZES in millimeters
// cylinders = 14.5 x 10
// discs = 14.5 x 4
// cubes = 9 x 9
// octagons = 10 x 10

// SIZES in 75dpi pixels
// cylinder = 43 x 29.5
// disc = 43 x 12
// cube = 26.6 x 26.6
// octagon = 29.5 x 29.5

// SIZES in 72dpi pixels
// cylinder = 41 x 28
// disc = 41 x 11
// cube = 25 x 25
// octagon = 28 x 28

// isometric scale = 2 / 3
// vertical scale = 2 / 3

// octagon badge = 23x15 / 25x17

import fs from "fs"
import { formatHex, parseHex, convertRgbToOklab } from 'culori'

function make_piece_colors(base) {
	let rgb = parseHex(base)
        let sh1 = convertRgbToOklab(rgb); sh1.l *= 0.9;
        let sh2 = convertRgbToOklab(rgb); sh2.l *= 0.8;
        let sh3 = convertRgbToOklab(rgb); sh3.l *= 0.7;
        let sh4 = convertRgbToOklab(rgb); sh4.l *= 0.4;
	return [ base, formatHex(sh1), formatHex(sh2), formatHex(sh3), formatHex(sh4) ]
}

const color_govt = make_piece_colors("#0087cb")
const color_govt_police = make_piece_colors("#acdbf6")
const color_auc = make_piece_colors("#ffde00")
const color_farc = make_piece_colors("#db2128")
const color_cartels = make_piece_colors("#68b045")

function print_cylinder(output, icon_file, c) {
	let icon = fs.readFileSync(icon_file).toString('utf8')
	let svg = []
	svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="48">')

	svg.push(`<linearGradient id="g">`)
	svg.push(`<stop offset="0%" stop-color="${c[1]}"/>`)
	svg.push(`<stop offset="50%" stop-color="${c[2]}"/>`)
	svg.push(`<stop offset="100%" stop-color="${c[3]}"/>`)
	svg.push('</linearGradient>')

	svg.push(`<path fill="url(#g)" stroke="${c[4]}" d="M1.5 15 v 18 a 20.5 13.5 0 0 0 20.5 13.5 a 20.5 13.5 0 0 0 20.5 -13.5 v -18"/>`)
	svg.push(`<ellipse fill="${c[0]}" stroke="${c[4]}" cx="22" cy="15" rx="20.5" ry="13.5"/>`)
	svg.push(icon)

	svg.push('</svg>')
	fs.writeFileSync(output, svg.join("\n") + "\n")
}

function print_disc(output, c) {
	let svg = []
	svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="38">')

	svg.push(`<linearGradient id="g">`)
	svg.push(`<stop offset="0%" stop-color="${c[1]}"/>`)
	svg.push(`<stop offset="50%" stop-color="${c[2]}"/>`)
	svg.push(`<stop offset="100%" stop-color="${c[3]}"/>`)
	svg.push('</linearGradient>')

	svg.push(`<path fill="url(#g)" stroke="${c[4]}" d="M1.5 15 v 8 a 20.5 13.5 0 0 0 20.5 13.5 20.5 13.5 0 0 0 20.5 -13.5 v -8"/>`)
	svg.push(`<ellipse fill="${c[0]}" stroke="${c[4]}" cx="22" cy="15" rx="20.5" ry="13.5"/>`)

	svg.push('</svg>')
	fs.writeFileSync(output, svg.join("\n") + "\n")
}

const star_auc =
"m11.414 4.602-1.03 2.062-3.315.008H3.755l.719.351c1.55.743 4.24 2.016 4.416 2.079.096.039.176.093.176.132 0 .04-.455.977-1.006 2.079-.551 1.109-.99 2.023-.975 2.039.008.015.424-.165.903-.391.487-.234 1.693-.805 2.691-1.281l1.805-.86.391.188c.208.101 1.03.492 1.821.86.79.374 1.805.85 2.26 1.07.447.218.847.374.87.343.033-.023-.383-.937-.926-2.023-.535-1.078-.966-1.992-.966-2.024 0-.03.24-.164.543-.304.471-.22 3.282-1.547 4.368-2.063l.4-.195H14.608l-1.03-2.07c-.559-1.141-1.046-2.07-1.078-2.07-.024 0-.511.929-1.086 2.07z"

const star_farc =
"m11.254 4.71-1.19 1.556-.639.086c-.351.046-1.07.117-1.597.164a36.08 36.08 0 0 0-1.541.164c-.32.039-.75.07-.967.07-.207 0-.407.023-.43.055-.033.023.774.586 1.78 1.25 1.014.656 1.837 1.234 1.837 1.273 0 .047-.176.781-.4 1.64-.215.86-.399 1.595-.399 1.65 0 .1-.048.116 1.438-.4l2.076-.71c.503-.172.998-.336 1.086-.36.144-.03 1.342.313 1.83.524.087.039.43.156.758.265.327.11.966.32 1.421.477.456.156.839.274.855.258.016-.016-.16-.781-.4-1.703-.239-.922-.415-1.696-.399-1.727.024-.023.36-.258.767-.508 2.396-1.515 2.97-1.898 2.867-1.937a8.238 8.238 0 0 0-.759-.078c-.351-.032-.982-.086-1.397-.125-.416-.04-1.15-.102-1.622-.149-1.493-.14-1.253.024-2.595-1.734l-1.198-1.555-1.182 1.555z"

const leaf = "M15.215 4.57c-.487.063-1.453.328-2.116.586-1.621.617-3.897 1.93-4.584 2.633-.56.57-.767 1.086-.767 1.89v.673l-.854.562c-.48.305-.863.586-.863.633 0 .07 1.374 1.015 1.478 1.015.024 0 .439-.257.934-.578l.887-.586.646.047c1.039.063 2.588-.218 3.546-.656.75-.336 2.085-1.305 3.115-2.25 1.853-1.695 2.124-3.18.703-3.797-.392-.164-1.502-.258-2.125-.172z"

function print_octagon(output, badge_path, badge_fill, badge_stroke, c) {
	let svg = []

	// a + b + b = 30
	// a + 2 * a / sqrt(2) = 30
	// 1 + 2 / sqrt(2) = 30 / a
	// 2.4142 = 30 / a
	// 2.4142 * a = 30
	// a = 30 / 2.4142
	// = 12.4

	let w = 24
	let a = w / (1 + 2 / Math.sqrt(2))
	let b = a / Math.sqrt(2)
	let xo = 0
	let yo = 0
	let ys = 2/3
	let h = Math.round(w * 0.8)

	let v = [
		[ xo + (b + 0), (0) * ys + yo ],
		[ xo + (b + a), (0) * ys + yo ],
		[ xo + (b + a + b), (b) * ys + yo ],
		[ xo + (b + a + b), (b + a) * ys + yo ],
		[ xo + (b + a), (b + a + b) * ys + yo ],
		[ xo + (b), (b + a + b) * ys + yo ],
		[ xo + (0), (b + a) * ys + yo ],
		[ xo + (0), (b) * ys + yo ],
	]

	for (let xy of v) {
		xy[0] = Math.round(xy[0]) + 0.5
		xy[1] = Math.round(xy[1]) + 0.5
	}

	let v2 = [
		[ v[3][0], v[3][1] ],
		[ v[3][0], v[3][1] + h ],
		[ v[4][0], v[4][1] + h ],
		[ v[5][0], v[5][1] + h ],
		[ v[6][0], v[6][1] + h ],
		[ v[6][0], v[6][1] ],
	]

	let v3 = [
		[ v[4][0], v[4][1] ],
		[ v[4][0], v[4][1] + h ],
	]

	let v4 = [
		[ v[5][0], v[5][1] ],
		[ v[5][0], v[5][1] + h ],
	]

	let f1 = [
		[ v[3][0], v[3][1] ],
		[ v[3][0], v[3][1] + h ],
		[ v[4][0], v[4][1] + h ],
		[ v[4][0], v[4][1] ],
	]

	let f2 = [
		[ v[4][0], v[4][1] ],
		[ v[4][0], v[4][1] + h ],
		[ v[5][0], v[5][1] + h ],
		[ v[5][0], v[5][1] ],
	]

	let f3 = [
		[ v[5][0], v[5][1] ],
		[ v[5][0], v[5][1] + h ],
		[ v[6][0], v[6][1] + h ],
		[ v[6][0], v[6][1] ],
	]

	let p1 = v.map(([x,y])=>x + " " + y).join(" ")
	let p2 = v2.map(([x,y])=>x + " " + y).join(" ")
	let p3 = v3.map(([x,y])=>x + " " + y).join(" ")
	let p4 = v4.map(([x,y])=>x + " " + y).join(" ")

	svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="25" height="36">')

	svg.push(`<path fill="${c[0]}" d="M${v}"/>`)
	if (badge_path)
		svg.push(`<path fill="${badge_fill}" d="${badge_path}"/>`)
	svg.push(`<path fill="${c[3]}" d="M${f1}"/>`)
	svg.push(`<path fill="${c[2]}" d="M${f2}"/>`)
	svg.push(`<path fill="${c[1]}" d="M${f3}"/>`)
	svg.push(`<path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="${c[4]}" d="M${p1}z M${p2} M${p3} M${p4}"/>`)

	svg.push('</svg>')
	fs.writeFileSync(output, svg.join("\n") + "\n")
}

function print_cube(output, c) {
	let svg = []

	let xo = 0
	let yo = 0
	let ys = 2/3

	let w = 20
	let d = Math.sqrt(w * w + w * w)
	let h = Math.round(w * 0.8)

	let v = [
		[ xo + (d/2), yo + (0) * ys ],
		[ xo + (d), yo + (d/2) * ys ],
		[ xo + (d/2), yo + (d) * ys ],
		[ xo + (0), yo + (d/2) * ys ],
	]

	for (let xy of v) {
		xy[0] = Math.round(xy[0]) + 0.5
		xy[1] = Math.round(xy[1]) + 0.5
	}

	let v2 = [
		[ v[1][0], v[1][1] ],
		[ v[1][0], v[1][1] + h ],
		[ v[2][0], v[2][1] + h ],
		[ v[3][0], v[3][1] + h ],
		[ v[3][0], v[3][1] ],
	]

	let v3 = [
		[ v[2][0], v[2][1] ],
		[ v[2][0], v[2][1] + h ],
	]

	let f1 = [
		[ v[1][0], v[1][1] ],
		[ v[1][0], v[1][1] + h ],
		[ v[2][0], v[2][1] + h ],
		[ v[2][0], v[2][1] ],
	]

	let f2 = [
		[ v[2][0], v[2][1] ],
		[ v[2][0], v[2][1] + h ],
		[ v[3][0], v[3][1] + h ],
		[ v[3][0], v[3][1] ],
	]

	svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="29" height="36">')

	svg.push(`<path fill="${c[0]}" d="M${v}"/>`)
	svg.push(`<path fill="${c[3]}" d="M${f1}"/>`)
	svg.push(`<path fill="${c[1]}" d="M${f2}"/>`)

	svg.push(`<path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="${c[4]}" d="M${v}z M${v2} M${v3}"/>`)

	svg.push('</svg>')
	fs.writeFileSync(output, svg.join("\n") + "\n")
}

print_cylinder("images/govt_cylinder.svg", "tools/cylinder_icon_govt.svg", color_govt)
print_cylinder("images/farc_cylinder.svg", "tools/cylinder_icon_farc.svg", color_farc)
print_cylinder("images/auc_cylinder.svg", "tools/cylinder_icon_auc.svg", color_auc)
print_cylinder("images/cartels_cylinder.svg", "tools/cylinder_icon_cartels.svg", color_cartels)

print_disc("images/govt_base.svg", color_govt)
print_disc("images/farc_base.svg", color_farc)
print_disc("images/auc_base.svg", color_auc)
print_disc("images/cartels_base.svg", color_cartels)

print_octagon("images/farc_guerrilla_active.svg", star_farc, "#ffd800", "#8c1042", color_farc)
print_octagon("images/farc_guerrilla.svg", null, null, null, color_farc)
print_octagon("images/auc_guerrilla_active.svg", star_auc, "#0072bc", "#fff", color_auc)
print_octagon("images/auc_guerrilla.svg", null, null, null, color_auc)
print_octagon("images/cartels_guerrilla_active.svg", leaf, "#fff200", "#636466", color_cartels)
print_octagon("images/cartels_guerrilla.svg", null, null, null, color_cartels)

print_cube("images/govt_troops.svg", color_govt)
print_cube("images/govt_police.svg", color_govt_police)

let css = [ "/* TOKEN BORDER COLORS */" ]

function border(base, sel) {
	let rgb = parseHex(base)
	// let hic = convertRgbToOklab(rgb); hic.l = Math.min(1,hic.l+0.1)
	// let loc = convertRgbToOklab(rgb); loc.l = Math.max(0,loc.l-0.1)
	// let shc = convertRgbToOklab(rgb); shc.l = Math.max(0,shc.l-0.4)
	let hic = convertRgbToOklab(rgb); hic.l = Math.min(1,hic.l*1.2)
	let loc = convertRgbToOklab(rgb); loc.l = Math.max(0,loc.l*0.8)
	let shc = convertRgbToOklab(rgb); shc.l = Math.max(0,shc.l*0.4)
	let sh = formatHex(shc)
	let hi = formatHex(hic)
	let lo = formatHex(loc)
	css.push(`${sel} { background-color: ${base}; border-color: ${hi} ${lo} ${lo} ${hi}; box-shadow: 0 0 0 1px ${sh}, 0px 1px 4px #0008; }`)
}

border("#006cb7", "#token_total_support")
border("#80643e", "#token_prop_card")
border("#d74729", "#token_oppose_plus_bases")
border("#004e81", "#token_el_presidente")
border("#6a8796", "#token_aid")
border("#4b87c0", ".token.passive_support")
border("#b75f61", ".token.passive_opposition")
border("#0054a6", ".token.active_support")
border("#991a1e", ".token.active_opposition")
border("#0054a6", ".token.govt_control")
border("#991a1e", ".token.farc_control")
border("#ffc509", ".token.farc_zone")
//border("#22010e", ".token.terror")
border("#535052", ".token.terror")
border("#535052", ".token.sabotage")
border("#9dadb3", ".token.unshaded")
border("#465c80", ".token.shaded")
border("#6d5735", ".token.reminder.sucumbios")
border("#cf1f30", ".token.reminder.senado_farc")
border("#6d9f3b", ".token.reminder.senado_cartels")
border("#ffcf00", ".token.reminder.senado_auc")
border("#8dc73f", ".token.reminder.darien")

console.log(css.join("\n"))
