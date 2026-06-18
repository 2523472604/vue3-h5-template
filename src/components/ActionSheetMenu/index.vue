<script setup>
/**
 * 底部操作菜单（ActionSheet 封装）
 *
 * options: [{ name, label, color?, subname?, disabled? }]
 * 点击项后 emit select 并默认关闭
 */
import { computed } from "vue";
import "vant/es/action-sheet/style";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  options: {
    type: Array,
    default: () => []
  },
  labelKey: {
    type: String,
    default: "label"
  },
  valueKey: {
    type: String,
    default: "name"
  },
  cancelText: {
    type: String,
    default: "取消"
  },
  closeOnClickAction: {
    type: Boolean,
    default: true
  },
  round: {
    type: Boolean,
    default: true
  },
  safeAreaInsetBottom: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["update:show", "select", "cancel", "close"]);

const visible = computed({
  get: () => props.show,
  set: val => emit("update:show", val)
});

const actions = computed(() =>
  (Array.isArray(props.options) ? props.options : []).map(item => {
    if (item && typeof item === "object") {
      const label = item[props.labelKey] ?? item.text ?? item.label ?? "";
      const value = item[props.valueKey] ?? item.name ?? label;
      return {
        name: label,
        subname: item.subname,
        color: item.color,
        disabled: item.disabled,
        className: item.className,
        value,
        raw: item
      };
    }
    return { name: String(item), value: item, raw: item };
  })
);

function onSelect(action, index) {
  emit("select", { action, index, value: action.value, raw: action.raw });
  if (props.closeOnClickAction) {
    visible.value = false;
  }
}

function onCancel() {
  emit("cancel");
  visible.value = false;
}

function onClose() {
  emit("close");
}
</script>

<template>
  <van-action-sheet
    v-model:show="visible"
    :title="title"
    :description="description"
    :actions="actions"
    :cancel-text="cancelText"
    :round="round"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    @select="onSelect"
    @cancel="onCancel"
    @close="onClose"
  />
</template>
