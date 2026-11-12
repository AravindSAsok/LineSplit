# LineSplit

**Split long clipboard text into smaller, copy-ready chunks — without losing your place.**

LineSplit is a lightweight, privacy-friendly tool for dividing large text into manageable groups of lines. It is useful for code, logs, prompts, notes, and other long text.

- **100 lines per chunk by default** (customizable from 1 to 10,000)
- Preserves line order and blank lines
- Gives every chunk its own Copy button
- Saves extension chunks locally, so they survive closing and reopening the popup
- Includes a browser-based web version
- No account, backend, analytics, or external dependencies

## Try LineSplit online

**Web app:** https://aravindsasok.github.io/LineSplit/

The web version runs entirely in your browser and saves the current split in that browser's local storage. Clipboard access requires HTTPS (the published site uses HTTPS) and browser permission.

## Install the Chrome extension

1. Open the [LineSplit repository](https://github.com/AravindSAsok/LineSplit).
2. Click **Code → Download ZIP**, then extract the ZIP.
3. Open `chrome://extensions` in Google Chrome.
4. Turn on **Developer mode**.
5. Click **Load unpacked**.
6. Select the repository's **extension** folder.
7. Pin LineSplit from Chrome's Extensions menu.

To update, download the latest repository files, replace the extracted files, and click **Reload** on the LineSplit card at `chrome://extensions`.

> The extension is currently installed manually using Chrome Developer mode. Chrome Web Store publication is a separate step.

## Use it

1. Copy the text you want to split.
2. Open LineSplit and click **Paste Clipboard**. The extension reads the clipboard only after this explicit click.
3. Choose the number of lines per chunk (100 by default).
4. Click **Copy** on each chunk as needed.
5. Close and reopen the popup whenever you like — saved chunks are restored automatically.
6. Click **Clear** when you are finished.

## Run the web version locally

You can serve the static web app with Python:

```bash
cd web
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy with GitHub Pages (free)

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

1. Open **Settings → Pages** in the repository.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. The workflow deploys the contents of `web/` when changes are pushed to `main`.
4. Check the **Actions** tab for the deployment status.

GitHub Pages is free for public repositories. The web app and Chrome extension are two separate ways to use LineSplit.

## Project structure

```text
LineSplit/
├── .github/workflows/deploy-pages.yml
├── extension/          # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── web/                # Static website for GitHub Pages
│   ├── index.html
│   ├── style.css
│   └── app.js
├── LICENSE
└── README.md
```

## Privacy

LineSplit processes text locally in your browser. The extension stores its state in `chrome.storage.local`; the web version stores its state in the browser's `localStorage`. Text is not uploaded to a server. Clearing LineSplit removes the saved split state from the relevant local storage.

## License

MIT — see [LICENSE](LICENSE).
