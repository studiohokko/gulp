/**
 * px を rem に計算する関数（SCSS 同等）
 * 例：rm(16) → 1rem の計算値
 * @param {number} arg - px 値
 * @returns {number} rem 計算値（px で返す）
 */
export function rm(arg) {
	const htmlFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
	// (arg / 16) * htmlFontSize で px に変換
	return (arg / 16) * htmlFontSize;
}
