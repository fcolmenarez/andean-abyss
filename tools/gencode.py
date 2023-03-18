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
for line in open("events.txt").readlines():
	line = line.strip()
	if line == "EOF":
		break
	elif line == "":
		continue
	elif line.startswith("#"):
		continue
	elif line.startswith("EVENT"):
		flush_code()
		event = (int(line.split()[1]) << 1)
	elif line.startswith("SHADED"):
		flush_code()
		event = (int(line.split()[1]) << 1) + 1
	else:
		buf.append(line)

flush_code()

code_index = ["-1"] * (72 * 2)

pc = 0
print("const CODE = [")
for event in range(2,146):
	if event & 1 == 1:
		print("\t// SHADED", event >> 1)
	else:
		print("\t// EVENT", event >> 1)
	if not event in code:
		print("\t// TODO")
		continue
	code_index[event-2] = str(pc)
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
		elif line.startswith('while'):
			line = line.split(' ', 1)
			print('\t[ vm_while, ()=>' + line[1] + ' ],')
		elif line.startswith('if'):
			line = line.split(' ', 1)
			print('\t[ vm_if, ()=>' + line[1] + ' ],')
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
	print('\t[ vm_return ],')
	pc = pc + 1
print("]")
print("const CODE_INDEX = [ " + ", ".join(code_index) + " ]")
