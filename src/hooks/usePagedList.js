import { computed, ref } from "vue";

/**
 * 分页列表逻辑 Hook（下拉刷新 + 上拉加载）
 *
 * ---------------------------------------------------------------------------
 * 【怎么用】
 *
 * 1. 在页面里引入 Hook + UI 组件 ScrollRefreshList
 * 2. 传入 fetcher（请求函数），把 Hook 返回的状态和方法绑定到组件上
 * 3. 在 ScrollRefreshList 默认 slot 里渲染 list 即可
 *
 * 最小示例：
 *
 * ```vue
 * <script setup>
 * import ScrollRefreshList from "@/components/ScrollRefreshList/index.vue";
 * import { usePagedList } from "@/hooks/usePagedList";
 * import { getOrderListApi } from "@/api/order";
 *
 * const {
 *   list,
 *   refreshing,
 *   loading,
 *   finished,
 *   error,
 *   isEmpty,
 *   onRefresh,
 *   onLoad,
 *   reload
 * } = usePagedList({
 *   fetcher: ({ page, pageSize }) => getOrderListApi({ page, pageSize }),
 *   getList: res => res.list,
 *   getTotal: res => res.total,
 *   pageSize: 10
 * });
 * </script>
 *
 * <template>
 *   <!-- 全屏列表页：mode="page" 自动减去 NavBar + Tabbar -->
 *   <ScrollRefreshList
 *     mode="page"
 *     v-model:refreshing="refreshing"
 *     v-model:loading="loading"
 *     v-model:error="error"
 *     :finished="finished"
 *     :empty="isEmpty"
 *     @refresh="onRefresh"
 *     @load="onLoad"
 *   >
 *     <van-cell v-for="item in list" :key="item.id" :title="item.title" />
 *   </ScrollRefreshList>
 *
 *   <!-- 折叠面板/局部区域：mode="box" + height -->
 *   <ScrollRefreshList mode="box" height="320px" ... />
 * </template>
 * ```
 *
 * ---------------------------------------------------------------------------
 * 【和后端对接】
 *
 * fetcher 只需返回 Promise，Hook 会自动传入 { page, pageSize }。
 * 若后端字段名不同，用 getList / getTotal 做映射：
 *
 * ```js
 * usePagedList({
 *   fetcher: params => getListApi(params),
 *   getList: res => res.records,   // 列表字段
 *   getTotal: res => res.totalCount // 总数字段
 * });
 * ```
 *
 * 约定：
 * - 有 total：list.length >= total 时判定 finished
 * - 无 total：当次返回条数 < pageSize 时判定 finished
 *
 * ---------------------------------------------------------------------------
 * 【常用方法】
 *
 * - onRefresh：下拉刷新（重置到第 1 页，替换列表）
 * - onLoad：上拉加载（追加下一页，首次进入页面也会触发）
 * - reload：手动刷新（等价于 onRefresh，可用于筛选条件变化后重载）
 * - reset：清空列表和分页状态（如退出登录、切换 tab 时）
 *
 * @param {Object} options
 * @param {(params: { page: number, pageSize: number }) => Promise<any>} options.fetcher 分页请求函数
 * @param {number} [options.pageSize=10] 每页条数
 * @param {(res: any) => any[]} [options.getList] 从接口结果中提取列表
 * @param {(res: any) => number} [options.getTotal] 从接口结果中提取总数
 * @returns {{
 *   list: import('vue').Ref<any[]>,
 *   page: import('vue').Ref<number>,
 *   total: import('vue').Ref<number>,
 *   refreshing: import('vue').Ref<boolean>,
 *   loading: import('vue').Ref<boolean>,
 *   finished: import('vue').Ref<boolean>,
 *   error: import('vue').Ref<boolean>,
 *   isEmpty: import('vue').ComputedRef<boolean>,
 *   onRefresh: () => Promise<void>,
 *   onLoad: () => Promise<void>,
 *   reload: () => Promise<void>,
 *   reset: () => void
 * }}
 */
export function usePagedList(options) {
  const {
    fetcher,
    pageSize = 10,
    getList = res => res?.list ?? res?.records ?? [],
    getTotal = res => Number(res?.total) || 0
  } = options;

  /** 当前已加载的列表数据 */
  const list = ref([]);
  /** 下一次 load 要请求的页码（refresh 后会重置为 1 或 2） */
  const page = ref(1);
  /** 接口返回的总条数（无 total 时为 0） */
  const total = ref(0);
  /** 下拉刷新中 */
  const refreshing = ref(false);
  /** 上拉加载中（由 van-list 控制，Hook 内同步维护） */
  const loading = ref(false);
  /** 是否已全部加载完成 */
  const finished = ref(false);
  /** 最近一次请求是否失败（可点击底部「加载失败，点击重试」） */
  const error = ref(false);

  /** 是否展示空态（非加载中、非刷新中、无错误、列表为空） */
  const isEmpty = computed(
    () =>
      !loading.value &&
      !refreshing.value &&
      !error.value &&
      list.value.length === 0
  );

  /** 根据 total 或当次返回条数判断是否加载完毕 */
  function updateFinished(records) {
    const totalCount = total.value;
    if (totalCount > 0) {
      finished.value = list.value.length >= totalCount;
      return;
    }
    finished.value = records.length < pageSize;
  }

  /** 请求指定页并合并到 list */
  async function requestPage(currentPage, replace) {
    const res = await fetcher({ page: currentPage, pageSize });
    const records = getList(res) || [];
    total.value = getTotal(res);

    if (replace) {
      list.value = records;
    } else {
      list.value = list.value.concat(records);
    }

    updateFinished(records);
    return records;
  }

  /** 下拉刷新：重置分页，替换列表 */
  async function onRefresh() {
    refreshing.value = true;
    error.value = false;
    finished.value = false;
    page.value = 1;

    try {
      await requestPage(1, true);
      // 刷新成功后，下一页从 2 开始；若第一页就已 finished 则保持 1
      page.value = finished.value ? 1 : 2;
    } catch {
      error.value = true;
    } finally {
      refreshing.value = false;
      loading.value = false;
    }
  }

  /** 上拉加载：追加下一页（首次进入页面由 van-list 自动触发） */
  async function onLoad() {
    if (refreshing.value || finished.value) {
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = false;

    try {
      const currentPage = page.value;
      const replace = currentPage === 1 && list.value.length === 0;
      await requestPage(currentPage, replace);

      if (!finished.value) {
        page.value = currentPage + 1;
      }
    } catch {
      error.value = true;
    } finally {
      loading.value = false;
    }
  }

  /** 手动刷新（筛选条件变化、提交成功后重载列表时使用） */
  function reload() {
    return onRefresh();
  }

  /** 重置所有状态（切换账号、离开页面需要清空数据时使用） */
  function reset() {
    list.value = [];
    page.value = 1;
    total.value = 0;
    finished.value = false;
    error.value = false;
    loading.value = false;
    refreshing.value = false;
  }

  return {
    list,
    page,
    total,
    refreshing,
    loading,
    finished,
    error,
    isEmpty,
    onRefresh,
    onLoad,
    reload,
    reset
  };
}
