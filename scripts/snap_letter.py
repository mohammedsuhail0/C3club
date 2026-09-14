import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\e6b99695-0829-4afd-8daf-841bc62ab80d"
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="msedge", headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 1050})
        print("Navigating to admin...", flush=True)
        await page.goto("https://c3club.vercel.app/admin?admin=c3core", wait_until="networkidle")
        await asyncio.sleep(2)
        
        print("Opening Mohammed Ibrahim Shareef...", flush=True)
        row = page.locator("tr", has_text="Mohammed Ibrahim Shareef")
        await row.locator("button:has-text('Review')").click()
        await asyncio.sleep(1)
        
        # Scroll drawer down to the action buttons
        drawer = page.locator("div.overflow-y-auto").last
        await drawer.evaluate("el => el.scrollTop = el.scrollHeight")
        await asyncio.sleep(0.5)
        
        print("Clicking Accept Candidate & Issue Key...", flush=True)
        accept_btn = page.locator("button:has-text('Accept Candidate & Issue Key')")
        if await accept_btn.count() > 0:
            await accept_btn.click()
            await asyncio.sleep(1.5)
            
        print("Clicking Acceptance Letter...", flush=True)
        letter_btn = page.locator("button:has-text('Acceptance Letter')").first
        await letter_btn.click()
        await asyncio.sleep(2)
        
        shot = os.path.join(artifact_dir, "live_official_acceptance_letter.png")
        await page.screenshot(path=shot, full_page=False)
        print(f"SUCCESS: {shot}", flush=True)
        await browser.close()

asyncio.run(main())
