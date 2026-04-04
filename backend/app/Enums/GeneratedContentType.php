<?php

namespace App\Enums;

enum GeneratedContentType: string
{
    case ContentIdea = 'content_idea';
    case SocialPost = 'social_post';
    case AdCopy = 'ad_copy';
    case BlogIdea = 'blog_idea';
    case HomepageSuggestion = 'homepage_suggestion';
}
