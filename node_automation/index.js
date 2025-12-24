require('dotenv').config();
const axios = require('axios');
const puppeteer = require('puppeteer');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const API_URL = 'http://localhost:8000/api/articles';

async function main() {
    try {
        console.log('Fetching articles from Laravel API...');
        const listResponse = await axios.get(API_URL);
        const articles = listResponse.data.data;

        if (!articles || articles.length === 0) {
            console.log("No articles found in API.");
            return;
        }

        const article = articles[0];
        console.log(`Processing article: "${article.title}" (ID: ${article.id})`);

        console.log('Searching Google for related content...');
        let searchLinks = await searchGoogle(article.title);
        console.log('Found links:', searchLinks);

        if (searchLinks.length < 2) {
            console.log("Using fallback references.");
            searchLinks = [
                'https://www.intercom.com/blog/chatbots-for-business/',
                'https://www.ibm.com/topics/artificial-intelligence'
            ];
        }

        console.log('Scraping reference content...');
        const ref1Content = await scrapeContent(searchLinks[0]);
        const ref2Content = await scrapeContent(searchLinks[1]);

        console.log('Generating AI rewrite (MOCK MODE)...');

        const newContent = `
# ${article.title} (AI Enhanced)

**Note: This content was generated in MOCK MODE.**

## Introduction
${article.content.substring(0, 150)}...

## Insights
*   **Ref 1**: ${ref1Content.substring(0, 100).replace(/\n/g, ' ')}...
*   **Ref 2**: ${ref2Content.substring(0, 100).replace(/\n/g, ' ')}...

## Conclusion
Rewritten for better SEO and clarity.

## References
1. [${searchLinks[0]}](${searchLinks[0]})
2. [${searchLinks[1]}](${searchLinks[1]})
    `;

        console.log('Publishing enhanced article to API...');

        const newArticleData = {
            title: `${article.title} (AI Enhanced API)`,
            content: newContent,
            source_url: article.source_url + '#api-enhanced-' + Date.now(),
            image_url: article.image_url,
            author: 'AI & ' + article.author,
            published_at: new Date().toISOString().split('T')[0],
            references: searchLinks
        };

        try {
            const createResponse = await axios.post(API_URL, newArticleData);
            console.log('Success! Created Article ID:', createResponse.data.id);
        } catch (apiError) {
            console.error('API Publish Failed:', apiError.response ? apiError.response.data : apiError.message);
        }

    } catch (error) {
        console.error('Script Error:', error.message);
    }
}

async function searchGoogle(query) {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'load', timeout: 30000 });
        const links = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('div.g a').forEach(a => {
                if (a.href && a.href.startsWith('http') && !a.href.includes('google')) { results.push(a.href); }
            });
            return results;
        });
        await browser.close();
        return [...new Set(links)].slice(0, 2);
    } catch (e) { return []; }
}

async function scrapeContent(url) {
    if (!url) return "";
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const content = await page.evaluate(() => document.body.innerText);
        await browser.close();
        return content.replace(/\s+/g, ' ').trim();
    } catch (e) { return "Content unavailable"; }
}

main();
