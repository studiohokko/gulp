<?php get_header(); ?>

<!-- header   ///////////////////////////////////////////////////// -->
<?php get_template_part('template-parts/header'); ?>

<main class="l-main">

	<section class="p-404">
		<div class="p-404__inner l-inner -narrow">
			<div class="p-404__content">
				<p class="p-404__title">404 Not Found</p>
				<h1 class="p-404__subTitle">ページが見つかりません</h1>
				<p class="p-404__text">
					お探しのページが見つかりませんでした。<br>
					一時的にアクセスできない状態にあるか、移動もしくは削除された可能性があります。<br>
					お手数ですがURLをご確認の上、上記メニューなどからお探しください。
				</p>
				<div class="p-404__button">
					<a href="<?php echo esc_url(home_url('/')); ?>" class="p-404__buttonLink">Topページへ戻る</a>
				</div>
				<!-- /.p-404__button -->
			</div>
			<!-- /.p-404__content -->
		</div>
		<!-- /.p-404__inner -->
	</section>
	<!-- /.p-404 -->

</main>

<!-- footer   ///////////////////////////////////////////////////// -->
<?php get_template_part('template-parts/footer'); ?>

<?php get_footer(); ?>
