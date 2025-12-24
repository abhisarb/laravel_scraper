<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index()
    {

        return response()->json(Article::paginate(5));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'source_url' => 'required|url|unique:articles,source_url',
            'image_url' => 'nullable|url',
            'author' => 'nullable|string',
            'published_at' => 'nullable|date',
            'references' => 'nullable|array',
        ]);

        $article = Article::create($validated);

        return response()->json($article, 201);
    }

    public function show(string $id)
    {
        $article = Article::findOrFail($id);
        return response()->json($article);
    }

    public function update(Request $request, string $id)
    {
        $article = Article::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'source_url' => 'sometimes|required|url|unique:articles,source_url,' . $id,
            'image_url' => 'nullable|url',
            'author' => 'nullable|string',
            'published_at' => 'nullable|date',
            'references' => 'nullable|array',
        ]);

        $article->update($validated);

        return response()->json($article);
    }

    public function destroy(string $id)
    {
        $article = Article::findOrFail($id);
        $article->delete();

        return response()->json(null, 204);
    }
}
