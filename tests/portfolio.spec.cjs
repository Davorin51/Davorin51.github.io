const { test, expect } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");

for (const width of [320, 375, 390, 768, 1024, 1440]) {
  test(`responsive layout and accessibility at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.locator("img").evaluateAll((images) =>
      Promise.all(images.map((img) => img.decode()))
    );
    expect(errors).toEqual([]);
    const measurements = await page.evaluate(() => {
      const projects = [...document.querySelectorAll(".project-card")]
        .map((card) => {
          const rect = card.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width };
        });
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        projects,
        services: [...document.querySelectorAll(".capability-grid>div")]
          .map((card) => card.getBoundingClientRect().y),
        background: getComputedStyle(document.body).backgroundColor,
      };
    });
    expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.viewport);
    expect(measurements.background).toBe("rgb(246, 245, 240)");
    if (width <= 760) {
      expect(new Set(measurements.projects.map((card) => card.x)).size).toBe(1);
      for (let i = 1; i < measurements.projects.length; i++) {
        expect(measurements.projects[i].y).toBeGreaterThan(measurements.projects[i - 1].y);
      }
    } else {
      expect(new Set(measurements.projects.map((card) => card.x)).size).toBe(2);
    }
    if (width >= 1024) expect(new Set(measurements.services).size).toBe(1);
    if (width <= 480) expect(new Set(measurements.services).size).toBe(4);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`portfolio-${width}.png`), fullPage: true });
  });
}

test("filters and project details work from the keyboard", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  const focusStyle = await page.locator(":focus").evaluate((element) => {
    const style = getComputedStyle(element);
    return { outline: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  expect(focusStyle.outline).not.toBe("none");
  expect(focusStyle.width).toBeGreaterThanOrEqual(2);
  const filters = page.getByRole("group", { name: "Filter projects" });
  await filters.getByRole("button", { name: "Python automation", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".project-card:visible")).toHaveCount(2);
  await expect(page.getByRole("status")).toHaveText("2 projects shown.");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await expect(filters.getByRole("button", { name: "Machine learning", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".project-card:visible")).toHaveCount(2);
  await filters.getByRole("button", { name: /All projects/ }).click();
  const details = page.locator("details").first();
  await details.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect(details.locator("p")).toBeVisible();
  // Every real link is reachable by native Tab navigation; unavailable contacts are plain text.
  const reached = new Set();
  await page.goto("/");
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press("Tab");
    const href = await page.evaluate(() => document.activeElement?.getAttribute("href"));
    if (href) reached.add(href);
  }
  const links = await page.locator("a[href]").evaluateAll((items) => items.map((item) => item.getAttribute("href")));
  expect(links.every((href) => reached.has(href))).toBe(true);
});

test("content survives without JavaScript and respects reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:8000/");
  await expect(page.locator(".project-card:visible")).toHaveCount(4);
  await expect(page.locator(".project-filters")).toBeHidden();
  const style = await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior);
  expect(style).toBe("auto");
  await expect(page.locator(".contact-placeholder")).toHaveCount(2);
  await context.close();
});
