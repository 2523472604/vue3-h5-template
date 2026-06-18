/**
 * 时间格式化工具
 *
 * @example
 * getCurrentTime('年月日')        // 2026年03月18日
 * getCurrentTime('年月日时分')    // 2026年03月18日 14:30
 * getCurrentTime('date')         // 2026-03-18
 * getCurrentTime('YYYY/MM/DD')   // 自定义模板
 */

/** 预设格式映射 */
const FORMAT_PRESETS = {
  年月日: "YYYY年MM月DD日",
  年月日时分: "YYYY年MM月DD日 HH:mm",
  年月日时分秒: "YYYY年MM月DD日 HH:mm:ss",
  时分: "HH:mm",
  时分秒: "HH:mm:ss",
  date: "YYYY-MM-DD",
  datetime: "YYYY-MM-DD HH:mm",
  "datetime-second": "YYYY-MM-DD HH:mm:ss",
  time: "HH:mm"
};

function padZero(num) {
  return String(num).padStart(2, "0");
}

function toDate(input) {
  if (input instanceof Date) return input;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateParts(date) {
  return {
    YYYY: String(date.getFullYear()),
    MM: padZero(date.getMonth() + 1),
    DD: padZero(date.getDate()),
    HH: padZero(date.getHours()),
    mm: padZero(date.getMinutes()),
    ss: padZero(date.getSeconds())
  };
}

/**
 * 按模板格式化时间
 * 支持 token：YYYY MM DD HH mm ss
 *
 * @param {Date|string|number} date
 * @param {string} pattern 模板或预设名（如 年月日 / 年月日时分 / YYYY-MM-DD）
 * @returns {string}
 */
export function formatTime(date, pattern = "年月日") {
  const target = toDate(date);
  if (!target) return "";

  const resolvedPattern = FORMAT_PRESETS[pattern] || pattern;
  const parts = getDateParts(target);

  return resolvedPattern.replace(/YYYY|MM|DD|HH|mm|ss/g, token => parts[token]);
}

/**
 * 获取当前时间并按指定格式返回
 *
 * @param {string} format
 * - 年月日：2026年03月18日
 * - 年月日时分：2026年03月18日 14:30
 * - 年月日时分秒：2026年03月18日 14:30:45
 * - 时分：14:30
 * - date：2026-03-18
 * - datetime：2026-03-18 14:30
 * - 也支持自定义模板，如 YYYY/MM/DD HH:mm
 * @returns {string}
 */
export function getCurrentTime(format = "年月日") {
  return formatTime(new Date(), format);
}

/**
 * 获取当前时间戳（毫秒）
 * @returns {number}
 */
export function getCurrentTimestamp() {
  return Date.now();
}

/**
 * 判断是否为有效日期
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidDate(value) {
  return toDate(value) !== null;
}

/**
 * 转为 DatePicker 的 modelValue 数组 ['2026','06','18']
 * @param {Date|string|number} value
 * @returns {string[]}
 */
export function toDatePickerValues(value) {
  const date = toDate(value || new Date());
  if (!date) return [];
  return [
    String(date.getFullYear()),
    padZero(date.getMonth() + 1),
    padZero(date.getDate())
  ];
}

/**
 * 转为 TimePicker 的 modelValue 数组 ['14','30'] 或 ['14','30','00']
 * @param {Date|string|number} value
 * @param {boolean} withSecond
 * @returns {string[]}
 */
export function toTimePickerValues(value, withSecond = false) {
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (typeof value === "string" && value.includes(":")) {
    const parts = value.split(":");
    hours = Number(parts[0]) || 0;
    minutes = Number(parts[1]) || 0;
    seconds = Number(parts[2]) || 0;
  } else {
    const date = toDate(value || new Date());
    if (!date) return [];
    hours = date.getHours();
    minutes = date.getMinutes();
    seconds = date.getSeconds();
  }

  const result = [padZero(hours), padZero(minutes)];
  if (withSecond) result.push(padZero(seconds));
  return result;
}

/**
 * DatePicker 数组转 YYYY-MM-DD
 * @param {string[]} values
 * @returns {string}
 */
export function fromDatePickerValues(values) {
  if (!Array.isArray(values) || values.length < 3) return "";
  return `${values[0]}-${values[1]}-${values[2]}`;
}

/**
 * TimePicker 数组转 HH:mm 或 HH:mm:ss
 * @param {string[]} values
 * @param {boolean} withSecond
 * @returns {string}
 */
export function fromTimePickerValues(values, withSecond = false) {
  if (!Array.isArray(values) || values.length < 2) return "";
  if (withSecond) {
    return `${values[0]}:${values[1]}:${values[2] || "00"}`;
  }
  return `${values[0]}:${values[1]}`;
}

/**
 * 解析 YYYY-MM-DD HH:mm(:ss) 为 Date
 * @param {string} value
 * @returns {Date|null}
 */
export function parseDateTimeString(value) {
  if (!value || typeof value !== "string") return null;
  const normalized = value.trim().replace(" ", "T");
  return toDate(normalized.includes("T") ? normalized : `${normalized}T00:00:00`);
}
