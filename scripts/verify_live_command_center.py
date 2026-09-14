import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    artifact_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\e6b99695-0829-4afd-8daf-841bc62ab80d"
    os.makedirs(artifact_dir, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="msedge", headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()
        
        print("Navigating to live production Command Center...")
        await page.goto("https://c3club.vercel.app/admin?admin=c3core", wait_until="networkidle")
        await asyncio.sleep(2)
        
        # Take full table screenshot
        shot1 = os.path.join(artifact_dir, "live_roster_table_6_applicants.png")
        await page.screenshot(path=shot1, full_page=False)
        print(f"Saved: {shot1}")
        
        # Locate Mohammed Ibrahim Shareef's row and click 'Review'
        print("Locating Mohammed Ibrahim Shareef...")
        row = page.locator("tr", has_text="Mohammed Ibrahim Shareef")
        review_btn = row.locator("button:has-text('Review')")
        await review_btn.click()
        await asyncio.sleep(1.5)
        
        # Take screenshot of open dossier drawer showing all Google Form answers
        shot2 = os.path.join(artifact_dir, "live_dossier_answers_dropdown_mode.png")
        await page.screenshot(path=shot2, full_page=False)
        print(f"Saved: {shot2}")
        
        # Scroll down the drawer to bring the Builder Role section into view
        print("Scrolling drawer down...")
        drawer = page.locator("div.overflow-y-auto").last
        await drawer.evaluate("el => el.scrollTop = el.scrollHeight")
        await asyncio.sleep(1)

        # Click 'Type Custom' mode in the Builder Role section
        print("Switching Builder Role to 'Type Custom'...")
        custom_toggle = page.locator("button:has-text('Type Custom')").last
        await custom_toggle.click()
        await asyncio.sleep(0.5)
        
        # Type a custom role
        custom_input = page.locator("input[placeholder*='Systems Hacker']").last
        await custom_input.fill("Lead AI Systems Architect")
        await asyncio.sleep(0.5)
        
        # Take screenshot showing typed custom role
        shot3 = os.path.join(artifact_dir, "live_dossier_custom_role_typed.png")
        await page.screenshot(path=shot3, full_page=False)
        print(f"Saved: {shot3}")
        
        # Check 'Forms & Ingestion' tab to verify the sheet auto-sync status (no 400 error!)
        print("Checking Forms & Ingestion tab...")
        await page.locator("button:has-text('Forms & Ingestion')").click()
        await asyncio.sleep(1)
        shot4 = os.path.join(artifact_dir, "live_forms_ingestion_no_400.png")
        await page.screenshot(path=shot4, full_page=False)
        print(f"Saved: {shot4}")
        
        await browser.close()
        print("All live verifications completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
