# r2s2r-grounding

Project page for *Getting Out and Getting Back: World and Behavior Grounding in Real2Sim2Real Co-Training*, served at https://industrialnext.github.io/r2s2r-grounding/

## Editing

Plain static HTML — no build step.

- `index.html` — page content (search for `TODO`)
- `static/css/style.css` — styles
- `static/images/fig1.jpg` — Fig. 1 overview (also used as social preview)
- `static/js/results.js` — interactive results chart (500M policy, data from Table 2)
- `static/js/lazy-video.js` — plays muted loops only while on screen
- `static/videos/rollout-<policy>-<condition>.mp4` — one real rollout per policy × condition (from `taro_policy_conditions_20_table2_20260930`; success if the Table 2 rate is ≥ 50%, failure otherwise), switched by the chart's condition selector
- `static/videos/sim-<config>.mp4` — simulated trajectory per grounding configuration, head view (`*-3views.mp4` = full 3-camera strip)
- `static/videos/hero-loop.mp4` — background loop behind the title (from `demo_loop.mov`)
- `static/videos/switch-d100-d10.mp4` — D_100 (top) and D_10 (bottom) rollouts stacked; `switch-latent.mp4` — latent-space screen recording
- `static/videos/craft-vs-real.mp4` and `static/images/visual-gap.jpg` — CRAFT-translated vs. real views and the observation-embedding plot
- Posters for all clips are in `static/images/posters/`

Rollout clips were made from the head-camera exports with (sim clips: crop the head panel of the 3-view export instead):

```
ffmpeg -i in.mp4 -an -vf "crop=512:510:0:30,scale=512:512" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart rollout-<name>.mp4
```

Preview locally: `python3 -m http.server` then open http://localhost:8000

To add a paper figure, render the PDF with `qlmanage -t -s 3000 -o . figure.pdf`, then convert it with `sips -s format jpeg -s formatOptions 85 --resampleWidth 2400 figure.pdf.png --out static/images/<name>.jpg`.

## Later

- [x] arXiv link (https://arxiv.org/abs/2610.00821) and `eprint` in the BibTeX
- [ ] Results figures (commented-out `#results` section in `index.html`)
- [x] Video (YouTube embed, unlisted: https://youtu.be/5Gvt4kh4AHc)

## Deployment

GitHub Pages: repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.

## Analytics

Microsoft Clarity is loaded asynchronously from the `<head>` in `index.html` for project `yt8r4rlxrz`. Authorized project members can view traffic, recordings, and attention heatmaps in the [Clarity dashboard](https://clarity.microsoft.com/projects/view/yt8r4rlxrz/dashboard). Data collection starts after deployment; historical visits are not backfilled.
