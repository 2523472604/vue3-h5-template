<script setup>
/**
 * 弹出层单选组件（Radio）
 *
 * v-model 为单个 value；options 格式同 PopupMultiSelect
 */
import { computed, ref, watch } from "vue";
import "vant/es/popup/style";
import "vant/es/radio/style";
import "vant/es/radio-group/style";
import "vant/es/cell/style";
import "vant/es/button/style";

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ""
  },
  options: {
    type: Array,
    default: () => []
  },
  fieldLabel: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: "请选择"
  },
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
  show: {
    type: Boolean,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
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
  },
  /** 点击选项后立即确认并关闭 */
  immediate: {
    type: Boolean,
    default: false
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
const draftValue = ref("");

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

const displayText = computed(() => {
  if (props.modelValue === "" || props.modelValue === null || props.modelValue === undefined) {
    return props.placeholder;
  }
  const hit = normalizedOptions.value.find(item => item.value === props.modelValue);
  return hit?.label ?? props.placeholder;
});

watch(visible, val => {
  if (val) {
    draftValue.value = props.modelValue;
  }
});

function open() {
  if (props.disabled) return;
  draftValue.value = props.modelValue;
  visible.value = true;
}

function close() {
  visible.value = false;
}

function commit() {
  emit("update:modelValue", draftValue.value);
  emit("change", draftValue.value);
  emit("confirm", draftValue.value);
  close();
}

function onConfirm() {
  commit();
}

function onCancel() {
  emit("cancel");
  close();
}

function selectOption(value) {
  draftValue.value = value;
  if (props.immediate) {
    commit();
  }
}

defineExpose({ open, close });
</script>

<template>
  <div class="popup-select">
    <slot
      name="trigger"
      :open="open"
      :text="displayText"
      :value="modelValue"
    >
      <van-cell
        :title="fieldLabel || title"
        :value="displayText"
        :is-link="!disabled"
        :class="{ 'is-placeholder': modelValue === '' || modelValue === null || modelValue === undefined }"
        @click="open"
      />
    </slot>

    <van-popup
      v-model:show="visible"
      position="bottom"
      :round="round"
      :close-on-click-overlay="closeOnClickOverlay"
      class="popup-select__popup"
    >
      <div class="popup-select__header">
        <span class="popup-select__title">{{ title }}</span>
      </div>

      <div class="popup-select__body">
        <van-radio-group v-model="draftValue">
          <van-cell
            v-for="item in normalizedOptions"
            :key="String(item.value)"
            clickable
            :title="item.label"
            @click="!item.disabled && selectOption(item.value)"
          >
            <template #right-icon>
              <van-radio
                :name="item.value"
                :disabled="item.disabled"
                @click.stop
              />
            </template>
          </van-cell>
        </van-radio-group>
      </div>

      <div v-if="!immediate" class="popup-select__footer">
        <van-button block plain @click="onCancel">{{ cancelText }}</van-button>
        <van-button block type="primary" @click="onConfirm">
          {{ confirmText }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.popup-select :deep(.van-cell__value) {
  flex: 1;
  text-align: left;
}

.popup-select .is-placeholder :deep(.van-cell__value) {
  color: var(--color-text-secondary);
}

.popup-select__header {
  padding: 14px 16px 8px;
  text-align: center;
}

.popup-select__title {
  font-size: 16px;
  font-weight: 600;
}

.popup-select__body {
  max-height: 50vh;
  overflow-y: auto;
}

.popup-select__footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
}
</style>
