<script setup name="ListDemo">
import { defineAsyncComponent } from "vue";
import "vant/es/cell/style";

import { usePagedList } from "@/hooks/usePagedList";

const ScrollRefreshList = defineAsyncComponent(
  () => import("@/components/ScrollRefreshList/index.vue")
);

const {
  list,
  refreshing,
  loading,
  finished,
  error,
  isEmpty,
  onRefresh,
  onLoad
} = usePagedList({
  fetcher: ({ page, pageSize }) =>
    import("@/api/mock").then(m => m.getListApi({ page, pageSize })),
  getList: res => res.list,
  getTotal: res => res.total,
  pageSize: 25
});
</script>

<template>
  <ScrollRefreshList
    mode="page"
    show-back-top
    v-model:refreshing="refreshing"
    v-model:loading="loading"
    v-model:error="error"
    :finished="finished"
    :empty="isEmpty"
    :back-top-bottom="24"
    @refresh="onRefresh"
    @load="onLoad"
  >
    <van-cell
      v-for="item in list"
      :key="item.id"
      :title="item.title"
      :label="`ID: ${item.id} · 点击进入详情页`"
      is-link
      :to="{ name: 'DetailDemo', params: { id: String(item.id) } }"
    />
  </ScrollRefreshList>
</template>
