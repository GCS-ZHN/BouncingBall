/**
 * 将十进制数值转化为两位的十六进制字符串，仅限0~255
 * @param int 十进制数值
 */
export function format(int) {
    if (int < 0 || int > 255)
        int = 255;
    const s = int.toString(16);
    if (s.length < 2) {
        return "0" + s;
    }
    return s;
}
/**
 * 随机返回一个十六进制颜色字符串
 */
export function randomColor() {
    return "#" +
        format(Math.floor(Math.random() * 256)) +
        format(Math.floor(Math.random() * 256)) +
        format(Math.floor(Math.random() * 256));
}
