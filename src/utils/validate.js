/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path);
}

/** 中国大陆手机号 */
export const MOBILE_REG = /^1[3-9]\d{9}$/;

/** 邮箱（通用格式，非 RFC 完整版） */
export const EMAIL_REG = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 18 位身份证号（末位可为 X） */
export const ID_CARD_REG =
  /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;

/** 6 位短信验证码 */
export const SMS_CODE_REG = /^\d{6}$/;

/** 中文姓名（2-20 位汉字，可含 ·） */
export const CHINESE_NAME_REG = /^[\u4e00-\u9fa5·]{2,20}$/;

function normalize(val) {
  return String(val ?? "").trim();
}

/**
 * @param {unknown} val
 * @returns {Boolean}
 */
export function isMobile(val) {
  return MOBILE_REG.test(normalize(val));
}

/**
 * @param {unknown} val
 * @returns {Boolean}
 */
export function isEmail(val) {
  return EMAIL_REG.test(normalize(val));
}

/**
 * @param {unknown} val
 * @returns {Boolean}
 */
export function isSmsCode(val) {
  return SMS_CODE_REG.test(normalize(val));
}

/**
 * @param {unknown} val
 * @returns {Boolean}
 */
export function isChineseName(val) {
  return CHINESE_NAME_REG.test(normalize(val));
}

/**
 * 18 位身份证校验（含校验码）
 * @param {unknown} val
 * @returns {Boolean}
 */
export function isIdCard(val) {
  const id = normalize(val);
  if (!ID_CARD_REG.test(id)) return false;

  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const codes = "10X98765432";
  const sum = id
    .slice(0, 17)
    .split("")
    .reduce((acc, ch, i) => acc + Number(ch) * weights[i], 0);

  return codes[sum % 11] === id[17].toUpperCase();
}

/**
 * 生成 Vant Field 必填规则
 * @param {string} [message]
 */
export function ruleRequired(message = "请填写此项") {
  return { required: true, message };
}

/**
 * 生成 Vant Field 自定义校验规则
 * @param {(val: unknown) => boolean} validator
 * @param {string} message
 */
export function ruleValidator(validator, message) {
  return { validator, message };
}

/** @param {string} [message] */
export function ruleMobile(message = "手机号格式不正确") {
  return ruleValidator(isMobile, message);
}

/** @param {string} [message] */
export function ruleEmail(message = "邮箱格式不正确") {
  return ruleValidator(isEmail, message);
}

/** @param {string} [message] */
export function ruleIdCard(message = "身份证号格式不正确") {
  return ruleValidator(isIdCard, message);
}

/** @param {string} [message] */
export function ruleSmsCode(message = "验证码为 6 位数字") {
  return ruleValidator(isSmsCode, message);
}

/** @param {string} [message] */
export function ruleChineseName(message = "请输入正确的中文姓名") {
  return ruleValidator(isChineseName, message);
}
