<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Pending = 'pending';
    case Crawling = 'crawling';
    case Analyzing = 'analyzing';
    case Completed = 'completed';
    case Failed = 'failed';
}
