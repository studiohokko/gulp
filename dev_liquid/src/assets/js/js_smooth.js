// -----------------------------------------------------------
//  スムーススクロール
//  オフセットは .l-header の実測高さを優先（scroll-padding-top はフォールバック）
//  （別ページからの #id 遷移と同じ位置に止めるため、CSS の scroll-padding-top も同期）
//
//  ⚠️ 【必須】CSS（SCSS）に以下の設定が必要
//  設定がないと、JS 無効時や .l-header 未設置時にオフセットが 0 になる
//
// html {
// 	scroll-padding-top: rem($sp-header-height-scrolled); // または rm()
//
// 	@include mq(md) { // または mq(pc) — 案件の BP に合わせる
// 		scroll-padding-top: rem($pc-header-height-scrolled);
// 	}
// }
//
//  ※ scroll-behavior: smooth は書かないこと
//    （jQuery の animate とぶつかってスクロールがもたつく）
//  ※ Safari（特に fluid rem）は getComputedStyle(scroll-padding-top) が
//    実ヘッダー高さとズレることがあるため、JS は .l-header を実測する
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

	// ヘッダー実高さをオフセットに使う
	// ※ Safari は fluid rem 下で scroll-padding-top の used 値を誤って返すことがある
	const getOffset = () => {
		const header = document.querySelector('.l-header');
		if (header) {
			const height = header.getBoundingClientRect().height;
			if (height > 0) return height;
		}
		const value = getComputedStyle(document.documentElement).scrollPaddingTop;
		return parseFloat(value) || 0;
	};

	// ネイティブアンカー用にも実高さへ同期（Safari の rem 解決ズレ対策）
	const syncScrollPadding = () => {
		const header = document.querySelector('.l-header');
		if (!header) return;
		const height = header.getBoundingClientRect().height;
		if (height > 0) {
			document.documentElement.style.scrollPaddingTop = `${height}px`;
		}
	};
	syncScrollPadding();
	window.addEventListener('resize', syncScrollPadding);

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

	// 画面上の実位置でヘッダー直下へ合わせる
	// ※ iPad Safari は focus({preventScroll:true}) を無視して追加スクロールすることがある
	const snapToHeader = ($target) => {
		const el = $target[0];
		const header = document.querySelector('.l-header');
		if (!el || el === document.documentElement || !header) return;

		const gap = el.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
		if (Math.abs(gap) > 2) {
			window.scrollBy(0, gap);
		}
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
			snapToHeader($target);
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

				snapToHeader($target);
				moveFocus($target);
				snapToHeader($target);
				requestAnimationFrame(() => snapToHeader($target));
			});
	});
}
