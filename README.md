# r2s2r-grounding

Project page for *Getting Out and Getting Back: World and Behavior Grounding in Real2Sim2Real Co-Training*, served at https://industrialnext.github.io/r2s2r-grounding/

## Editing

Plain static HTML — no build step.

- `index.html` — page content (search for `TODO`)
- `static/css/style.css` — styles
- `static/images/fig1.jpg` — Fig. 1 overview (also used as social preview)
- `static/arxiv-paper.pdf` — paper PDF linked from the header
- `static/videos/` — empty for now

Preview locally: `python3 -m http.server` then open http://localhost:8000

To add a paper figure, render the PDF with `qlmanage -t -s 3000 -o . figure.pdf`, then convert it with `sips -s format jpeg -s formatOptions 85 --resampleWidth 2400 figure.pdf.png --out static/images/<name>.jpg`.

## Later

- [ ] Swap the "arXiv (coming soon)" pill for the real `arxiv.org/abs/...` link, and add `eprint` to the BibTeX
- [ ] Results figures (commented-out `#results` section in `index.html`)
- [x] Video (YouTube embed, unlisted: https://youtu.be/5Gvt4kh4AHc)

## Deployment

GitHub Pages: repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
