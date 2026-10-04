DEVOTIONAL BACKGROUND AUDIO
============================
The site auto-plays devotional music on the first open per session
(like temple websites). Put your audio file here:

  frontend/public/audio/bhajan.mp3

Any mp3 name works if you also set this env var (frontend/.env.local):

  NEXT_PUBLIC_BHAJAN_URL=/audio/your-file.mp3

Notes:
- Browsers block audible autoplay until the visitor taps once — the site
  shows a glowing "Mangal Dhun bajayein" pill for that first tap.
- Music loops softly (40% volume) with a mute toggle, bottom-right.
- If no audio file exists, no button appears at all.
