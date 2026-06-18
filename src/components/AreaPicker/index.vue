<script setup>
/**
 * 省市区选择组件（弹出层 + van-area）
 *
 * ---------------------------------------------------------------------------
 * 【怎么用】
 *
 * ```vue
 * <AreaPicker
 *   v-model="region"
 *   field-label="所在地区"
 *   title="选择省市区"
 *   placeholder="请选择省市区"
 * />
 * ```
 *
 * v-model 结构：
 * {
 *   code: "330106",           // 最后一级地区码（通常是区县）
 *   label: "浙江省 / 杭州市 / 西湖区",
 *   province: "浙江省",
 *   city: "杭州市",
 *   county: "西湖区",
 *   codes: ["330000", "330100", "330106"]
 * }
 *
 * 【只选到省/市】
 * :columns-num="2"  省 + 市
 * :columns-num="1"  仅省
 *
 * 【自定义触发器】
 * <AreaPicker v-model="region">
 *   <template #trigger="{ open, text }">
 *     <van-button @click="open">{{ text }}</van-button>
 *   </template>
 * </AreaPicker>
 * ---------------------------------------------------------------------------
 */
import { computed, ref, watch } from "vue";
import { areaList as defaultAreaList } from "@vant/area-data";
import "vant/es/popup/style";
import "vant/es/area/style";
import "vant/es/cell/style";

const props = defineProps({
  /** v-model：选中的地区对象，未选时为 null */
  modelValue: {
    type: Object,
    default: null
  },
  fieldLabel: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: "请选择所在地区"
  },
  placeholder: {
    type: String,
    default: "请选择省市区"
  },
  /** 列数：1 省 | 2 省市 | 3 省市区 */
  columnsNum: {
    type: [Number, String],
    default: 3
  },
  /** 自定义地区数据，默认 @vant/area-data */
  areaList: {
    type: Object,
    default: null
  },
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
  confirmButtonText: {
    type: String,
    default: "确认"
  },
  cancelButtonText: {
    type: String,
    default: "取消"
  },
  round: {
    type: Boolean,
    default: true
  },
  closeOnClickOverlay: {
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
const draftCode = ref("");

const visible = computed({
  get: () => (props.show !== undefined ? props.show : innerShow.value),
  set: val => {
    innerShow.value = val;
    emit("update:show", val);
  }
});

const resolvedAreaList = computed(() => props.areaList || defaultAreaList);

const displayText = computed(
  () => props.modelValue?.label || props.placeholder
);

watch(visible, val => {
  if (val) {
    draftCode.value = props.modelValue?.code || "";
  }
});

function buildResult(selectedOptions) {
  const options = (selectedOptions || []).filter(Boolean);
  const names = options.map(item => item.text).filter(Boolean);
  const codes = options.map(item => item.value).filter(Boolean);
  const [provinceOpt, cityOpt, countyOpt] = options;

  return {
    code: codes[codes.length - 1] || "",
    label: names.join(" / "),
    province: provinceOpt?.text || "",
    city: cityOpt?.text || "",
    county: countyOpt?.text || "",
    codes
  };
}

function open() {
  if (props.disabled) return;
  draftCode.value = props.modelValue?.code || "";
  visible.value = true;
}

function close() {
  visible.value = false;
}

function onConfirm(payload) {
  const result = buildResult(payload?.selectedOptions || []);
  if (!result.code) {
    close();
    return;
  }

  emit("update:modelValue", result);
  emit("change", result);
  emit("confirm", result);
  close();
}

function onCancel() {
  emit("cancel");
  close();
}

defineExpose({ open, close });
</script>

<template>
  <div class="area-picker">
    <slot name="trigger" :open="open" :text="displayText" :value="modelValue">
      <van-cell
        :title="fieldLabel || title"
        :value="displayText"
        :required="required"
        :is-link="!disabled"
        :class="{ 'is-placeholder': !modelValue?.label }"
        @click="open"
      />
    </slot>

    <van-popup
      v-model:show="visible"
      position="bottom"
      :round="round"
      :close-on-click-overlay="closeOnClickOverlay"
    >
      <van-area
        v-model="draftCode"
        :title="title"
        :area-list="resolvedAreaList"
        :columns-num="columnsNum"
        :confirm-button-text="confirmButtonText"
        :cancel-button-text="cancelButtonText"
        @confirm="onConfirm"
        @cancel="onCancel"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.area-picker :deep(.van-cell__value) {
  flex: 1;
  text-align: left;
}

.area-picker .is-placeholder :deep(.van-cell__value) {
  color: var(--color-text-secondary);
}
</style>
