import {Vector} from "./Vector.js"
/**
 * 形状接口，提供了形状这个抽象概念，并提供了通用抽象方法，
 * 注意js变量本身不带类型，故ts的抽象方法类型对实际运行无影响
 * 如下文可以将函数用Circle类型参数替换
 */
 export interface Shape {
    /**
     * 绘制图形 
     */
    draw():void;
    /**
     * 更新形状运动属性
     * @param now 时间戳
     */
    update(now:number):void;
    /**
     * 形状碰撞处理
     * @param other 其他形状对象 
     * @param merged 是否碰撞后融合
     */
    collision(other:Shape, merged:boolean):boolean;
    /**
     * 获取形状间万有引力
     * @param other 其他形状
     */
    getGravity(other:Shape):Vector;
    /**
     * 获取形状的质量
     */
    getMass():number;
    /**
     * 设置形状的加速度
     * @param a 新的加速度
     */
    setAcceleration(a:Vector):void;
    /**
     * 获取形状的加速度
     */
    getAcceleration():Vector;
}

/**
 * 圆形类，实现了Shape接口
 */
 export class Circle implements Shape {
    /**相对画布的坐标向量 */
    private location:Vector; 
    /**速度向量 */
    private speed:Vector = new Vector([0,0]);
    /**半径 */
    private r:number;
    /**填充颜色 */
    private color:string;
    /**画布对象 */
    private ctx:CanvasRenderingContext2D;
    /**上一次更新坐标的时间戳 */
    private startTime:number = 0; 
    /**碰撞恢复系数 */
    private recover:number;
    /**是否固定不动 */
    private fixed:boolean;
    /**是否销毁对象 */
    private destroyed:boolean = false;
    /**小球加速度 */
    public a:Vector = new Vector([0,980]);
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
    constructor(x:number, y:number, vx:number, vy:number,r:number,color:string, recover:number,fixed:boolean,ctx:CanvasRenderingContext2D) {
        this.fixed = fixed;
        if (!fixed) {
            this.speed = new Vector([vx, vy]);
        } else {
            this.a = new Vector([0,0]);
        }
        this.location = new Vector([x, y]);
        this.r = r;
        this.color = color;
        if (recover < 0 || recover > 1) recover = 1;
        this.recover = recover;
        this.ctx = ctx;
    }
    /**
     * 绘制当前形状，注意该操作并不会清除画布。
     */
    public draw():void {
        if (this.destroyed) return;
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.location.vArray[0], this.location.vArray[1], this.r, 0, 2 *Math.PI);
        this.ctx.fill();
    }
    /**
     * 根据时间更新当前形状的坐标，此举不会重绘形状。
     * @param now 毫秒时间戳
     */
    public update(now:number):void {
        if (this.destroyed) return;
        if (!this.startTime) {//初始化时间
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
        } else if (this.location.vArray[0] < this.r) {
            this.speed.vArray[0] = -this.speed.vArray[0] * this.recover;
            this.location.vArray[0] = this.r;
        }
        if (this.location.vArray[1] + this.r > this.ctx.canvas.height) {
            this.speed.vArray[1] = -this.speed.vArray[1] * this.recover;
            this.location.vArray[1] = this.ctx.canvas.height - this.r;
        } else if (this.location.vArray[1] < this.r) {
            this.speed.vArray[1] = -this.speed.vArray[1] * this.recover;
            this.location.vArray[1] = this.r;
        }
    }
    /**
     * 计算当前对象与指定圆形对象的圆心距离平方与半径和的平方之比。
     * @param other 待比较的圆形对象
     */
    public distanceRate(other:Circle):number {
        if (this.destroyed) return Number.MAX_VALUE;
        let disVector = this.location.substract(other.location);
        return disVector.getMod() / (this.r+other.r);
    }
    /**
     * 判断并处理两个圆形是否发生碰撞
     * @param other 待比较的圆形对象
     * @param merged 碰撞后是否融合，大球吞小球
     */
    public collision(other:Circle, merged:boolean = false):boolean {
        if (this.destroyed||other.destroyed) return false;
        let rate = this.distanceRate(other);
        if (rate >= 1 ) return false;
        //根据动量守恒与动能守恒，计算碰撞前后速度变化，这是碰撞前速度，并用r*r代替质量
        let m1 = this.getMass();
        let m2 = other.getMass();
        let thisSpeedVector = this.speed;
        let othSpeedVector = other.speed;
        if (merged && !this.fixed && !other.fixed) {
            this.speed = thisSpeedVector.zoom(m1/(m1+m2)).add(othSpeedVector.zoom(m2/(m1+m2)));
            this.location = this.location.zoom(m1/(m1+m2)).add(other.location.zoom(m2/(m1+m2)));
            if (this.r < other.r) this.color = other.color;
            this.r = Math.sqrt((m1+m2)/Math.PI);
            other.destroyed = true;
            return true;
        }

        //等效于另外一个的质量无穷大
        if (other.fixed) m1 = 0;
        if (this.fixed) m2 = 0;
        
        let radialUnitVector = other.location.substract(this.location).normalized();
       //径向分量的模
        let radialThis = thisSpeedVector.dotMultiply(radialUnitVector);
        let radialOth = othSpeedVector.dotMultiply(radialUnitVector);

        //垂直径向分量
        let verticalThisVector = thisSpeedVector.substract(radialUnitVector.zoom(radialThis));
        let verticalOthVector = othSpeedVector.substract(radialUnitVector.zoom(radialOth));

        //更新径向分量，基于对心碰撞公式
        let newRadialThisVector = radialUnitVector.zoom((radialThis*(m1-m2*this.recover)+(1+this.recover)*m2*radialOth)/(m1+m2));
        let newRadialOthVector = radialUnitVector.zoom((radialOth*(m2-m1*this.recover)+(1+this.recover)*m1*radialThis)/(m1+m2));

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
            let param = (1/rate-1);
            let dm:Vector = this.location.zoom(param/2).substract(other.location.zoom(param/2));
            if (this.fixed) {
                other.location = other.location.substract(dm.zoom(2));
            } else {
                this.location = this.location.add(dm);
            }
            if (other.fixed) {
               this.location = this.location.add(dm.zoom(2));
            } else {
                other.location = other.location.substract(dm);
            }
        } 
        return true;
    }
    /**
     * 返回小球的质量
     */
    public getMass():number {
        return Math.PI*this.r*this.r;
    }
    /**
     * 计算小球对其他小球产生的万有引力
     * @param other 其他小球
     */
    public getGravity(other:Circle):Vector {
        if (this.destroyed||other.destroyed) return new Vector([]);
        let radialVector:Vector = this.location.substract(other.location);
        let distance:number = radialVector.getMod();
        const gravityConst = 100;
        return radialVector.zoom(gravityConst*this.getMass()*other.getMass()/(distance*distance*distance));
    }
    /**
     * 设置小球的加速度
     * @param a 新的加速度
     */
    public setAcceleration(a:Vector):void {
        this.a = a;
    }
    /**
     * 获取小球的加速度
     */
    public getAcceleration():Vector {
        return this.a;
    }
}