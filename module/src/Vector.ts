/**
 * 向量类，处理向量（矢量）运算
 */
 export class Vector {
    /**向量数组 */
    public vArray:Array<number>;
    /**
     * 构造方法
     * @param vArray 向量的数组
     */
    constructor(vArray:Array<number>) {
        this.vArray = vArray.slice(0);//切片实现浅拷贝
    }
    /**
     * 向量之间的加法
     * @param other 相同维度的向量
     */
    public add(other: Vector):Vector {
        if (this.vArray.length != other.vArray.length) throw "vector dimension should be equal.";
        let vArray = this.vArray.slice(0);
        for (var i = 0; i < vArray.length; i++) {
            vArray[i] += other.vArray[i];
        }
        return new Vector(vArray);
    }
    /**
     * 向量之间的减法
     * @param other 相同维度的向量
     */
    public substract(other: Vector):Vector {
        if (this.vArray.length != other.vArray.length) throw "vector dimension should be equal.";
        let vArray = this.vArray.slice(0);
        for (var i = 0; i < vArray.length; i++) {
            vArray[i] -= other.vArray[i];
        }
        return new Vector(vArray); 
    }
    /**
     * 向量的数量积（点乘）
     * @param other 相同维度的向量
     */
    public dotMultiply(other: Vector):number {
        if (this.vArray.length != other.vArray.length) throw "vector dimension should be equal.";
        let v:number = 0;
        for (var i = 0; i < this.vArray.length; i++) {
            v += this.vArray[i]*other.vArray[i];
        }
        return v;
    }
    /**
     * 获取向量的模
     */
    public getMod():number {
        let v:number = 0;
        this.vArray.forEach(
            (val)=>{
                v += val*val
            }
        );
        return Math.sqrt(v);
    }
    /**
     * 获取单位向量
     */
    public normalized():Vector {
        let vArray = this.vArray.slice(0);
        let mod = this.getMod();
        for (var i = 0; i < vArray.length; i++) {
            vArray[i] /= mod;
        }
        return new Vector(vArray);
    }
    /**
     * 向量的线性放缩
     * @param param 放缩倍数
     */
    public zoom(param:number):Vector {
        let vArray = this.vArray.slice(0);
        for (var i = 0; i < vArray.length; i++) {
            vArray[i] = this.vArray[i] * param;
        }
        return new Vector(vArray);
    }
    /**
     * 预览向量
     */
    public view():void {
        console.log(this.vArray);
    }
}