# Davorin Milicevic — Portfolio

A responsive, accessible static portfolio for software engineering, Python automation, machine learning research and embedded AI.

**Live site:** https://davorin51.github.io/

## Featured work

- [Python Automation Toolkit](https://github.com/Davorin51/python-automation-toolkit): data validation, analytics and automated Excel/PDF reports.
- [KV260 INT8 FPGA Inference](https://github.com/Davorin51/kv260-cifar10-int8-fpga-inference): PyTorch-to-FPGA deployment workflow.
- [DS_QNN](https://github.com/Davorin51/DS_QNN): training, pruning, PTQ/QAT and reproducible evaluation. Synthetic smoke results are identified as such.
- [Automotive Sensor Tests](https://github.com/Davorin51/Automotive_Sensor_test): educational sensor and CAN simulations with pytest.

## Run locally

No build system or package installation is required. Open `index.html` directly, or serve the repository with Python:

```bash
python -m http.server 8000
```

Visit http://localhost:8000/. Stop the server with Ctrl+C.

## Publish on GitHub Pages

In **Settings → Pages**, choose **Deploy from a branch**, branch **main**, folder **/(root)**. The `.nojekyll` file enables direct static hosting. Every subsequent push to `main` updates the site.

## Customize

- Edit the text, project links and contact links in `index.html`.
- Set colors, spacing and breakpoints in `styles.css`.
- Project categories and filters use `data-category` and `data-filter`; all projects remain visible when JavaScript is disabled.
- `script.js` adds filters and the current footer year. Project detail disclosures use native HTML and do not require JavaScript.
- Contact currently links to the verified GitHub profile. Add actual LinkedIn, Fiverr, Contra or public email links when chosen; there are no fabricated profile links or submission forms.
- Replace the dashboard image in `assets/` if the report design changes. The included image comes from the public Python Automation Toolkit example and uses synthetic data.
- If changing the domain, update the canonical URL, Open Graph metadata, `robots.txt` and `sitemap.xml`.

## Design and accessibility

System fonts, no external scripts, no tracking, no cookies and no runtime dependencies. Includes semantic sections, keyboard focus indicators, a skip link, filter state announcements, reduced-motion support, mobile layouts and print styles. The project artwork is illustrative; the Excel dashboard is an actual generated example.

## Checks

```bash
python scripts/check_site.py
node --check script.js
```

A GitHub Actions workflow runs these checks on pushes and pull requests. Static checks validate local assets, anchors, metadata, unique IDs and project/filter consistency. They do not replace visual browser testing.

## Content provenance

Biographical content comes from the owner’s public GitHub profile README and the portfolio brief. Project descriptions come from their public repositories. There are no client testimonials, invented benchmarks or claims of certified automotive safety. No private research repositories or data are exposed.

## License

Site code is under the MIT license. Davorin Milicevic’s name and biographical text do not grant permission to impersonate him or claim ownership of the listed projects. Linked repositories retain their own licenses.
