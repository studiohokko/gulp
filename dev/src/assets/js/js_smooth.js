// -----------------------------------------------------------
//  スムーススクロール
// -----------------------------------------------------------
export function js_smooth() {
	const header = jQuery('#header');

	jQuery('a[href^="#"]').on('click', function (e) {
		e.preventDefault();
		const gap = header.outerHeight();
		const speed = 800;
		const href = jQuery(this).attr('href');
		const target = jQuery(href == '#' || href == '' ? 'html' : href);
		const position = target.offset().top - gap;
		jQuery('html, body').animate({ scrollTop: position }, speed, 'swing', function () {
			const corrected = target.offset().top - gap;
			if (Math.abs(jQuery(window).scrollTop() - corrected) > 2) {
				jQuery('html, body').scrollTop(corrected);
			}
		});
		return false;
	});
}
