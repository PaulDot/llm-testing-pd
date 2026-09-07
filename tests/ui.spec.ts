import { test, expect, Locator } from '@playwright/test';

test.describe('Chatbot Frontend UI Tests', () => {
    let inputField: Locator;
    let sendBtn: Locator;
    let userBubble: Locator;
    let aiBubble: Locator;

    test.beforeEach(async ({ page }) => {
        inputField = page.locator('#chat-input');
        sendBtn = page.locator('#send-btn');
        userBubble = page.locator('.message.user');
        aiBubble = page.locator('.message.ai');

        await page.goto('/');
    });

    test('should display sent message and render mock AI response', async ({ page }) => {
       await page.route('**/api/chat', async (route) => {
        await route.fulfill({
            status:200,
            contentType:'application/json',
            // mock data.reply from main.ts
            body:JSON.stringify({ reply: 'This is a mocked automated response for testing.' }),
        });
       });

       await inputField.fill('What is your timescale on returns?');
       await sendBtn.click();
       await expect(userBubble).toBeVisible();
       await expect(userBubble).toHaveText('What is your timescale on returns?');
       await expect(aiBubble).toBeVisible();
       await expect(aiBubble).toHaveText('This is a mocked automated response for testing.');
    });

        test('should allow users to submit entries using the Enter keyboard shortcut', async ({ page }) => {
        await page.route('**/api/chat', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ reply: 'Keyboard interaction confirmed.' }),
            });
        });

        await inputField.fill('Submitting via keyboard hook');
        await inputField.press('Enter'); // enter key

        await expect(userBubble).toHaveText('Submitting via keyboard hook');
        await expect(aiBubble).toHaveText('Keyboard interaction confirmed.');
    });

    test('should ignore empty submissions and not create empty chat bubbles', async () => {
        await inputField.fill('   '); // Spaces only
        await sendBtn.click();

        await expect(userBubble).not.toBeVisible();
        await expect(aiBubble).not.toBeVisible();
    });

    test('should render exceptionally long LLM responses cleanly inside the chat viewport container', async ({ page }) => {
        // Generate a big block of text
        const verboseAIResponse = 'Word '.repeat(200);

        await page.route('**/api/chat', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ reply: verboseAIResponse }),
            });
        });

        await inputField.fill('Give me a massive verbose explanation');
        await sendBtn.click();

        await expect(aiBubble).toBeVisible();
        await expect(aiBubble).toHaveText(verboseAIResponse);
        
        // Verify the text bubble isn't empty if large
        await expect(aiBubble).not.toBeEmpty(); 
    });

    test('should display the response correctly even with a delayed network payload', async ({ page }) => {
        await page.route('**/api/chat', async (route) => {
            // Artificially stall the response for 1.5 seconds to mimic latency
            await page.waitForTimeout(1500);
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ reply: 'Delayed response text complete.' }),
            });
        });

        await inputField.fill('Hello AI assistant');
        await sendBtn.click();

        await expect(aiBubble).toBeVisible();
        await expect(aiBubble).toHaveText('Delayed response text complete.');
    });

    test('should handle network/API server crashes gracefully using the fallback message', async ({ page }) => {
        // Intercept network traffic and force a 500 Server Error
        await page.route('**/api/chat', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal Server Error' }),
            });
        });

        await inputField.fill('Testing error boundary recovery.');
        await sendBtn.click();

        // Verifies the catch block string inside main.ts file executes correctly
        await expect(aiBubble).toBeVisible();
        await expect(aiBubble).toHaveText('Error connecting to assistant server.');
    });

})
