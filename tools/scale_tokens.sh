mkdir -p tokens.1x tokens.2x

function loop() {
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_1.ppm $OUT/govt_control.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_1.ppm $OUT/farc_control.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_6.ppm $OUT/farc_zone.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_7.ppm $OUT/unshaded_ndsc.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_8.ppm $OUT/unshaded_ospina.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_15.ppm $OUT/unshaded_tapias.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_16.ppm $OUT/unshaded_1st_div.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_23.ppm $OUT/unshaded_black_hawks.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_24.ppm $OUT/unshaded_7th_sf.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_32.ppm $OUT/unshaded_meteoro.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_40.ppm $OUT/unshaded_mtn_bns.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_7.ppm $OUT/shaded_ndsc.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_8.ppm $OUT/shaded_ospina.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_15.ppm $OUT/shaded_tapias.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_16.ppm $OUT/shaded_1st_div.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_23.ppm $OUT/shaded_black_hawks.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_24.ppm $OUT/shaded_7th_sf.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_32.ppm $OUT/shaded_meteoro.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_40.ppm $OUT/shaded_mtn_bns.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_30.ppm $OUT/oppose_plus_bases.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_31.ppm $OUT/aid.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_37.ppm $OUT/el_presidente.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_38.ppm $OUT/total_support.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_39.ppm $OUT/prop_card.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_1.ppm $OUT/active_support.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_2.ppm $OUT/terror.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_4.ppm $OUT/active_opposition.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_5.ppm $OUT/reminder_senado_cartels.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_6.ppm $OUT/reminder_darien.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_8.ppm $OUT/reminder_senado_auc.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_11.ppm $OUT/reminder_senado_farc.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_17.ppm $OUT/reminder_sucumbios.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_b_1.ppm $OUT/passive_support.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_b_2.ppm $OUT/sabotage.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_b_4.ppm $OUT/passive_opposition.png
}

OUT=tokens.1x
SCALE=6.25%
loop

OUT=tokens.2x
SCALE=12.5%
loop
