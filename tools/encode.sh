#!/usr/bin/env bash
# Builds web versions of the portfolio videos: full video, 5s hover preview, poster.
# Usage: bash tools/encode.sh   (run from portfolio-site/)
set -u
SRC="C:/Users/rlaca/Desktop/Roberto skills"
OUT="media"
mkdir -p "$OUT"

# id | source (relative to SRC) | poster time (s)
LIST=$(cat <<'EOF'
showreel-2026|SHOWREEL 2026 - RL.mp4|2
showreel-fiction|showreel rl.mp4|11
mv-boogieville|midnight voodoo/Midnight Voodoo x BoogieVille.mp4|8
mv-retro|midnight voodoo/RETRO VID.mp4|12
mv-club|midnight voodoo/MIDNIGHT VOODOO VID.mp4|30
elnicoya-live|midnight voodoo/ELNICOYA.mp4|0.6
elnicoya-tope|El nicoya/LUC TOPE.mp4|7
gelatina|Gelatina/GELATINA La Plancha Final 2 - 2026.mp4|0.6
goza-paramour|GOZA/ARIEL FR ENG.mp4|9
goza-requin|GOZA/goza party arie nov 6.mp4|2
goza-grandplace|GOZA/goza final septiembre 2026.mp4|3
declassic|beach race.mp4|2
vtv-padre|Internship/Dia Del Padre Cinematica.mp4|66
vtv-verano|Internship/JINGLE VERANO 2026.mp4|37
vtv-trabajador|Internship/PROMO - DIA DEL TRABAJADOR.mp4|13
vtv-periodista|Internship/PROMO - DIA DEL PERIODISTA.mp4|8
vtv-meridiano|Internship/PROMO - IMPACTO VTV MERIDIANO V3.mp4|34
vtv-picosas|Internship/PROMO GEN - TARDES PICOSAS V2.mp4|1
vtv-41|Internship/Jingle 41 Aniversario VTV 2026.mp4|28
imeb-takeover|Internship/reel ig takeover 1.mp4|1
celibacy|Celibacy final.mp4|3
EOF
)

encode_one() {
  IFS='|' read -r id src pt <<<"$1"
  in="$SRC/$src"
  w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$in")
  h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$in")
  fr=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$in")
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
  fps=$(awk -v f="$fr" 'BEGIN{split(f,a,"/"); r=a[1]/(a[2]?a[2]:1); print (r>31?30:r)}')
  if [ "$w" -gt "$h" ]; then
    full="scale=1920:-2"; prev="scale=640:-2"; post="scale=1280:-2"; maxr=5M; crf=21
  else
    full="scale=1080:-2"; prev="scale=360:-2"; post="scale=720:-2"; maxr=4M; crf=22
  fi
  # Full video (Celibacy is long: it goes to Vimeo, only poster + preview here)
  if [ "$id" != "celibacy" ]; then
    ffmpeg -v error -y -i "$in" -vf "$full:flags=lanczos,fps=$fps,format=yuv420p" \
      -c:v libx264 -profile:v high -preset slow -crf $crf -maxrate $maxr -bufsize 10M \
      -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
      -c:a aac -b:a 160k -ac 2 -movflags +faststart "$OUT/$id.mp4"
  fi
  # 5s silent hover preview from ~30% in
  ss=$(awk -v d="$dur" 'BEGIN{s=d*0.3; if (s+5>d) s=d-5; if (s<0) s=0; print s}')
  ffmpeg -v error -y -ss "$ss" -t 5 -i "$in" -vf "$prev:flags=lanczos,fps=25,format=yuv420p" \
    -an -c:v libx264 -preset slow -crf 28 -movflags +faststart "$OUT/$id-preview.mp4"
  # Poster
  ffmpeg -v error -y -ss "$pt" -i "$in" -frames:v 1 -vf "$post:flags=lanczos" -q:v 4 "$OUT/$id.jpg"
  echo "done $id"
}
export -f encode_one
export SRC OUT

echo "$LIST" | while IFS= read -r line; do printf '%s\0' "$line"; done | xargs -0 -P 4 -I{} bash -c 'encode_one "$@"' _ {}
ls -la "$OUT" | awk '{s+=$5} END{print "TOTAL MB:", s/1048576}'
