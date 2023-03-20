"use strict"

let fs = require("fs")

let pc = 0
let UCODE = Array(72).fill(0)
let SCODE = Array(72).fill(0)

function emit(line) {
	++pc
	line[0] = "vm_" + line[0]
	for (let i = 1; i < line.length; ++i) {
		if (typeof line[i] === "string" && line[i][0] === "(" && !line[i].match(/\)=>/))
			line[i] = "()=>" + line[i]
	}
	console.log("\t[ " + line.join(", ") + " ],")
}

console.log("const CODE = [")

for (let line of fs.readFileSync("events.txt", "utf-8").split("\n")) {
	line = line.trim()
	if (line.length === 0 || line[0] === "#")
		continue
	if (line === "EOF")
		break
	line = line.split(" ")
	switch (line[0]) {
	case "EVENT":
		emit(["return"])
		UCODE[line[1]] = pc
		console.log("// EVENT " + line[1])
		break
	case "SHADED":
		emit(["return"])
		SCODE[line[1]] = pc
		console.log("// SHADED " + line[1])
		break

	case "space_opt":
		emit([ "space", 0, 1, line[1], "(s)=>" + line.slice(2).join(" ") ])
		break
	case "space":
		emit([ "space", 0, 0, line[1], "(s)=>" + line.slice(2).join(" ") ])
		break
	case "space_undo_opt":
		emit([ "space", 1, 1, line[1], "(s)=>" + line.slice(2).join(" ") ])
		break
	case "space_undo":
		emit([ "space", 1, 0, line[1], "(s)=>" + line.slice(2).join(" ") ])
		break

	case "piece_opt":
		emit([ "piece", 0, 1, line[1], "(s,p)=>" + line.slice(2).join(" ") ])
		break
	case "piece":
		emit([ "piece", 0, 0, line[1], "(s,p)=>" + line.slice(2).join(" ") ])
		break
	case "piece_undo_opt":
		emit([ "piece", 1, 1, line[1], "(s,p)=>" + line.slice(2).join(" ") ])
		break
	case "piece_undo":
		emit([ "piece", 1, 0, line[1], "(s,p)=>" + line.slice(2).join(" ") ])
		break

	case "place_opt":
		emit([ "place", 0, 1, line[1], line[2] ])
		break
	case "place":
		emit([ "place", 0, 0, line[1], line[2] ])
		break
	case "place_undo_opt":
		emit([ "place", 1, 1, line[1], line[2] ])
		break
	case "place_undo":
		emit([ "place", 1, 0, line[1], line[2] ])
		break

	case "log":
	case "prompt":
		emit([ line[0], line.slice(1).join(" ") ])
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
console.log("const UCODE = " + JSON.stringify(UCODE))
console.log("const SCODE = " + JSON.stringify(SCODE))