/*
 * @Author: OBKoro1
 * @Github: https://github.com/OBKoro1
 * @Date: 2018-11-08 12:58:51
 * LastEditors  : OBKoro1
 * LastEditTime : 2020-02-05 12:37:07
 * @Description: 不同语言的逻辑
 */
const languageDifferent = require('./languageDifferent');
const constFile = require('../utile/CONST');
const util = require('../utile/util');

// 头部注释中间部分生成
const middleTpl = (data, fileEnd, config) => {
  let str = '';
  Object.keys(data).forEach(key => {
    const obj = {
      fileEnd,
      type: 'topMiddle',
      key,
      value: newlineAddAnnotationFn(data[key], fileEnd, config)
    };
    const res = new languageDifferent.tplJudge(obj).res;
    str = str + res;
  });
  return str;
};

/**
 * @description: 文件头部注释生成
 * @param {Object} data 模板数据对象
 * @param {String} fileEnd 文件采用语言
 * @return: 字符串
 */
const headNotes = (data, fileEnd, config) => {
  let str = middleTpl(data, fileEnd, config);
  // 头部 中间模板 尾部合并
  const obj = {
    fileEnd,
    type: 'topHeadEnd',
    str
  };
  return new languageDifferent.tplJudge(obj).res;
};

class functionTplStr {
  /**
   * @description: 函数注释模板生成
   * @param {Object} data 模板数据对象
   * @param {String} fileEnd 文件采用语言
   * @param {Number} lineSpace 每行前面的长度
   * @param {String} nextLine 当前行为空 不换行
   * @param {String} frontStr 函数注释第一行的长度
   * @return: 函数注释的模板字符串
   */
  constructor(data, fileEnd, lineSpace, nextLine, frontStr) {
    this.fileEnd = fileEnd;
    this.nextLine = nextLine;
    this.frontStr = frontStr;
    this.str = ''.padStart(lineSpace); // 生成指定长度的字符串
    this.strContent = '';
    this.data = data;
  }
  // 生成函数注释模板
  generate() {
    // 生成中间模板
    Object.keys(this.data).forEach(key => {
      this.strContent += this.paramStr(key);
    });
    this.tpl = this.mergeStr();
    return this.replaceSymbolStr(this.tpl);
  }

  /**
   * @param {String} key 数据对象的key
   */
  paramStr(key) {
    const obj = {
      fileEnd: this.fileEnd,
      str: this.str,
      key,
      value: this.data[key]
    };
    // 注释是参数的话 多加一个参数的属性
    if (key === 'param') {
      obj.type = 'fnMiddle_param';
      obj.typeVal = '{type}';
    } else {
      obj.type = 'fnMiddle_key';
    }
    return new languageDifferent.tplJudge(obj).res;
  }
  mergeStr() {
    const obj = {
      fileEnd: this.fileEnd,
      frontStr: this.frontStr,
      strContent: this.strContent,
      str: this.str
    };
    if (this.nextLine === undefined) {
      // 当前行不为空
      obj.type = 'topHeadEnd_nextLineNo';
    } else {
      // 当前行为空
      obj.type = 'topHeadEnd_nextLineYes';
    }
    return new languageDifferent.tplJudge(obj).res;
  }
  // 切割特殊字符串生成空行
  replaceSymbolStr(tpl) {
    let sinceOut = tpl.indexOf('symbol_custom_string_obkoro1');
    if (sinceOut !== -1) {
      const colon = util.getColon(this.fileEnd);
      tpl = tpl.replace(`symbol_custom_string_obkoro1${colon}`, '');
    }
    return tpl;
  }
}

/**
 * @description: 保存触发修改时的需要的字符输出
 * @param {String} fileEnd 文件语言
 */
class changeFont {
  constructor(fileEnd) {
    this.fileEnd = fileEnd;
  }
  // 输出注释开头：用以判断是否进入注释
  star() {
    const obj = {
      fileEnd: this.fileEnd,
      type: 'annotationStarts'
    };
    return new languageDifferent.tplJudge(obj).res;
  }
  // 最后编辑人
  LastEditorsStr(LastEditors) {
    const obj = {
      fileEnd: this.fileEnd,
      type: 'LastEditorsStr',
      LastEditors
    };
    return new languageDifferent.tplJudge(obj).res;
  }
  // 最后编辑时间
  lastTimeStr() {
    const obj = {
      fileEnd: this.fileEnd,
      type: 'lastTimeStr'
    };
    return new languageDifferent.tplJudge(obj).res;
  }
}

// 换行符加注释符号
function newlineAddAnnotationFn(value, fileEnd, config) {
  if (config.configObj.switch.newlineAddAnnotation) {
    let middle = null;
    // 匹配用户定义语言符号
    if (fileEnd.userLanguage) {
      middle = config.configObj.language[fileEnd.fileEnd].middle;
    } else if (fileEnd !== '匹配不到_默认注释') {
      // 匹配插件的符号
      middle = constFile.middleAnnotation[fileEnd];
    } else if (config.configObj.annotationStr.use) {
      // 调用用户设置的默认注释符号
      middle = config.configObj.language.middle;
    } else {
      // 插件默认设置
      middle = constFile.middleAnnotation.javascript;
    }
    if (middle !== null) {
      // \n 换行
      // \r 回车
      // \r\n Windows系统里面，每行结尾是“<回车><换行>”
      value = value.replace(/\r\n/g, `\obkoro1\obkoro1${middle}`); // 转化为特殊字符 不影响下面的替换
      value = value.replace(/\n/g, `\n${middle}`);
      value = value.replace(/\r/g, `\r${middle}`);
      value = value.replace(/\obkoro1\obkoro1/g, `\r\n`); // 转化回来
    }
  }
  return value;
}

module.exports = {
  headNotes,
  functionTplStr,
  changeFont,
  middleTpl
};
