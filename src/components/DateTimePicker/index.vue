<script setup>
/**
 * 日期 / 时间 / 日期时间选择（底部弹出）
 *
 * type: date | time | datetime
 * v-model 字符串：date -> YYYY-MM-DD，time -> HH:mm，datetime -> YYYY-MM-DD HH:mm
 */
import { computed, ref, watch } from "vue";
import {
  formatTime,
  fromDatePickerValues,
  fromTimePickerValues,
  parseDateTimeString,
  toDatePickerValues,
  toTimePickerValues
} from "@/utils/format-time";
import "vant/es/popup/style";
import "vant/es/cell/style";
import "vant/es/date-picker/style";
import "vant/es/time-picker/style";
import "vant/es/picker-group/style";
import "vant/es/tabs/style";
import "vant/es/tab/style";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  /** date | time | datetime */
  type: {
    type: String,
    default: "date",
    validator: val => ["date", "time", "datetime"].includes(val)
  },
  fieldLabel: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: "请选择"
  },
  show: {
    type: Boolean,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  /** 触发区展示格式（formatTime 预设或模板） */
  displayFormat: {
    type: String,
    default: ""
  },
  minDate: {
    type: Date,
    default: undefined
  },
  maxDate: {
    type: Date,
    default: undefined
  },
  /** time 是否含秒 */
  showSecond: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: true
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  },
  confirmButtonText: {
    type: String,
    default: "确认"
  },
  cancelButtonText: {
    type: String,
    default: "取消"
  },
  dateTabText: {
    type: String,
    default: "日期"
  },
  timeTabText: {
    type: String,
    default: "时间"
  },
  nextStepText: {
    type: String,
    default: "下一步"
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
const draftDate = ref([]);
const draftTime = ref([]);

const visible = computed({
  get: () => (props.show !== undefined ? props.show : innerShow.value),
  set: val => {
    innerShow.value = val;
    emit("update:show", val);
  }
});

const resolvedTitle = computed(() => {
  if (props.title) return props.title;
  if (props.type === "time") return "选择时间";
  if (props.type === "datetime") return "选择日期时间";
  return "选择日期";
});

const resolvedDisplayFormat = computed(() => {
  if (props.displayFormat) return props.displayFormat;
  if (props.type === "time") return props.showSecond ? "时分秒" : "时分";
  if (props.type === "datetime") return "datetime";
  return "date";
});

const displayText = computed(() => {
  if (!props.modelValue) return props.placeholder;
  const parsed = parseDateTimeString(
    props.type === "time" ? `2000-01-01 ${props.modelValue}` : props.modelValue
  );
  if (!parsed) return props.modelValue;
  return formatTime(parsed, resolvedDisplayFormat.value);
});

function syncDraftFromValue() {
  const parsed = parseDateTimeString(
    props.type === "time"
      ? props.modelValue
        ? `2000-01-01 ${props.modelValue}`
        : new Date()
      : props.modelValue || new Date()
  );

  draftDate.value = toDatePickerValues(parsed || new Date());
  draftTime.value = toTimePickerValues(
    props.type === "time" ? props.modelValue || new Date() : parsed || new Date(),
    props.showSecond
  );
}

watch(visible, val => {
  if (val) syncDraftFromValue();
});

function buildValue() {
  if (props.type === "date") {
    return fromDatePickerValues(draftDate.value);
  }
  if (props.type === "time") {
    return fromTimePickerValues(draftTime.value, props.showSecond);
  }
  const datePart = fromDatePickerValues(draftDate.value);
  const timePart = fromTimePickerValues(draftTime.value, props.showSecond);
  return datePart && timePart ? `${datePart} ${timePart}` : "";
}

function commit() {
  const next = buildValue();
  if (!next) {
    close();
    return;
  }
  emit("update:modelValue", next);
  emit("change", next);
  emit("confirm", next);
  close();
}

function open() {
  if (props.disabled) return;
  syncDraftFromValue();
  visible.value = true;
}

function close() {
  visible.value = false;
}

function onCancel() {
  emit("cancel");
  close();
}

function onDateConfirm() {
  if (props.type === "date") commit();
}

function onTimeConfirm() {
  if (props.type === "time") commit();
}

function onDatetimeConfirm() {
  if (props.type === "datetime") commit();
}

defineExpose({ open, close });
</script>

<template>
  <div class="date-time-picker">
    <slot
      name="trigger"
      :open="open"
      :text="displayText"
      :value="modelValue"
    >
      <van-cell
        :title="fieldLabel || resolvedTitle"
        :value="displayText"
        :is-link="!disabled"
        :class="{ 'is-placeholder': !modelValue }"
        @click="open"
      />
    </slot>

    <van-popup
      v-model:show="visible"
      position="bottom"
      :round="round"
      :close-on-click-overlay="closeOnClickOverlay"
    >
      <van-date-picker
        v-if="type === 'date'"
        v-model="draftDate"
        :title="resolvedTitle"
        :min-date="minDate"
        :max-date="maxDate"
        :confirm-button-text="confirmButtonText"
        :cancel-button-text="cancelButtonText"
        @confirm="onDateConfirm"
        @cancel="onCancel"
      />

      <van-time-picker
        v-else-if="type === 'time'"
        v-model="draftTime"
        :title="resolvedTitle"
        :columns-type="showSecond ? ['hour', 'minute', 'second'] : ['hour', 'minute']"
        :confirm-button-text="confirmButtonText"
        :cancel-button-text="cancelButtonText"
        @confirm="onTimeConfirm"
        @cancel="onCancel"
      />

      <van-picker-group
        v-else
        :title="resolvedTitle"
        :tabs="[dateTabText, timeTabText]"
        :next-step-text="nextStepText"
        :confirm-button-text="confirmButtonText"
        :cancel-button-text="cancelButtonText"
        @confirm="onDatetimeConfirm"
        @cancel="onCancel"
      >
        <van-date-picker
          v-model="draftDate"
          :min-date="minDate"
          :max-date="maxDate"
        />
        <van-time-picker
          v-model="draftTime"
          :columns-type="showSecond ? ['hour', 'minute', 'second'] : ['hour', 'minute']"
        />
      </van-picker-group>
    </van-popup>
  </div>
</template>

<style scoped>
.date-time-picker :deep(.van-cell__value) {
  flex: 2;
  text-align: right;
}

.date-time-picker .is-placeholder :deep(.van-cell__value) {
  color: var(--color-text-secondary);
}
</style>
