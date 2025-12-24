<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/init', function () {
    try {
        Artisan::call('migrate --force');
        $output = Artisan::output();
        
        Artisan::call('scrape:blogs');
        $output .= "\n" . Artisan::output();
        
        return "<pre>Setup Complete!\n\n$output</pre>";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});
