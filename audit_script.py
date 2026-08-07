import asyncio
from playwright.async_api import async_playwright

async def audit_url(browser, url):
    page = await browser.new_page()
    print(f"\n--- Auditing: {url} ---")
    
    # Catching redirects
    final_url = url
    def handle_request(request):
        nonlocal final_url
        if request.is_navigation_request():
            pass # We'll check page.url after goto

    page.on("request", handle_request)
    
    try:
        response = await page.goto(url, wait_until="networkidle")
        final_url = page.url
        print(f"Final URL: {final_url}")
        
        # Initial HTML Head (from response body)
        initial_html = await response.text()
        # This is a bit complex to parse accurately here, but we can look for specific tags
        
        # Rendered Head Metadata
        title = await page.title()
        description = await page.locator('meta[name="description"]').get_attribute("content") or "None"
        canonical = await page.locator('link[rel="canonical"]').get_attribute("href") or "None"
        robots = await page.locator('meta[name="robots"]').get_attribute("content") or "None"
        
        print(f"Title: {title}")
        print(f"Description: {description}")
        print(f"Canonical: {canonical}")
        print(f"Robots: {robots}")
        
        # Check for client-side redirect
        if final_url != url and final_url != url + "/":
            print(f"Client-side redirect detected to: {final_url}")

        # Find blog links if it's the blog page
        if "/blogs" in url:
            links = await page.locator('a[href^="/blogs/"]').all_attribute_contents("href")
            unique_links = sorted(list(set(links)))
            print(f"Found blog links: {unique_links[:3]}")

    except Exception as e:
        print(f"Error auditing {url}: {e}")
    finally:
        await page.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        urls = [
            "https://yowa.us/",
            "https://yowa.us/heroesofkampala",
            "https://yowa.us/blogs",
            "https://yowa.us/posts",
            "https://yowa.us/2023/",
            "https://www.yowa.us/"
        ]
        for url in urls:
            await audit_url(browser, url)
        await browser.close()

asyncio.run(main())
