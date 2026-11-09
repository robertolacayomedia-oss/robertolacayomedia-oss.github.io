// Portfolio projects. Order = order on the page.
// orient: "v" vertical 9:16, "h" horizontal 16:9.
// cat: live | events | tv | film | social
// vimeo: optional Vimeo video id, used instead of the local mp4.
// caseUrl / caseThumbs: optional "Behind the work" page.
// Copy rule: plain, first person, real facts only. No em dashes, no slogans.
window.PROJECTS = [
  {
    id: "gelatina", title: "Couleur Café × Gelatina", client: "Club Gelatina, Couleur Café", year: "2026",
    cat: "events", orient: "v", role: "Camera · Edit",
    desc: "I filmed Club Gelatina's set on the La Plancha stage at Couleur Café 2026. Handheld, right in the middle of the crowd, then cut into a short aftermovie."
  },
  {
    id: "vtv-padre", title: "Father's Day", client: "VTV Honduras", year: "2026",
    cat: "tv", orient: "h", role: "Idea · Script · Directing · Edit", caseUrl: "work/fathers-day.html", caseThumbs: ["media/case/padre/f003.jpg", "media/case/padre/f024.jpg", "media/case/padre/f066.jpg"],
    desc: "A Father's Day spot for VTV's national broadcast. A dad, his son and a paper parrot. I came up with the idea, wrote it, directed it and edited it."
  },
  {
    id: "mv-boogieville", title: "Midnight Voodoo × BoogieVille", client: "Midnight Voodoo, De Kunst Gent", year: "2026",
    cat: "live", orient: "v", role: "Camera · Edit · Colour · Logos",
    desc: "A vertical promo for the Midnight Voodoo × BoogieVille night at De Kunst in Gent. I cut it to the music, graded every shot in that red neon light and animated the logos."
  },
  {
    id: "celibacy", title: "The Celibacy Club", client: "Short film", year: "",
    cat: "film", orient: "h", role: "Directing", vimeo: "",
    desc: "A short comedy I directed. A group of friends goes on a celibacy retreat at a hostel in Utrecht, and the rules are very strict."
  },
  {
    id: "vtv-verano", title: "Vive tu Verano", client: "VTV Honduras", year: "2026",
    cat: "tv", orient: "h", role: "Coordination · Directing · Edit",
    desc: "VTV's summer jingle. We took the faces of the news, sports and entertainment shows to Roatán and Cantarranas. I coordinated the shoot, directed it and edited it."
  },
  {
    id: "mv-retro", title: "Midnight Voodoo aftermovie", client: "Midnight Voodoo", year: "2026",
    cat: "live", orient: "h", role: "Camera · Edit",
    desc: "Aftermovie of sets by El Nicoya, Adam Bkr and Mama Demba. I gave it an old analogue look, like a tape you found in a drawer."
  },
  {
    id: "goza-paramour", title: "GOZA at Paramour", client: "GOZA, Brussels", year: "2026",
    cat: "events", orient: "v", role: "Camera · Edit",
    desc: "Promo for GOZA, a Latin night at Paramour in Brussels. The host shows you around: salsa workshops, DJs, and a lot of hats."
  },
  {
    id: "elnicoya-live", title: "El Nicoya live set", client: "Midnight Voodoo × Kaban", year: "2026",
    cat: "live", orient: "v", role: "Camera · Edit",
    desc: "El Nicoya playing one of the Midnight Voodoo sessions we did with Kaban Clothing Store. I filmed and edited it."
  },
  {
    id: "vtv-trabajador", title: "Labor Day", client: "VTV Honduras", year: "2026",
    cat: "tv", orient: "h", role: "Directing · Camera · Edit",
    desc: "A Labor Day piece for VTV. We filmed people at work in markets and on the street, starting at sunrise."
  },
  {
    id: "mv-club", title: "Midnight Voodoo club night", client: "Midnight Voodoo", year: "2026",
    cat: "live", orient: "v", role: "Camera · Edit",
    desc: "A Midnight Voodoo night. Red light, low ceilings, no flash. Cut vertical for Instagram."
  },
  {
    id: "goza-requin", title: "GOZA × Le Requin d'Or", client: "GOZA", year: "2026",
    cat: "events", orient: "v", role: "Camera · Edit",
    desc: "Teaser for the GOZA night at Le Requin d'Or on 6 November."
  },
  {
    id: "vtv-meridiano", title: "Impacto VTV Meridiano", client: "VTV Honduras", year: "2026",
    cat: "tv", orient: "h", role: "Directing · Script · Production",
    desc: "Promo for Impacto Meridiano, VTV's midday news show."
  },
  {
    id: "declassic", title: "Dé Classic beach race", client: "Dé Classic, Bredene", year: "2026",
    cat: "events", orient: "v", role: "Camera · Edit",
    desc: "Promo for the Dé Classic beach race in Bredene. Lots of sand, lots of wind, lots of bikes."
  },
  {
    id: "elnicoya-tope", title: "El Nicoya, TOPE", client: "El Nicoya", year: "2026",
    cat: "live", orient: "v", role: "Camera · Edit",
    desc: "El Nicoya on a rooftop in Brussels at golden hour, then back inside to the decks."
  },
  {
    id: "vtv-periodista", title: "Journalist's Day", client: "VTV Honduras", year: "2026",
    cat: "tv", orient: "h", role: "Directing · Script · Production",
    desc: "For Honduran Journalist's Day on 25 May. A thank-you to VTV's reporters and anchors."
  },
  {
    id: "imeb-takeover", title: "IMEB Instagram takeover", client: "Thomas More, IMEB", year: "2026",
    cat: "social", orient: "v", role: "Content · Social",
    desc: "I took over the Instagram of my study programme at Thomas More to show what a day in my internship at a TV station really looked like."
  },
  {
    id: "vtv-picosas", title: "Tardes Picosas", client: "VTV Honduras", year: "2026",
    cat: "tv", orient: "h", role: "Directing · Script · Production",
    desc: "Promo for Tardes Picosas, VTV's afternoon show with Rafael Díaz Alcerro, \"el locutor del pueblo\"."
  },
  {
    id: "goza-grandplace", title: "GOZA on the Grand-Place", client: "GOZA", year: "2026",
    cat: "events", orient: "v", role: "Camera · Edit",
    desc: "An invitation for a GOZA night in September, filmed on the Grand-Place."
  },
  {
    id: "vtv-41", title: "VTV 41 years", client: "VTV Honduras", year: "2026",
    cat: "tv", orient: "h", role: "Directing · Script · Production",
    desc: "VTV turned 41. This spot mixes old archive footage with the studios today."
  },
  {
    id: "showreel-fiction", title: "Fiction and commercial reel", client: "Personal reel", year: "2026",
    cat: "film", orient: "h", role: "Directing · Edit",
    desc: "A quick reel of my fiction and commercial work."
  }
];

