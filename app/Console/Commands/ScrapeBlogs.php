<?php

namespace App\Console\Commands;

use App\Models\Article;
use GuzzleHttp\Client;
use Illuminate\Console\Command;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScrapeBlogs extends Command
{
    protected $signature = 'scrape:blogs';
    protected $description = 'Scrape 5 oldest articles from BeyondChats blogs';

    public function handle()
    {
        $client = new Client(['verify' => false, 'timeout' => 30]);
        $baseUrl = 'https://beyondchats.com/blogs/';

        $this->info("Visiting $baseUrl to find last page...");

        try {
            $response = $client->get($baseUrl);
            $html = (string) $response->getBody();
            $crawler = new Crawler($html);

            $currentPage = 12; 
            $lastPage = 12;

            while (true) {
                $checkUrl = $baseUrl . 'page/' . ($currentPage + 1) . '/';
                try {
                    $res = $client->get($checkUrl);
                    if ($res->getStatusCode() === 200) {
                        $htmlCheck = (string) $res->getBody();
                        $crawlerCheck = new Crawler($htmlCheck);
                        if ($crawlerCheck->filter('h2 > a, div.post-card')->count() > 0) {
                            $currentPage++;
                            $lastPage = $currentPage;
                            $this->info("Found page $lastPage with articles...");
                        } else {
                            $this->info("Page " . ($currentPage + 1) . " is empty. Stopping.");
                            break;
                        }
                    } else {
                        break;
                    }
                } catch (\Exception $e) {
                    break;
                }
                
                if ($currentPage > 50) break; 
            }

            $this->info("Last page determined: $lastPage");

            $articlesCollected = 0;
            $targetCount = 5;
            $pageToScrape = $lastPage;

            while ($articlesCollected < $targetCount && $pageToScrape >= 1) {
                $url = $baseUrl . 'page/' . $pageToScrape . '/';
                $this->info("Fetching articles from: $url");

                try {
                    $response = $client->get($url);
                    $html = (string) $response->getBody();
                    $crawler = new Crawler($html);

                    $pageArticles = $crawler->filter('div.post-card, article');
                    
                    if ($pageArticles->count() === 0) {
                         $h2Links = $crawler->filter('h2 > a');
                         if ($h2Links->count() > 0) {
                             $pageArticles = $h2Links->closest('div');
                         }
                    }

                    $nodeList = [];
                    $pageArticles->each(function (Crawler $node) use (&$nodeList) {
                        $nodeList[] = $node;
                    });
                    
                    $nodeList = array_reverse($nodeList);

                    foreach ($nodeList as $node) {
                        if ($articlesCollected >= $targetCount) break;
                        
                        $this->processArticle($node, $client);
                        $articlesCollected++; 
                    }

                } catch (\Exception $e) {
                    $this->error("Failed to scrape page $pageToScrape: " . $e->getMessage());
                }

                $pageToScrape--;
            }
        } catch (\Exception $e) {
            $this->error("Fatal Error: " . $e->getMessage());
            Log::error($e);
        }
    }

    private function processArticle(Crawler $node, Client $client)
    {
        try {
            $titleNode = $node->filter('h2 a, h3 a')->first();
            if ($titleNode->count() === 0) {
                 $titleNode = $node->filter('a')->first();
            }
            
            if ($titleNode->count() === 0) return;

            $title = $titleNode->text();
            $url = $titleNode->attr('href');

            if (Article::where('source_url', $url)->exists()) {
                $this->info("Skipping existing: $title");
                return;
            }

            $this->info("Scraping details for: $title");

            $detailRes = $client->get($url);
            $detailHtml = (string) $detailRes->getBody();
            $detailCrawler = new Crawler($detailHtml);

            $contentNode = $detailCrawler->filter('.entry-content, .post-content, article .content');
            $content = $contentNode->count() ? $contentNode->html() : '';

            $author = null;
            $authorNode = $detailCrawler->filter('.author-name, .entry-author, a[rel="author"]');
            if ($authorNode->count()) {
                $author = $authorNode->text();
            }

            $date = null;
            $dateNode = $detailCrawler->filter('time, .entry-date, .published');
            if ($dateNode->count()) {
                $dateText = $dateNode->attr('datetime') ?? $dateNode->text();
                $date = Carbon::parse($dateText);
            }

            $image = null;
            $imgNode = $detailCrawler->filter('.post-thumbnail img, .entry-content img, meta[property="og:image"]');
            if ($imgNode->count()) {
                 $image = $imgNode->attr('src') ?? $imgNode->attr('content');
            }

            Article::create([
                'title' => trim($title),
                'content' => trim(strip_tags($content)),
                'source_url' => $url,
                'image_url' => $image,
                'author' => $author ? trim($author) : 'Unknown',
                'published_at' => $date,
            ]);

            $this->info("Saved: $title");

        } catch (\Exception $e) {
            $this->error("Failed to process article: " . $e->getMessage());
        }
    }
}
