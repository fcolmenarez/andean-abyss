#!/bin/env python3

code = {}
buf = []
event = 0

def flush_code():
	global buf
	if event > 0:
		code[event] = buf
		buf = []

event = 0
for line in open("tools/events.txt").readlines():
	line = line.strip()
	if line == "EOF":
		break
	elif line == "":
		continue
	elif line.startswith("#"):
		continue
	elif line.startswith("EVENT"):
		flush_code()
		event = int(line.split()[1])
	elif line.startswith("SHADED"):
		flush_code()
		event = int(line.split()[1]) + 100
	else:
		buf.append(line)

flush_code()

shaded = ["-1"] * 72
unshaded = ["-1"] * 72

pc = 0
print("const CODE = [")
for event in sorted(code.keys()):
	buf = code[event]
	if event > 100:
		print("\t// SHADED", event - 100)
		shaded[event  - 100] = str(pc)
	else:
		print("\t// EVENT", event)
		unshaded[event] = str(pc)
	for line in code[event]:
		if line.startswith('space'):
			line = line.split(' ', 2)
			print('\t[ vm_space, ' + line[1] + ', (s)=>' + line[2] + ' ],')
		elif line.startswith('each space'):
			line = line.split(' ', 2)
			print('\t[ vm_space, 0, (s)=>' + line[2] + ' ],')
		elif line.startswith('piece'):
			line = line.split(' ', 2)
			print('\t[ vm_piece, ' + line[1] + ', (p,s)=>' + line[2] + ' ],')
		elif line.startswith('each piece'):
			line = line.split(' ', 2)
			print('\t[ vm_piece, 0, (p,s)=>' + line[2] + ' ],')
		elif line.startswith('prompt'):
			line = line.split(' ', 1)
			print('\t[ vm_prompt, "' + line[1] + '" ],')
		elif line.startswith('log'):
			line = line.split(' ', 1)
			print('\t[ vm_log, "' + line[1] + '" ],')
		else:
			line = line.split(' ')
			cmd = line[0]
			args = [ ("()=>" + x if x[0] == '(' else x) for x in line[1:] ]
			if len(args) > 0:
				print('\t[ vm_' + cmd + ', ' + ', '.join(args) + ' ],')
			else:
				print('\t[ vm_' + cmd + ' ],')
		pc = pc + 1
	print('\t[ vm_endevent ],')
	pc = pc + 1
print("]")
print("const UNSHADED_START = [" + ",".join(unshaded) + "]")
print("const SHADED_START = [" + ",".join(shaded) + "]")
