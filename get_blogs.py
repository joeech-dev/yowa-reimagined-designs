import asyncio
from playwright.async_api import async_playwright

async def get_blogs():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("https://yowa.us/blogs", wait_until="networkidle")
        
        # Look for links that likely point to blog posts
        # Based on the earlier redirect, they seem to use /blog/ prefix
        links = await page.evaluate('''() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => href.includes('/blog/'))
        }''')
        
        unique_links = sorted(list(set(links)))
        print("\n".join(unique_links))
        await browser.close()

asyncio.run(get_blogs())
