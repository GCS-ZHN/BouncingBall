//import toolFc = require("./toolFunction");完整导入
import { randomColor } from "./toolFunction.js";
import { Circle } from "./Shape.js";
/**
 * 实现多个形状运动的类。
 */
export class Game {
    /**
     * 构造方法
     * @param initCount 构造的形状个数
     * @param ctx 绘图画布
     * @param mSize 形状的尺寸均值
     * @param sizeSD 形状的尺寸标准差
     * @param horizenSpeedMax 形状的最大水平移动速率
     * @param verticalSpeedMax 形状的最大垂直移动速率
     * @param recover 碰撞恢复系数
     * @param floatRate 可移动形状的比例，0~1
     * @param merged 是否碰撞合并
     */
    constructor(initCount, ctx, mSize, sizeSD, horizenSpeedMax, verticalSpeedMax, recover, floatRate, merged) {
        /**碰撞是否合并 */
        this.merged = false;
        this.circleArray = [];
        this.ctx = ctx;
        this.merged = merged;
        if (floatRate > 1 || floatRate < 0)
            floatRate = 1;
        this.recover = recover;
        for (var i = 0; i < initCount; i++) {
            this.circleArray.push(new Circle(Math.random() * ctx.canvas.width, Math.random() * ctx.canvas.height, (Math.random() - 0.5) * horizenSpeedMax * 2, (Math.random() - 0.5) * verticalSpeedMax * 2, mSize + (Math.random() - 0.5) * sizeSD * 2, randomColor(), this.recover, Math.random() > floatRate, ctx));
        }
    }
    /**
     * 按时间戳更新画布
     * @param now 指定时间戳
     */
    update(now) {
        for (var i = 0; i < this.circleArray.length; i++) {
            this.circleArray[i].update(now);
        }
        for (var i = 0; i < this.circleArray.length - 1; i++) {
            for (var j = i + 1; j < this.circleArray.length; j++) {
                !this.circleArray[i].collision(this.circleArray[j], this.merged);
            }
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var i = 0; i < this.circleArray.length; i++) {
            this.circleArray[i].draw();
        }
    }
}
