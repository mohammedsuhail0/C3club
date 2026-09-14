import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\e6b99695-0829-4afd-8daf-841bc62ab80d"
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="msedge", headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 950})
        print("Navigating to https://c3club.vercel.app/?code=EVKH ...", flush=True)
        await page.goto("https://c3club.vercel.app/?code=EVKH", wait_until="networkidle")
        await asyncio.sleep(3)
        
        # Check scroll position
        scroll_y = await page.evaluate("window.scrollY")
        print(f"Current scroll position: {scroll_y}px", flush=True)
        
        shot = os.path.join(artifact_dir, "live_code_redirect_pass_section.png")
        await page.screenshot(path=shot, full_page=False)
        print(f"Saved: {shot}", flush=True)
        await browser.close()

asyncio.run(main())
