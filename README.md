# Snake Game

A lightweight, client-only Snake game. Everything runs in the browser—no backend required.

## Play
Open `index.html` in your browser. Use the arrow keys or WASD to steer the snake. Press **Space** or click **Pause** to halt the game, and click **Restart** after a game over.

Scores persist locally via `localStorage`.

## Deploy to GitHub Pages
1. Push this repository to GitHub and ensure your default branch is `main`.
2. Enable GitHub Pages using the **GitHub Actions** source in **Settings → Pages**.
3. The included workflow `.github/workflows/deploy-pages.yml` will publish the current branch to Pages on each push; you can also run it manually via **Actions → Deploy static site to GitHub Pages → Run workflow**.
4. After the workflow finishes, visit the **Pages** URL shown in the deploy job output to play the game online.
