<?php

namespace App\Enums;

enum PageType: string
{
    case Home = 'home';
    case About = 'about';
    case Products = 'products';
    case Collection = 'collection';
    case Contact = 'contact';
    case Other = 'other';
}
