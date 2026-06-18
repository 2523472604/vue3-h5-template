<script setup>
/**
 * 下拉刷新 + 上拉加载 列表容器
 *
 * ---------------------------------------------------------------------------
 * 【模式】
 * - mode="box"（默认）：局部滚动，需手动传 height（如 320px、折叠面板内）
 * - mode="page"：整页滚动，自动减去 NavBar / Tabbar / 安全区高度
 *
 * 【page 模式示例 - 全屏列表页】
 * ```vue
 * <ScrollRefreshList
 *   mode="page"
 *   v-model:refreshing="refreshing"
 *   ...
 * />
 * ```
 *
 * 【box 模式示例 - 局部区域】
 * ```vue
 * <ScrollRefreshList mode="box" height="320px" ... />
 * ```
 *
 * 【回到顶部】
 * ```vue
 * <ScrollRefreshList show-back-top :back-top-offset="300" ... />
 * ```
 * ---------------------------------------------------------------------------
 */
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import "vant/es/list/style";
import "vant/es/pull-refresh/style";
import "vant/es/back-top/style";

const props = defineProps({
  /** 滚动模式：box 局部 | page 整页 */
  mode: {
    type: String,
    default: "box",
    validator: val => ["box", "page"].includes(val)
  },
  refreshing: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  finished: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  empty: {
    type: Boolean,
    default: false
  },
  /** box 模式下的容器高度；page 模式可忽略 */
  height: {
    type: String,
    default: "360px"
  },
  /**
   * page 模式：是否减去 NavBar 高度
   * 默认读取 route.meta.showNavBar（不为 false 则减去）
   */
  deductNavBar: {
    type: Boolean,
    default: undefined
  },
  /**
   * page 模式：是否减去 Tabbar 高度
   * 默认读取 route.meta.showTabbar（不为 false 则减去）
   */
  deductTabbar: {
    type: Boolean,
    default: undefined
  },
  /** page 模式：NavBar 占用高度，默认 Vant 变量 */
  navBarHeight: {
    type: String,
    default: "var(--van-nav-bar-height)"
  },
  /** page 模式：Tabbar 占用高度，默认 Vant 变量 */
  tabbarHeight: {
    type: String,
    default: "var(--van-tabbar-height)"
  },
  /** page 模式：是否减去顶部/底部安全区 */
  deductSafeArea: {
    type: Boolean,
    default: true
  },
  /** page 模式：额外减去的高度（如页面内筛选栏、padding） */
  pageOffset: {
    type: String,
    default: "0px"
  },
  immediateCheck: {
    type: Boolean,
    default: true
  },
  offset: {
    type: Number,
    default: 300
  },
  finishedText: {
    type: String,
    default: "没有更多了"
  },
  errorText: {
    type: String,
    default: "加载失败，点击重试"
  },
  emptyText: {
    type: String,
    default: "暂无数据"
  },
  disabledRefresh: {
    type: Boolean,
    default: false
  },
  disabledLoad: {
    type: Boolean,
    default: false
  },
  /** 是否显示回到顶部按钮（绑定当前滚动容器） */
  showBackTop: {
    type: Boolean,
    default: false
  },
  /** 滚动多少 px 后显示回到顶部 */
  backTopOffset: {
    type: Number,
    default: 300
  },
  backTopRight: {
    type: [Number, String],
    default: 16
  },
  backTopBottom: {
    type: [Number, String],
    default: 80
  }
});

const emit = defineEmits([
  "update:refreshing",
  "update:loading",
  "update:error",
  "refresh",
  "load",
  "retry"
]);

const route = useRoute();
const scrollRef = ref(null);

const shouldDeductNavBar = computed(() => {
  if (props.deductNavBar !== undefined) return props.deductNavBar;
  return route.meta?.showNavBar !== false;
});

const shouldDeductTabbar = computed(() => {
  if (props.deductTabbar !== undefined) return props.deductTabbar;
  return route.meta?.showTabbar !== false;
});

const containerStyle = computed(() => {
  if (props.mode !== "page") {
    return { height: props.height };
  }

  const minus = [];
  if (shouldDeductNavBar.value) {
    minus.push(props.navBarHeight);
    if (props.deductSafeArea) minus.push("env(safe-area-inset-top)");
  }
  if (shouldDeductTabbar.value) {
    minus.push(props.tabbarHeight);
    if (props.deductSafeArea) minus.push("env(safe-area-inset-bottom)");
  }
  if (props.pageOffset && props.pageOffset !== "0px") {
    minus.push(props.pageOffset);
  }

  const height =
    minus.length > 0
      ? `calc(100vh - ${minus.join(" - ")})`
      : `calc(100vh - ${props.pageOffset || "0px"})`;

  return { height };
});

function onRefresh() {
  emit("refresh");
}

function onLoad() {
  if (props.disabledLoad) {
    emit("update:loading", false);
    return;
  }
  emit("load");
}

function onRetry() {
  emit("update:error", false);
  emit("retry");
  emit("load");
}
</script>

<template>
  <div
    ref="scrollRef"
    class="scroll-refresh-list"
    :class="{ 'scroll-refresh-list--page': mode === 'page' }"
    :style="containerStyle"
  >
    <van-pull-refresh
      :model-value="refreshing"
      :disabled="disabledRefresh"
      @update:model-value="emit('update:refreshing', $event)"
      @refresh="onRefresh"
    >
      <van-list
        :loading="loading"
        :finished="finished"
        :error="error"
        :immediate-check="immediateCheck"
        :offset="offset"
        :scroller="scrollRef"
        :finished-text="finishedText"
        :error-text="errorText"
        @update:loading="emit('update:loading', $event)"
        @update:error="emit('update:error', $event)"
        @load="onLoad"
        @click-error="onRetry"
      >
        <slot v-if="!empty" />
        <div v-else class="scroll-refresh-list__empty">
          <slot name="empty">
            {{ emptyText }}
          </slot>
        </div>
      </van-list>
    </van-pull-refresh>

    <van-back-top
      v-if="showBackTop"
      :target="scrollRef"
      :offset="backTopOffset"
      :right="backTopRight"
      :bottom="backTopBottom"
    />
  </div>
</template>

<style scoped>
.scroll-refresh-list {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.scroll-refresh-list--page {
  width: 100%;
}

.scroll-refresh-list__empty {
  padding: 32px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
