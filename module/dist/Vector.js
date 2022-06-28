/**
 * 向量类，处理向量（矢量）运算
 */
export class Vector {
    /**
     * 构造方法
     * @param vArray 向量的数组
     */
    constructor(vArray) {
        this.vArray = vArray.slice(0); //切片实现浅拷贝
    }
    /**
     * 向量之间的加法
     * @param other 相同维度的向量
     */
    add(other) {
        if (this.vArray.length != other.vArray.length)
            throw "vector dimension should be equal.";
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
    substract(other) {
        if (this.vArray.length != other.vArray.length)
            throw "vector dimension should be equal.";
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
    dotMultiply(other) {
        if (this.vArray.length != other.vArray.length)
            throw "vector dimension should be equal.";
        let v = 0;
        for (var i = 0; i < this.vArray.length; i++) {
            v += this.vArray[i] * other.vArray[i];
        }
        return v;
    }
    /**
     * 获取向量的模
     */
    getMod() {
        let v = 0;
        this.vArray.forEach((val) => {
            v += val * val;
        });
        return Math.sqrt(v);
    }
    /**
     * 获取单位向量
     */
    normalized() {
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
    zoom(param) {
        let vArray = this.vArray.slice(0);
        for (var i = 0; i < vArray.length; i++) {
            vArray[i] = this.vArray[i] * param;
        }
        return new Vector(vArray);
    }
    /**
     * 预览向量
     */
    view() {
        console.log(this.vArray);
    }
}
