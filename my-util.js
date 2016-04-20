"use strict";

class Util {
  /**
   * valueが null, undefined, 空文字列, 空配列の場合は true
   * それ以外の場合は false とする。
   * @param {any} 検査値
   * @return {boolean}
   */
  static isNullOrEmpty(value) {
    switch (typeof value) {
      case "object":
        if (value === null) {
          return true;
        }

        // 空配列？
        if (value instanceof Array) {
          if (value.length === 0) {
            return true;
          }
        }

        // 空オブジェクト？
        if (value instanceof Object) {
          try {
            var keys = Object.keys(value);
            if (keys.length === 0) {
              return true;
            }
          } catch (e) {
            // IE8以前では空オブジェクトも true
          }
        }
        break;
      case "string":
        if (value.length === 0) {
          return true;
        }
        break;
      case "number":
        return false;
      case "boolean":
        return false;
      case "function":
        return false;
      case "undefined":
        return true;
    }

    return false;
  }
  
  /**
   * 左trim
   * @param {string} value - 元文字列
   * @returns {string} 左trimした文字列
   */
  static leftTrim(value) {
    if (typeof value != "string") {
      return value;
    }
    return value.replace(/^\s+/, "");
  }

  /**
   * 右trim
   * @param {string} value - 元文字列
   * @returns {string} 右trimした文字列
   */
  static rightTrim(value) {
    if (typeof value != "string") {
      return value;
    }
    return value.replace(/\s+$/, "");
  }
  
  /**
   * trim
   * @param {string} value - 元文字列
   * @returns {string} 左右の空白を除去した文字列
   */
  static trim(value) {
    if (typeof value != "string") {
      return value;
    }
    return value.replace(/^\s+|\s+$/, "");
  }
}

module.exports = Util;