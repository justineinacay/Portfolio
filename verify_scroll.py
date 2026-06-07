import os
import time
from playwright.sync_api import sync_playwright

def verify_portfolio(page):
    repo_root = os.getcwd()
    file_url = f"file://{repo_root}/index.html"
    page.goto(file_url)

    # Wait for the animation to finish
    time.sleep(2)
    page.screenshot(path="/home/jules/verification/portfolio_hero.png")

    # Scroll down to trigger intersection observer
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)
    page.screenshot(path="/home/jules/verification/portfolio_scrolled.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 1024})
        page = context.new_page()
        try:
            verify_portfolio(page)
        finally:
            browser.close()
