// #todo


interface ObjectConstructor {

    /**
     * 获取对象指定键列表的子集。
     * @param obj 要处理的对象。
     * @param keys 要获取的键列表。
     * @returns 返回新对象。
     * @example Object.subset({a: 1, b: 2}, ['a']) // {a: 1}
     */
    subset(obj: any, keys: string[]): { [key: string]: any };

}

/**
 * 获取对象指定键列表的子集。
 * @param obj 要处理的对象。
 * @param keys 要获取的键列表。
 * @returns 返回新对象。
 * @example Object.subset({a: 1, b: 2}, ['a']) // {a: 1}
 */
Object.subset = function (obj: any, keys: string[]) {
    let result = {};
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] in obj) {
            result[keys[i]] = obj[keys[i]];
        }
    }
    return result;
}