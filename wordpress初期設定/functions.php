<?php
// -----------------------------------------------------------
//  アセットのバージョン取得（ファイル未生成時の警告を防ぐ）
// -----------------------------------------------------------
function my_asset_version($path)
{
   $file = get_theme_file_path($path);
   return file_exists($file) ? filemtime($file) : wp_get_theme()->get('Version');
}


// -----------------------------------------------------------
//  WordPressの標準機能を拡張する
// -----------------------------------------------------------
function my_setup()
{
   // 固定ページに抜粋文を追加
   add_post_type_support('page', 'excerpt');
   // RSSフィードのURLの生成機能を追加
   add_theme_support('automatic-feed-links');
   // WordPressで出力される際のタグがHTML5形式になる
   add_theme_support('html5', array('comment-list', 'comment-form', 'search-form', 'gallery', 'caption', 'style', 'script'));
   // titleタグをWordPressに任せる
   add_theme_support('title-tag');
   // アイキャッチ画像の有効化
   add_theme_support('post-thumbnails');
}
add_action('after_setup_theme', 'my_setup');


// -----------------------------------------------------------
//  CSS・JavaScript読み込み
// -----------------------------------------------------------
function my_script_init()
{
   // △▽△▽△▽△▽ CSS
   // Fonts（_variables.scss の $ff 系と同じ family を読み込む。$ff-en は Google / Adobe どちらでも可）
   wp_enqueue_style('google-fonts', '//fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap', array(), null, 'all');
   // Swiper（CDN）
   wp_enqueue_style('swiper', '//cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css', array(), '12.2.0', 'all');
   // メインスタイルシート（GULP の dev_liquid をテーマ内 dev/ としてコピーしたパス）
   wp_enqueue_style('main-style', get_theme_file_uri('/dev/public/assets/css/style.css'), array(), my_asset_version('/dev/public/assets/css/style.css'), 'all');

   // △▽△▽△▽△▽ JavaScript
   // Swiper（CDN）
   wp_enqueue_script('swiper', '//cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js', array(), '12.2.0', true);
   // GSAP Core
   wp_enqueue_script('gsap-core', '//cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js', array(), '3.15.0', true);
   // GSAP ScrollToPlugin
   wp_enqueue_script('gsap-scrollto', '//cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollToPlugin.min.js', array('gsap-core'), '3.15.0', true);
   // GSAP ScrollTrigger
   wp_enqueue_script('gsap-scrolltrigger', '//cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollTrigger.min.js', array('gsap-core'), '3.15.0', true);
   // メインスクリプト
   wp_enqueue_script('main-script', get_theme_file_uri('/dev/public/assets/js/bundle.js'), array('jquery', 'swiper', 'gsap-core', 'gsap-scrollto', 'gsap-scrolltrigger'), my_asset_version('/dev/public/assets/js/bundle.js'), true);
}
add_action('wp_enqueue_scripts', 'my_script_init');


// -----------------------------------------------------------
// defer属性を追加（JavaScriptのみ）
// -----------------------------------------------------------
function add_defer_attribute(string $tag, string $handle): string
{
   $defer_scripts = array('swiper', 'gsap-core', 'gsap-scrollto', 'gsap-scrolltrigger', 'main-script');
   if (in_array($handle, $defer_scripts, true)) {
      return str_replace('<script ', '<script defer ', $tag);
   }
   return $tag;
}
add_filter('script_loader_tag', 'add_defer_attribute', 10, 2);


// -----------------------------------------------------------
//  Contact Form 7の自動pタグ生成無効
// -----------------------------------------------------------
add_filter('wpcf7_autop_or_not', 'wpcf7_autop_return_false');
function wpcf7_autop_return_false()
{
   return false;
}


// -----------------------------------------------------------
//  スラッグの日本語禁止
// -----------------------------------------------------------
function auto_post_slug($slug, $post_ID, $post_status, $post_type)
{
   if (preg_match('/(%[0-9a-f]{2})+/', $slug)) {
      $slug = utf8_uri_encode($post_type) . '-' . $post_ID;
   }
   return $slug;
}
add_filter('wp_unique_post_slug', 'auto_post_slug', 10, 4);


// -----------------------------------------------------------
//  デフォルトの投稿タイプの管理画面上の名前を変更する
// -----------------------------------------------------------
function change_post_label($args, $post_type)
{
   if ('post' === $post_type) {
      $args['label'] = 'お知らせ';
   }
   return $args;
}
add_filter('register_post_type_args', 'change_post_label', 10, 2);


// -----------------------------------------------------------
//  jpg画像の品質を100%でアップロードする
// -----------------------------------------------------------
function img_uncompressed()
{
   return 100;
}
add_filter('jpeg_quality', 'img_uncompressed');
