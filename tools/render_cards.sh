mkdir -p HIRES/cards
for I in 01 02 03 04 05 06 07 08 09 $(seq 10 76) 7x BACK
do
	F1=$(echo "HIRES/AA CARD DECK PROOFS"/AAcard-$I".pdf")
	F2=$(echo "HIRES/AA CARD DECK PROOFS"/AAcard-$I"_2018-nf.pdf")
	if [ -e "$F1" ]
	then
		echo $F1
		gs -r1200 -sDEVICE=png16m -o HIRES/cards/card_$I.png "$F1"
	fi
	if [ -e "$F2" ]
	then
		echo $F2
		gs -r1200 -sDEVICE=png16m -o HIRES/cards/card_$I.png "$F2"
	fi
done
