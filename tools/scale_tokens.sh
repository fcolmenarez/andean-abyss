mkdir -p tokens.1x tokens.2x

function loop() {
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/shipment.png $OUT/shipment.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_1.png $OUT/govt_control.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_1.png $OUT/farc_control.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_6.png $OUT/farc_zone.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_7.png $OUT/unshaded_ndsc.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_8.png $OUT/unshaded_ospina.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_15.png $OUT/unshaded_tapias.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_16.png $OUT/unshaded_1st_div.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_23.png $OUT/unshaded_black_hawks.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_24.png $OUT/unshaded_7th_sf.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_32.png $OUT/unshaded_meteoro.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_40.png $OUT/unshaded_mtn_bns.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_7.png $OUT/shaded_ndsc.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_8.png $OUT/shaded_ospina.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_15.png $OUT/shaded_tapias.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_16.png $OUT/shaded_1st_div.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_23.png $OUT/shaded_black_hawks.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_24.png $OUT/shaded_7th_sf.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_32.png $OUT/shaded_meteoro.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_b_40.png $OUT/shaded_mtn_bns.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_30.png $OUT/oppose_plus_bases.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_31.png $OUT/aid.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_37.png $OUT/el_presidente.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_38.png $OUT/total_support.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/five_a_39.png $OUT/prop_card.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_1.png $OUT/active_support.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_2.png $OUT/terror.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_4.png $OUT/active_opposition.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_5.png $OUT/reminder_senado_cartels.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_6.png $OUT/reminder_darien.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_8.png $OUT/reminder_senado_auc.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_11.png $OUT/reminder_senado_farc.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_a_17.png $OUT/reminder_sucumbios.png

	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_b_1.png $OUT/passive_support.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_b_2.png $OUT/sabotage.png
	convert -colorspace RGB -resize $SCALE -colorspace sRGB HIRES/tokens/half_b_4.png $OUT/passive_opposition.png
}

OUT=tokens.1x
SCALE=6.25%
loop

OUT=tokens.2x
SCALE=12.5%
loop
