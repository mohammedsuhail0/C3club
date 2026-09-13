import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // 1. Scrub through the preloader
  console.log('Scrubbing preloader...');
  for (let i = 0; i < 15; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(500);

  // 2. Screenshot Hero
  const artifactDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\e6b99695-0829-4afd-8daf-841bc62ab80d';
  await page.screenshot({ path: path.join(artifactDir, 'hero_updated.png') });
  console.log('Hero screenshot saved.');

  // 3. Scroll to FoundingPass section
  const passSection = page.locator('#founding-pass');
  await passSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, 'founding_pass.png') });
  console.log('Founding Pass screenshot saved.');

  // 4. Scroll to ShipWall section
  const shipSection = page.locator('#ship-wall');
  await shipSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, 'ship_wall.png') });
  console.log('Ship Wall screenshot saved.');

  // 5. Scroll to BuilderQuiz section
  const quizSection = page.locator('#builder-quiz');
  await quizSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, 'builder_quiz.png') });
  console.log('Builder Quiz screenshot saved.');

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
