import { Vector } from "./Vector.js";
/**
 * 圆形类，实现了Shape接口
 */
export class Circle {
    /**
     * 构造方法，构建圆形对象
     * @param x 相对画布圆心横坐标
     * @param y 相对画布圆心纵坐标
     * @param vx 横向速度
     * @param vy 纵向速度
     * @param r 半径
     * @param color 填充颜色
     * @param recover 碰撞的恢复系数，0~1，考虑能量消耗，动能不守恒
     * @param fixed 是否固定不动，若是，速率参数将无效
     * @param ctx 画布对象
     */
    constructor(x, y, vx, vy, r, color, recover, fixed, ctx) {
        /**速度向量 */
        this.speed = new Vector([0, 0]);
        /**上一次更新坐标的时间戳 */
        this.startTime = 0;
        /**是否销毁对象 */
        this.destroyed = false;
        /**小球加速度 */
        this.a = new Vector([0, 980]);
        this.fixed = fixed;
        if (!fixed) {
            this.speed = new Vector([vx, vy]);
        }
        else {
            this.a = new Vector([0, 0]);
        }
        this.location = new Vector([x, y]);
        this.r = r;
        this.color = color;
        if (recover < 0 || recover > 1)
            recover = 1;
        this.recover = recover;
        this.ctx = ctx;
    }
    /**
     * 绘制当前形状，注意该操作并不会清除画布。
     */
    draw() {
        if (this.destroyed)
            return;
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.location.vArray[0], this.location.vArray[1], this.r, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    /**
     * 根据时间更新当前形状的坐标，此举不会重绘形状。
     * @param now 毫秒时间戳
     */
    update(now) {
        if (this.destroyed)
            return;
        if (!this.startTime) { //初始化时间
            this.startTime = now;
        }
        let seconds = (now - this.startTime) / 1000;
        this.startTime = now;
        this.location = this.location.add(this.speed.zoom(seconds));
        this.speed = this.speed.add(this.a.zoom(seconds));
        //对撞墙进行考虑，相当于与地球碰撞，对对心碰撞公式取极限
        if (this.location.vArray[0] + this.r > this.ctx.canvas.width) {
            this.speed.vArray[0] = -this.speed.vArray[0] * this.recover;
            this.location.vArray[0] = this.ctx.canvas.width - this.r;
        }
        else if (this.location.vArray[0] < this.r) {
            this.speed.vArray[0] = -this.speed.vArray[0] * this.recover;
            this.location.vArray[0] = this.r;
        }
        if (this.location.vArray[1] + this.r > this.ctx.canvas.height) {
            this.speed.vArray[1] = -this.speed.vArray[1] * this.recover;
            this.location.vArray[1] = this.ctx.canvas.height - this.r;
        }
        else if (this.location.vArray[1] < this.r) {
            this.speed.vArray[1] = -this.speed.vArray[1] * this.recover;
            this.location.vArray[1] = this.r;
        }
    }
    /**
     * 计算当前对象与指定圆形对象的圆心距离平方与半径和的平方之比。
     * @param other 待比较的圆形对象
     */
    distanceRate(other) {
        if (this.destroyed)
            return Number.MAX_VALUE;
        let disVector = this.location.substract(other.location);
        return disVector.getMod() / (this.r + other.r);
    }
    /**
     * 判断并处理两个圆形是否发生碰撞
     * @param other 待比较的圆形对象
     * @param merged 碰撞后是否融合，大球吞小球
     */
    collision(other, merged = false) {
        if (this.destroyed || other.destroyed)
            return false;
        let rate = this.distanceRate(other);
        if (rate >= 1)
            return false;
        //根据动量守恒与动能守恒，计算碰撞前后速度变化，这是碰撞前速度，并用r*r代替质量
        let m1 = this.getMass();
        let m2 = other.getMass();
        let thisSpeedVector = this.speed;
        let othSpeedVector = other.speed;
        if (merged && !this.fixed && !other.fixed) {
            this.speed = thisSpeedVector.zoom(m1 / (m1 + m2)).add(othSpeedVector.zoom(m2 / (m1 + m2)));
            this.location = this.location.zoom(m1 / (m1 + m2)).add(other.location.zoom(m2 / (m1 + m2)));
            if (this.r < other.r)
                this.color = other.color;
            this.r = Math.sqrt((m1 + m2) / Math.PI);
            other.destroyed = true;
            return true;
        }
        //等效于另外一个的质量无穷大
        if (other.fixed)
            m1 = 0;
        if (this.fixed)
            m2 = 0;
        let radialUnitVector = other.location.substract(this.location).normalized();
        //径向分量的模
        let radialThis = thisSpeedVector.dotMultiply(radialUnitVector);
        let radialOth = othSpeedVector.dotMultiply(radialUnitVector);
        //垂直径向分量
        let verticalThisVector = thisSpeedVector.substract(radialUnitVector.zoom(radialThis));
        let verticalOthVector = othSpeedVector.substract(radialUnitVector.zoom(radialOth));
        //更新径向分量，基于对心碰撞公式
        let newRadialThisVector = radialUnitVector.zoom((radialThis * (m1 - m2 * this.recover) + (1 + this.recover) * m2 * radialOth) / (m1 + m2));
        let newRadialOthVector = radialUnitVector.zoom((radialOth * (m2 - m1 * this.recover) + (1 + this.recover) * m1 * radialThis) / (m1 + m2));
        //合并分量，更新速度
        let newThisVector = verticalThisVector.add(newRadialThisVector);
        let newOthVector = verticalOthVector.add(newRadialOthVector);
        if (!this.fixed) {
            this.speed = newThisVector;
        }
        if (!other.fixed) {
            other.speed = newOthVector;
        }
        //对交叠情况进行处理
        if (rate < 1) {
            let param = (1 / rate - 1);
            let dm = this.location.zoom(param / 2).substract(other.location.zoom(param / 2));
            if (this.fixed) {
                other.location = other.location.substract(dm.zoom(2));
            }
            else {
                this.location = this.location.add(dm);
            }
            if (other.fixed) {
                this.location = this.location.add(dm.zoom(2));
            }
            else {
                other.location = other.location.substract(dm);
            }
        }
        return true;
    }
    /**
     * 返回小球的质量
     */
    getMass() {
        return Math.PI * this.r * this.r;
    }
    /**
     * 计算小球对其他小球产生的万有引力
     * @param other 其他小球
     */
    getGravity(other) {
        if (this.destroyed || other.destroyed)
            return new Vector([]);
        let radialVector = this.location.substract(other.location);
        let distance = radialVector.getMod();
        const gravityConst = 100;
        return radialVector.zoom(gravityConst * this.getMass() * other.getMass() / (distance * distance * distance));
    }
    /**
     * 设置小球的加速度
     * @param a 新的加速度
     */
    setAcceleration(a) {
        this.a = a;
    }
    /**
     * 获取小球的加速度
     */
    getAcceleration() {
        return this.a;
    }
}
