import asyncio
from playwright.async_api import async_playwright
import os

ARTIFACT_DIR = r"C:\Users\Lenovo\.gemini\antigravity\brain\e6b99695-0829-4afd-8daf-841bc62ab80d"
DELIVERY_DIR = r"C:\Users\Lenovo\.gemini\antigravity\scratch\C3-OFFICIAL-DELIVERY\screenshots"

os.makedirs(DELIVERY_DIR, exist_ok=True)

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="msedge")
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # 1. Test Standalone Command Center with ?admin=c3core
        print("Testing Standalone Command Center...")
        await page.goto("http://localhost:4173/?admin=c3core", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        path1 = os.path.join(ARTIFACT_DIR, "standalone_command_center_clean.png")
        await page.screenshot(path=path1, full_page=False)
        await page.screenshot(path=os.path.join(DELIVERY_DIR, "standalone_command_center_clean.png"))
        print(f"Saved: {path1}")

        # 2. Test Add Candidate to test the roster & slide-over drawer
        print("Testing manual candidate addition...")
        await page.click("button:has-text('Add Applicant')")
        await page.wait_for_timeout(500)
        
        await page.fill("input[placeholder='Candidate Name']", "Mohammad Zaid")
        await page.fill("input[placeholder='10-digit mobile number']", "9876543210")
        await page.fill("input[placeholder='candidate@gmail.com']", "zaid.tech@gmail.com")
        await page.click("button:has-text('Save Candidate')")
        await page.wait_for_timeout(1000)

        path2 = os.path.join(ARTIFACT_DIR, "standalone_command_center_with_applicant.png")
        await page.screenshot(path=path2, full_page=False)
        await page.screenshot(path=os.path.join(DELIVERY_DIR, "standalone_command_center_with_applicant.png"))
        print(f"Saved: {path2}")

        # 3. Test opening Slide-Over Dossier Drawer
        print("Testing slide-over drawer...")
        await page.click("button:has-text('Review')")
        await page.wait_for_timeout(800)

        path3 = os.path.join(ARTIFACT_DIR, "standalone_slide_over_dossier.png")
        await page.screenshot(path=path3, full_page=False)
        await page.screenshot(path=os.path.join(DELIVERY_DIR, "standalone_slide_over_dossier.png"))
        print(f"Saved: {path3}")

        # 4. Test Forms & Ingestion Tab
        print("Testing Forms & Ingestion tab...")
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(400)
        await page.click("button:has-text('Forms & Ingestion')")
        await page.wait_for_timeout(600)

        path4 = os.path.join(ARTIFACT_DIR, "standalone_forms_ingestion.png")
        await page.screenshot(path=path4, full_page=False)
        await page.screenshot(path=os.path.join(DELIVERY_DIR, "standalone_forms_ingestion.png"))
        print(f"Saved: {path4}")

        # 5. Test switching back to Student Site
        print("Testing switch back to Student Site...")
        await page.click("button:has-text('Visit Student Site')")
        await page.wait_for_timeout(1000)

        path5 = os.path.join(ARTIFACT_DIR, "student_site_after_switch.png")
        await page.screenshot(path=path5, full_page=False)
        await page.screenshot(path=os.path.join(DELIVERY_DIR, "student_site_after_switch.png"))
        print(f"Saved: {path5}")

        # Cleanup test applicant so roster remains clean
        print("Cleaning up test candidate...")
        # Reset members.json back to empty []
        import json
        members_file = r"C:\Users\Lenovo\.gemini\antigravity\scratch\C3-OFFICIAL-DELIVERY\server\data\members.json"
        with open(members_file, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)

        await browser.close()
        print("Verification complete!")

if __name__ == "__main__":
    asyncio.run(run())