// Brands in the bottom marquee and the projects they open
window.BRANDS = [
  { name: "VTV Honduras", ids: ["vtv-padre", "vtv-verano", "vtv-trabajador", "vtv-meridiano", "vtv-periodista", "vtv-picosas", "vtv-41"] },
  { name: "Midnight Voodoo", ids: ["mv-boogieville", "mv-retro", "mv-club", "elnicoya-live"] },
  { name: "Couleur Café", ids: ["gelatina"] },
  { name: "El Nicoya", ids: ["elnicoya-live", "elnicoya-tope", "mv-retro"] },
  { name: "GOZA", ids: ["goza-paramour", "goza-requin", "goza-grandplace"] },
  { name: "Club Gelatina", ids: ["gelatina"] },
  { name: "Albavisión", ids: ["vtv-padre", "vtv-verano", "vtv-trabajador", "vtv-meridiano", "vtv-periodista", "vtv-picosas", "vtv-41"] },
  { name: "BoogieVille", ids: ["mv-boogieville"] },
  { name: "Le Requin d'Or", ids: ["goza-requin"] },
  { name: "Thomas More", ids: ["imeb-takeover"] },
  { name: "Dé Classic", ids: ["declassic"] }
];

// Hero showreel (not in the grid)
window.SHOWREEL = {
  id: "showreel-2026", title: "Showreel 2026", client: "Roberto Lacayo", year: "2026",
  cat: "film", orient: "h", role: "Directing · Camera · Edit",
  desc: "My 2026 showreel. About twenty seconds."
};
