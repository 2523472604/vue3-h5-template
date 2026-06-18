import { showConfirmDialog, showDialog } from "vant/es/dialog";
import { showToast, showSuccessToast, showFailToast } from "vant/es/toast";
import "vant/es/dialog/style";
import "vant/es/toast/style";

const DEFAULT_CONFIRM_COLOR = "#41b883";

/**
 * 二次确认弹窗
 * @param {import('vant').DialogOptions} options
 * @returns {Promise<import('vant').DialogAction | undefined>}
 */
export function confirm(options = {}) {
  return showConfirmDialog({
    confirmButtonColor: DEFAULT_CONFIRM_COLOR,
    ...options
  });
}

/**
 * 提示弹窗（仅确认）
 * @param {import('vant').DialogOptions} options
 */
export function alert(options = {}) {
  return showDialog({
    confirmButtonColor: DEFAULT_CONFIRM_COLOR,
    ...options
  });
}

export { showToast, showSuccessToast, showFailToast };
