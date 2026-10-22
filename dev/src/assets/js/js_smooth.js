// -----------------------------------------------------------
//  スムーススクロール
//  オフセットは CSS の scroll-padding-top を読み取る
//  （別ページからの #id 遷移と同じ位置に止めるため）
//
//  ⚠️ 【必須】CSS（SCSS）に以下の設定が必要
//  設定がないとオフセットが 0 になり、見出しがヘッダーに隠れる
//
// html {
// 	scroll-padding-top: rem($sp-header-height-scrolled);

// 	@include mq(md) {
// 		scroll-padding-top: rem($pc-header-height-scrolled);
// 	}
// }
//
//  ※ scroll-behavior: smooth は書かないこと
//    （jQuery の animate とぶつかってスクロールがもたつく）
//  ※ ヘッダー高さを変更するときは CSS 側だけ直せば OK（JS の修正は不要）
// -----------------------------------------------------------

export function js_smooth() {
	const $root = jQuery('html, body');
	const speed = 800;

	// スクロール先を取得
	const getTarget = (hash) => {
		if (hash === '#' || hash === '') {
			return jQuery('html');
		}

		try {
			const id = decodeURIComponent(hash.slice(1));
			const el = document.getElementById(id);
			return el ? jQuery(el) : null;
		} catch {
			return null;
		}
	};

	// CSS の scroll-padding-top を取得（ヘッダー分のオフセット）
	// ※ CSS 未設定だと "auto" → NaN → 0 になる
	const getOffset = () => {
		const value = getComputedStyle(document.documentElement).scrollPaddingTop;
		return parseFloat(value) || 0;
	};

	// スクロール位置を取得
	const getPosition = ($target) => {
		if ($target[0] === document.documentElement) return 0;
		return Math.max($target.offset().top - getOffset(), 0);
	};

	// 末尾スラッシュの有無を揃える（/company と /company/ を同じ扱いに）
	const normalizePath = (path) => path.replace(/\/+$/, '') || '/';

	// 同じページへのリンクかどうか
	const isSamePage = (link) => link.host === location.host && normalizePath(link.pathname) === normalizePath(location.pathname) && link.search === location.search;

	// キーボード操作用にフォーカスを移す
	const moveFocus = ($target) => {
		const el = $target[0];
		if (el === document.documentElement) return;

		if (!el.hasAttribute('tabindex')) {
			el.setAttribute('tabindex', '-1');
		}
		el.focus({ preventScroll: true });
	};

	// イベント委譲（#id も /company/#id も対象）
	jQuery(document).on('click', 'a[href*="#"]', function (e) {
		if (this.target && this.target !== '_self') return;
		if (!isSamePage(this)) return; // 別ページなら普通に遷移 → CSSが位置を調整

		const hash = this.hash;
		const $target = getTarget(hash);

		if (!$target) return;

		e.preventDefault();

		// URLにハッシュを反映
		if (history.pushState) {
			history.pushState(null, '', hash ? hash : location.pathname + location.search);
		}

		const position = getPosition($target);
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		$root.stop();

		if (prefersReducedMotion) {
			$root.scrollTop(position);
			moveFocus($target);
			return;
		}

		$root
			.animate({ scrollTop: position }, speed, 'swing')
			.promise()
			.done(function () {
				// 遅延読み込み画像などでズレたときの補正
				const corrected = getPosition($target);

				if (Math.abs(jQuery(window).scrollTop() - corrected) > 2) {
					$root.scrollTop(corrected);
				}

				moveFocus($target);
			});
	});
}
