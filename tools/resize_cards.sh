mkdir -p cards.1x cards.2x
for F in HIRES/cards/*.png
do
	echo $F
	# 186x261 at 75dpi (unused)
	# 248x348 at 100dpi
	convert -colorspace RGB -gravity Center -crop 2976x4176+0+0 -resize 8.333333% -colorspace sRGB $F cards.1x/$(basename $F)
	convert -colorspace RGB -gravity Center -crop 2976x4176+0+0 -resize 16.666666% -colorspace sRGB $F cards.2x/$(basename $F)
done
