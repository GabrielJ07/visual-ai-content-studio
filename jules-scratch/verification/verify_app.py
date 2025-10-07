from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    def set_color_value(selector, color):
        script = f"""
            const el = document.querySelector('{selector}');
            el.value = '{color}';
            el.dispatchEvent(new Event('input', {{ 'bubbles': true }}));
            el.dispatchEvent(new Event('change', {{ 'bubbles': true }}));
        """
        page.evaluate(script)

    try:
        # Step 1: Configure Brand Kit in Settings
        page.goto("http://localhost:3000/settings")
        page.wait_for_selector("h2:has-text('Brand Kit & User Settings')")

        # Fill out brand kit using a more robust method for color inputs
        set_color_value('input#color-0', '#FF0000')
        set_color_value('input#color-1', '#00FF00')
        set_color_value('input#color-2', '#0000FF')

        page.get_by_label("Describe the mood and style of your typography").fill("Modern, clean, sans-serif")
        page.get_by_label("Keywords to guide AI image generation").fill("vibrant, abstract, futuristic")

        page.screenshot(path="jules-scratch/verification/01_settings_page.png")

        page.get_by_role("button", name="Save Brand Kit").click()
        expect(page.locator("text=Brand Kit saved successfully!")).to_be_visible()

        # Step 2: Generate an Image in the Studio
        page.goto("http://localhost:3000/")
        page.wait_for_selector("h2:has-text('Create Your Visual')")

        page.get_by_label("Base Prompt").fill("A robot painting a masterpiece")
        page.get_by_role("button", name="Refine with Brand AI").click()

        # Wait for the prompt to be refined (check for a longer text)
        expect(page.get_by_label("Base Prompt")).not_to_have_value("A robot painting a masterpiece", timeout=10000)

        page.get_by_role("button", name="Generate Visual").click()

        # Wait for the image to appear
        expect(page.locator("img[alt*='AI generated visual']")).to_be_visible(timeout=60000)
        page.screenshot(path="jules-scratch/verification/02_studio_page_with_image.png")

        # Step 3: Verify Multi-Platform Preview
        page.goto("http://localhost:3000/preview")
        page.wait_for_selector("h2:has-text('Multi-Platform Preview')")

        # Check for at least one preview image
        expect(page.locator("img[alt*='Preview for']")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/03_preview_page.png")

        # Step 4: Verify Scheduling Page
        page.goto("http://localhost:3000/schedule")
        page.wait_for_selector("h2:has-text('Schedule Deployment')")

        # Check that the image to be scheduled is visible
        expect(page.locator("img[alt*='Scheduled content']")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/04_schedule_page.png")

        print("Verification script completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as p:
    run_verification(p)