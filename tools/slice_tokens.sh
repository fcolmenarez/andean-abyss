# die cut line width = 9 (+4 to center)
# 1/2" tokens 600px wide
# 5/8" tokens 750px wide

# FRONT SHEET (left die cut edge)
# 1/2" at 588 1188 1788 1388 2988
# 1/2" at 4188 4788 5388 5988 6588 
# 5/8" at 7896 8882 9868 10855 11841

# BACK SHEET (left die cut edge)
# 1/2" at 5991 6591 7191 7791 8391 9591
# 5/8" at 588 1574 2560 3546 4533

# BOTH SHEETS (top die cut edge)
# 1/2" at 1356 5256 5856
# 5/8" at 756 1742 2728 3714 4700 5688 6674 7660

# THEN trim some margins so the result @75dpi is 36 / 45
# 1/2" 576x576+12+12
# 5/8" 720x720+15+15

# Circles! 825x825 -> trim to 800x800 @75dpi is 50x50
# 3887+8670 - 4712+9495

pngtopnm HIRES/tokens/sheet_a.png > /tmp/big.ppm

pnmcut 3887 8670 825 825 /tmp/big.ppm | pnmcut 12 12 800 800 | pnmtopng > HIRES/tokens/shipment.png

I=1
for L in 592 4192 4792 5392 5992 6592
do
	for T in 1360 5260 5860
	do
		echo half $I $L $T
		pnmcut $L $T 600 600 /tmp/big.ppm | pnmcut 12 12 576 576 | pnmtopng > HIRES/tokens/half_a_$I.png
		I=$(expr $I + 1)
	done
done

I=1
for L in 7900 8886 9872 10859 11845
do
	for T in 760 1746 2732 3718 4704 5692 6678 7664
	do
		echo five $I $L $T
		pnmcut $L $T 750 750 /tmp/big.ppm | pnmcut 15 15 720 720 | pnmtopng > HIRES/tokens/five_a_$I.png
		I=$(expr $I + 1)
	done
done

pngtopnm HIRES/tokens/sheet_b.png > /tmp/big.ppm

I=1
for L in 9595 8395 7795 7195 6595 5995
do
	for T in 1360 5260 5860
	do
		echo half $I $L $T
		pnmcut $L $T 600 600 /tmp/big.ppm | pnmcut 12 12 576 576 | pnmtopng > HIRES/tokens/half_b_$I.png
		I=$(expr $I + 1)
	done
done

I=1
for L in 4537 3550 2564 1578 592
do
	for T in 760 1746 2732 3718 4704 5692 6678 7664
	do
		echo five $I $L $T
		pnmcut $L $T 750 750 /tmp/big.ppm | pnmcut 15 15 720 720 | pnmtopng > HIRES/tokens/five_b_$I.png
		I=$(expr $I + 1)
	done
done
