mkdir -p HIRES/tokens
# gs -r1200 -sDEVICE=png16m -o HIRES/tokens/sheet_a.png HIRES/AndeanAbyss_Tokens_FRONT-2018.pdf
# gs -r1200 -sDEVICE=png16m -o HIRES/tokens/sheet_b.png HIRES/AndeanAbyss_Tokens_BACK-2018.pdf
mutool draw -A0 -r1200 -z5 -o HIRES/tokens/sheet_a.png HIRES/AndeanAbyss_Tokens_FRONT-2018.pdf
mutool draw -A0 -r1200 -z5 -o HIRES/tokens/sheet_b.png HIRES/AndeanAbyss_Tokens_BACK-2018.pdf
