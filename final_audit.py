import asyncio
from playwright.async_api import async_playwright
import requests

urls_to_audit = [
    "https://yowa.us/blog/african-mobilities-kampala-s-kitenge-traders-in-focus",
    "https://yowa.us/blog/urbanism-in-kampala-post-covid-transformation"
]

async def audit_url(browser, url):
    page = await browser.new_page()
    print(f"\nAUDIT: {url}")
    
    # 1. HTTP Status and Headers (Initial)
    r = requests.get(url, allow_redirects=False)
    print(f"HTTP Status: {r.status_code}")
    print(f"Content-Type: {r.headers.get('Content-Type')}")
    
    # Extract initial metadata from raw HTML
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(r.text, 'html.parser')
    initial_title = soup.title.string if soup.title else "None"
    initial_desc = soup.find('meta', attrs={'name': 'description'})
    initial_desc = initial_desc['content'] if initial_desc else "None"
    initial_canonical = soup.find('link', attrs={'rel': 'canonical'})
    initial_canonical = initial_canonical['href'] if initial_canonical else "None"
    
    print(f"Initial Title: {initial_title}")
    print(f"Initial Description: {initial_desc}")
    print(f"Initial Canonical: {initial_canonical}")

    # 2. Rendered Head Metadata
    await page.goto(url, wait_until="networkidle")
    rendered_title = await page.title()
    rendered_desc = await page.locator('meta[name="description"]').get_attribute("content") or "None"
    rendered_canonical = await page.locator('link[rel="canonical"]').get_attribute("href") or "None"
    rendered_robots = await page.locator('meta[name="robots"]').get_attribute("content") or "None"
    
    print(f"Rendered Title: {rendered_title}")
    print(f"Rendered Description: {rendered_desc}")
    print(f"Rendered Canonical: {rendered_canonical}")
    print(f"Rendered Robots: {rendered_robots}")
    
    await page.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for url in urls_to_audit:
            await audit_url(browser, url)
        await browser.close()

asyncio.run(main())
