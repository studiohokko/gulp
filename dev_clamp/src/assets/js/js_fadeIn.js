// -----------------------------------------------------------
//  フェードイン
// -----------------------------------------------------------
export function js_fadeIn() {
	// 動きのきっかけの起点となるアニメーションの名前を定義
	function fadeAnime() {
		jQuery('.fadeUpTrigger').each(function () {
			//fadeUpTriggerというクラス名が
			var elemPos = jQuery(this).offset().top - 50; //要素より、50px上の
			var scroll = jQuery(window).scrollTop();
			var windowHeight = jQuery(window).height();
			if (scroll >= elemPos - windowHeight) {
				jQuery(this).addClass('fadeUp'); // 画面内に入ったらfadeUpというクラス名を追記
			} else {
				jQuery(this).removeClass('fadeUp'); // 画面外に出たらfadeUpというクラス名を外す
			}
		});
	}
	// 画面をスクロールをしたら動かしたい場合の記述
	jQuery(window).scroll(function () {
		fadeAnime(); /* アニメーション用の関数を呼ぶ*/
	}); // ここまで画面をスクロールをしたら動かしたい場合の記述

	function fadeAnime2() {
		jQuery('.fadeUpTrigger2').each(function () {
			//fadeUpTriggerというクラス名が
			var elemPos = jQuery(this).offset().top - 50; //要素より、50px上の
			var scroll = jQuery(window).scrollTop();
			var windowHeight = jQuery(window).height();
			if (scroll >= elemPos - windowHeight) {
				jQuery(this).addClass('fadeUp'); // 画面内に入ったらfadeUpというクラス名を追記
			} else {
				jQuery(this).removeClass('fadeUp'); // 画面外に出たらfadeUpというクラス名を外す
			}
		});
	}

	// ページが読み込まれたらすぐに動かしたい場合の記述
	jQuery(window).on('load', function () {
		fadeAnime2(); /* アニメーション用の関数を呼ぶ*/
	}); // ここまでページが読み込まれたらすぐに動かしたい場合の記述
}
