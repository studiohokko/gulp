// -----------------------------------------------------------
//  u-pointerNone：CSSのpointer-eventsとTabフォーカスを同期
//  （$responsiveBase / ブレークポイント変更にもCSS経由で追従）
// -----------------------------------------------------------
const SELECTORS = '.u-pointerNone, .u-pointerNone__sp, .u-pointerNone__pc';

export function js_pointerNone() {
	const elements = document.querySelectorAll(SELECTORS);
	if (!elements.length) return;

	const sync = () => {
		elements.forEach((el) => {
			const { pointerEvents } = getComputedStyle(el);
			if (pointerEvents === 'none') {
				el.setAttribute('tabindex', '-1');
			} else {
				el.removeAttribute('tabindex');
			}
		});
	};

	sync();

	let resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(sync, 200);
	});
}
