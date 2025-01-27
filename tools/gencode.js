"use strict"

let fs = require("fs")

let pc = 0
let UCODE = Array(72).fill(0)
let SCODE = Array(72).fill(0)

function emit(line) {
	++pc
	line[0] = "vm_" + line[0]
	for (let i = 1; i < line.length; ++i) {
		if (typeof line[i] === "string") {
			if (line[i] === "all")
				line[i] = 999
			if (line[i][0] === "(" && !line[i].match(/\)=>/))
				line[i] = "()=>" + line[i]
			if (line[i][0] === "`")
				line[i] = "()=>" + line[i]
		}
	}
	console.log("\t[ " + line.join(", ") + " ],")
}

console.log("const CODE = []")
let first = false

for (let line of fs.readFileSync("events.txt", "utf-8").split("\n")) {
	line = line.trim()
	if (line.length === 0 || line[0] === "#")
		continue
	if (line === "EOF")
		break
	line = line.split(" ")
	switch (line[0]) {
	case "EVENT":
		if (first++) {
			emit(["return"])
			console.log("]")
		}
		UCODE[line[1]] = pc
		console.log("")
		console.log("// EVENT " + line[1])
		console.log("CODE[" + line[1] + " * 2 + 0] = [")
		break
	case "SHADED":
		if (first++) {
			emit(["return"])
			console.log("]")
		}
		SCODE[line[1]] = pc
		console.log("")
		console.log("// SHADED " + line[1])
		console.log("CODE[" + line[1] + " * 2 + 1] = [")
		break

	case "if_space":
		emit([ "if", "()=>can_vm_space(1,(s)=>" + line.slice(1).join(" ") + ")" ])
		emit([ "space", true, 1, 1, "(s)=>" + line.slice(1).join(" ") ])
		emit([ "else" ])
		break

	case "or_space":
		emit([ "space", true, 1, 1, "(s)=>" + line.slice(1).join(" ") ])
		emit([ "endif" ])
		break

	case "space_no_undo":
		emit([ "space", false, line[1], line[1], "(s)=>" + line.slice(2).join(" ") ])
		break
	case "space":
		emit([ "space", true, line[1], line[1], "(s)=>" + line.slice(2).join(" ") ])
		break
	case "space_opt":
		emit([ "space", true, 0, line[1], "(s)=>" + line.slice(2).join(" ") ])
		break

	case "piece":
		emit([ "piece", false, line[1], line[1], "(p,s)=>" + line.slice(2).join(" ") ])
		break
	case "piece_undo":
		emit([ "piece", true, line[1], line[1], "(p,s)=>" + line.slice(2).join(" ") ])
		break
	case "piece_range":
		emit([ "piece", false, line[1], line[2], "(p,s)=>" + line.slice(3).join(" ") ])
		break
	case "piece_opt":
		emit([ "piece", false, 0, line[1], "(p,s)=>" + line.slice(2).join(" ") ])
		break
	case "piece_undo_opt":
		emit([ "piece", true, 0, line[1], "(p,s)=>" + line.slice(2).join(" ") ])
		break

	case "shipment":
		emit([ "shipment", false, line[1], line[1], "(p,s)=>" + line.slice(2).join(" ") ])
		break
	case "shipment_opt":
		emit([ "shipment", false, 0, line[1], "(p,s)=>" + line.slice(2).join(" ") ])
		break

	case "place":
		emit([ "place", false, 0, line[1], line[2] ])
		break
	case "place_opt":
		emit([ "place", false, 1, line[1], line[2] ])
		break
	case "auto_place":
		emit([ "auto_place", false, 0, line[1], line[2] ])
		break

	case "log":
	case "prompt":
		emit([ line[0], line.slice(1).join(" ") ])
		break

	case "count_spaces":
		emit([ line[0], "(s)=>" + line.slice(1).join(" ") ])
		break
	case "count_pieces":
		emit([ line[0], "(p,s)=>" + line.slice(1).join(" ") ])
		break

	case "asm":
	case "if":
	case "while":
		emit([ line[0], "()=>" + line.slice(1).join(" ") ])
		break

	default:
		emit(line)
		break
	}
}

emit(["return"])
console.log("]")
