<script setup>
/**
 * 弹出层多选组件（复选框 + 全选/取消全选）
 *
 * ---------------------------------------------------------------------------
 * 【怎么用】
 *
 * ```vue
 * <PopupMultiSelect
 *   v-model="selected"
 *   field-label="选择标签"
 *   title="请选择标签"
 *   :options="tagOptions"
 * />
 * ```
 *
 * options 支持：
 * - [{ label: '选项A', value: 'a' }]
 * - 或通过 label-key / value-key 映射字段名
 *
 * 【自定义触发器】
 * ```vue
 * <PopupMultiSelect v-model="selected" :options="options">
 *   <template #trigger="{ open, text }">
 *     <van-button @click="open">{{ text }}</van-button>
 *   </template>
 * </PopupMultiSelect>
 * ```
 * ---------------------------------------------------------------------------
 */
import { computed, ref, watch } from "vue";
import { showToast } from "vant";
import "vant/es/popup/style";
import "vant/es/checkbox/style";
import "vant/es/checkbox-group/style";
import "vant/es/cell/style";
import "vant/es/button/style";
import "vant/es/toast/style";

const props = defineProps({
  /** v-model：已选 value 数组 */
  modelValue: {
    type: Array,
    default: () => []
  },
  /** 选项列表 */
  options: {
    type: Array,
    default: () => []
  },
  /** 表单触发区左侧标题 */
  fieldLabel: {
    type: String,
    default: ""
  },
  /** 弹出层标题 */
  title: {
    type: String,
    default: "请选择"
  },
  /** 未选择时的占位文案 */
  placeholder: {
    type: String,
    default: "请选择"
  },
  labelKey: {
    type: String,
    default: "label"
  },
  valueKey: {
    type: String,
    default: "value"
  },
  disabledKey: {
    type: String,
    default: "disabled"
  },
  /** 受控显示弹出层；不传则组件内部管理 */
  show: {
    type: Boolean,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  /** 是否显示必填星号 */
  required: {
    type: Boolean,
    default: false
  },
  /** 最大可选数量，0 表示不限制 */
  max: {
    type: Number,
    default: 0
  },
  showSelectAll: {
    type: Boolean,
    default: true
  },
  selectAllText: {
    type: String,
    default: "全选"
  },
  deselectAllText: {
    type: String,
    default: "取消全选"
  },
  confirmText: {
    type: String,
    default: "确定"
  },
  cancelText: {
    type: String,
    default: "取消"
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  },
  round: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits([
  "update:modelValue",
  "update:show",
  "change",
  "confirm",
  "cancel"
]);

const innerShow = ref(false);
const draftValues = ref([]);

const visible = computed({
  get: () => (props.show !== undefined ? props.show : innerShow.value),
  set: val => {
    innerShow.value = val;
    emit("update:show", val);
  }
});

const normalizedOptions = computed(() =>
  (Array.isArray(props.options) ? props.options : []).map(opt => {
    if (opt && typeof opt === "object") {
      return {
        label: opt[props.labelKey],
        value: opt[props.valueKey],
        disabled: Boolean(opt[props.disabledKey]),
        raw: opt
      };
    }
    return {
      label: String(opt),
      value: opt,
      disabled: false,
      raw: opt
    };
  })
);

const enabledOptions = computed(() =>
  normalizedOptions.value.filter(item => !item.disabled)
);

const safeValue = computed(() =>
  (Array.isArray(props.modelValue) ? props.modelValue : []).filter(
    val => val !== undefined && val !== null && val !== ""
  )
);

const displayText = computed(() => {
  if (!safeValue.value.length) return props.placeholder;
  const labelMap = new Map(
    normalizedOptions.value.map(item => [item.value, item.label])
  );
  const labels = safeValue.value
    .map(val => labelMap.get(val))
    .filter(Boolean);
  return labels.length ? labels.join("、") : props.placeholder;
});

const isAllSelected = computed(() => {
  if (!enabledOptions.value.length) return false;
  const enabledValues = enabledOptions.value.map(item => item.value);
  return enabledValues.every(val => draftValues.value.includes(val));
});

watch(visible, val => {
  if (val) {
    draftValues.value = [...safeValue.value];
  }
});

function open() {
  if (props.disabled) return;
  draftValues.value = [...safeValue.value];
  visible.value = true;
}

function close() {
  visible.value = false;
}

function onConfirm() {
  const next = [...draftValues.value];
  emit("update:modelValue", next);
  emit("change", next);
  emit("confirm", next);
  close();
}

function onCancel() {
  emit("cancel");
  close();
}

function selectAll() {
  draftValues.value = enabledOptions.value.map(item => item.value);
}

function deselectAll() {
  draftValues.value = [];
}

function onDraftChange(vals) {
  const next = Array.isArray(vals) ? vals : [];
  if (props.max > 0 && next.length > props.max) {
    showToast(`最多选择 ${props.max} 项`);
    draftValues.value = next.slice(0, props.max);
    return;
  }
  draftValues.value = next;
}

function toggleOption(value) {
  const set = new Set(draftValues.value);
  if (set.has(value)) {
    set.delete(value);
  } else {
    if (props.max > 0 && set.size >= props.max) {
      showToast(`最多选择 ${props.max} 项`);
      return;
    }
    set.add(value);
  }
  draftValues.value = Array.from(set);
}

defineExpose({ open, close });
</script>

<template>
  <div class="popup-multi-select">
    <slot name="trigger" :open="open" :text="displayText" :value="safeValue">
      <van-cell
        :title="fieldLabel || title"
        :value="displayText"
        :required="required"
        :is-link="!disabled"
        :class="{ 'is-placeholder': !safeValue.length }"
        @click="open"
      />
    </slot>

    <van-popup
      v-model:show="visible"
      position="bottom"
      :round="round"
      :close-on-click-overlay="closeOnClickOverlay"
      class="popup-multi-select__popup"
    >
      <div class="popup-multi-select__header">
        <span class="popup-multi-select__title">{{ title }}</span>
      </div>

      <div v-if="showSelectAll" class="popup-multi-select__toolbar">
        <button
          type="button"
          class="popup-multi-select__tool-btn"
          :class="{ 'is-active': isAllSelected }"
          @click="selectAll"
        >
          {{ selectAllText }}
        </button>
        <button
          type="button"
          class="popup-multi-select__tool-btn"
          @click="deselectAll"
        >
          {{ deselectAllText }}
        </button>
      </div>

      <div class="popup-multi-select__body">
        <van-checkbox-group
          :model-value="draftValues"
          @update:model-value="onDraftChange"
        >
          <van-cell
            v-for="item in normalizedOptions"
            :key="String(item.value)"
            clickable
            :title="item.label"
            @click="!item.disabled && toggleOption(item.value)"
          >
            <template #right-icon>
              <van-checkbox
                :name="item.value"
                :disabled="item.disabled"
                @click.stop
              />
            </template>
          </van-cell>
        </van-checkbox-group>
      </div>

      <div class="popup-multi-select__footer">
        <van-button block plain @click="onCancel">{{ cancelText }}</van-button>
        <van-button block type="primary" @click="onConfirm">
          {{ confirmText }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.popup-multi-select :deep(.van-cell__value) {
  flex: 1;
  text-align: left;
}

.popup-multi-select .is-placeholder :deep(.van-cell__value) {
  color: var(--color-text-secondary);
}

.popup-multi-select__header {
  padding: 14px 16px 8px;
  text-align: center;
}

.popup-multi-select__title {
  font-size: 16px;
  font-weight: 600;
}

.popup-multi-select__toolbar {
  display: flex;
  gap: 12px;
  padding: 0 16px 8px;
}

.popup-multi-select__tool-btn {
  border: none;
  background: var(--van-gray-1);
  color: var(--van-text-color);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 999px;
}

.popup-multi-select__tool-btn.is-active {
  color: var(--van-primary-color);
  border: 1px solid var(--van-primary-color);
  background: transparent;
}

.popup-multi-select__body {
  max-height: 50vh;
  overflow-y: auto;
}

.popup-multi-select__footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
}
</style>
