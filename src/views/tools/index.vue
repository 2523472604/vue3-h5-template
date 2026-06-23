<script setup name="Tools">
import { defineAsyncComponent, ref } from "vue";
import { showSuccessToast } from "vant/es/toast";
import "vant/es/collapse/style";
import "vant/es/collapse-item/style";
import "vant/es/cell/style";
import "vant/es/field/style";
import "vant/es/button/style";
import "vant/es/toast/style";

import StickyActionBar from "@/components/StickyActionBar/index.vue";
import ActionSheetMenu from "@/components/ActionSheetMenu/index.vue";
import BaseCard from "@/components/BaseCard/index.vue";
import { usePagedList } from "@/hooks/usePagedList";
import { confirm } from "@/utils/feedback";
import { THEME_COLORS } from "@/constants/theme";

const FileUpload = defineAsyncComponent(
  () => import("@/components/FileUpload/index.vue")
);
const FilePreview = defineAsyncComponent(
  () => import("@/components/FilePreview/index.vue")
);
const ImageUpload = defineAsyncComponent(
  () => import("@/components/ImageUpload/index.vue")
);
const ImagePreview = defineAsyncComponent(
  () => import("@/components/ImagePreview/index.vue")
);
const ScrollRefreshList = defineAsyncComponent(
  () => import("@/components/ScrollRefreshList/index.vue")
);
const demoImages = ref([]);
const demoFiles = ref([]);
/** 手风琴模式：同时只展开一个面板，值为当前展开项的 name */
const activePanel = ref("upload");

/**
 * -----------------------------------------------------------------------
 * 【列表分页示例 - 后续业务页可直接复制此段】
 *
 * 步骤：
 * 1. 引入 ScrollRefreshList + usePagedList
 * 2. usePagedList 传入 fetcher（你的列表 API）
 * 3. 根据后端返回结构调整 getList / getTotal
 * 4. 把 Hook 返回值绑定到 ScrollRefreshList
 * 5. 在默认 slot 里 v-for 渲染 list
 *
 * 筛选条件变化后重载：调用 reload()
 * 离开页面需清空：调用 reset()
 * -----------------------------------------------------------------------
 */
const {
  list: demoList,
  refreshing,
  loading,
  finished,
  error,
  isEmpty,
  onRefresh,
  onLoad
} = usePagedList({
  // fetcher 会收到 { page, pageSize }，直接透传给 API 即可
  fetcher: ({ page, pageSize }) =>
    import("@/api/mock").then(m => m.getListApi({ page, pageSize })),
  // 若后端字段不同，在这里做映射，例如 res.records / res.totalCount
  getList: res => res.list,
  getTotal: res => res.total,
  pageSize: 25
});

const showActionSheet = ref(false);

async function onDemoConfirm() {
  try {
    await confirm({
      title: "确认提交",
      message: "确定要提交当前表单吗？"
    });
    showSuccessToast("已提交");
  } catch {
    // 用户取消
  }
}

function onActionSelect({ value }) {
  showSuccessToast(`选择了：${value}`);
}

function onStickySubmit() {
  showSuccessToast("底部栏提交");
}
</script>
<template>
  <div class="tools-content pt-[12px] px-[12px] pb-[20px]">
    <van-collapse v-model="activePanel" accordion class="tools-collapse">
      <van-collapse-item name="upload" title="上传相关">
        <div class="pt-[8px] space-y-6">
          <section>
            <h4 class="font-medium text-[14px] mb-2">图片上传与预览</h4>
            <ImageUpload
              v-model="demoImages"
              :max-count="6"
              :max-size="5 * 1024 * 1024"
              :max-concurrent="2"
              upload-text="选择图片"
            />

            <div v-if="demoImages.length" class="mt-3">
              <p class="text-[12px] mb-2 text-[var(--color-text-secondary)]">
                预览已选择的图片（可点击缩略图全屏预览）：
              </p>
              <ImagePreview :images="demoImages" />
            </div>

            <div
              class="mt-3 text-[12px] text-[var(--color-text-secondary)] break-all"
            >
              当前图片 URL 列表：
              {{ demoImages }}
            </div>
          </section>

          <section>
            <h4 class="font-medium text-[14px] mb-2">文件上传与预览</h4>
            <FileUpload
              v-model="demoFiles"
              :max-count="10"
              :max-size="20 * 1024 * 1024"
              :max-concurrent="3"
              upload-text="选择文件"
              accept="*/*"
            />

            <div class="mt-3">
              <p class="text-[12px] mb-2 text-[var(--color-text-secondary)]">
                文件预览列表（支持在线预览与下载）：
              </p>
              <FilePreview :files="demoFiles" />
            </div>

            <div
              class="mt-3 text-[12px] text-[var(--color-text-secondary)] break-all"
            >
              当前文件列表：
              {{ demoFiles }}
            </div>
          </section>
        </div>
      </van-collapse-item>

      <!--
        【列表相关示例 - 局部 box 模式】
        全屏列表页请用 mode="page"（自动减去 NavBar + Tabbar），无需手写 height。
      -->
      <van-collapse-item name="list" title="列表相关">
        <div class="pt-[8px]">
          <p class="text-[12px] mb-2 text-[var(--color-text-secondary)]">
            下拉刷新 + 上拉加载（
            <code>ScrollRefreshList</code>
            mode="box" +
            <code>usePagedList</code>
            ）：
          </p>

          <ScrollRefreshList
            mode="box"
            v-model:refreshing="refreshing"
            v-model:loading="loading"
            v-model:error="error"
            :finished="finished"
            :empty="isEmpty"
            height="320px"
            @refresh="onRefresh"
            @load="onLoad"
          >
            <van-cell
              v-for="item in demoList"
              :key="item.id"
              :title="item.title"
              :label="`ID: ${item.id}`"
            />

            <!-- 可选：自定义空态
            <template #empty>
              <van-empty description="暂无数据" />
            </template>
            -->
          </ScrollRefreshList>

          <van-cell
            class="mt-2"
            title="打开全屏列表示例"
            label="mode=page + BackTop，隐藏 Tabbar"
            is-link
            :to="{ name: 'ListDemo' }"
          />

          <div class="mt-3 text-[12px] text-[var(--color-text-secondary)]">
            已加载 {{ demoList.length }} 条，finished={{ finished }}，error={{
              error
            }}
          </div>
        </div>
      </van-collapse-item>

      <van-collapse-item name="form" title="表单相关">
        <div class="pt-[8px]">
          <p class="text-[12px] mb-2 text-[var(--color-text-secondary)]">
            完整表单页（校验 +
            <code>AreaPicker</code>
            /
            <code>DateTimePicker</code>
            + 底部提交栏）：
          </p>

          <van-cell
            title="打开表单示例页"
            label="独立全屏页，隐藏 Tabbar，可复制为业务表单"
            is-link
            :to="{ name: 'FormDemo' }"
          />

          <p class="text-[12px] mb-2 mt-4 text-[var(--color-text-secondary)]">
            详情页（
            <code>PageShell</code>
            +
            <code>CardSection</code>
            + 底部操作栏）：
          </p>

          <van-cell
            title="打开详情示例页"
            label="信息展示 + 附件预览，支持路由 id 切换数据"
            is-link
            :to="{ name: 'DetailDemo', params: { id: '1' } }"
          />
        </div>
      </van-collapse-item>

      <van-collapse-item name="feedback" title="操作与反馈">
        <div class="pt-[8px] space-y-4">
          <section>
            <p class="text-[12px] mb-2 text-[var(--color-text-secondary)]">
              底部提交栏（
              <code>StickyActionBar</code>
              ，下方为相对容器内演示）：
            </p>

            <div class="tools-sticky-demo">
              <div class="tools-sticky-demo__body">
                <van-field label="姓名" placeholder="请输入姓名" />
                <van-field label="备注" placeholder="请输入备注" />
              </div>
              <StickyActionBar :fixed="false">
                <van-button plain>重置</van-button>
                <van-button type="primary" @click="onStickySubmit">
                  提交
                </van-button>
              </StickyActionBar>
            </div>
          </section>

          <section>
            <p class="text-[12px] mb-2 text-[var(--color-text-secondary)]">
              二次确认（
              <code>confirm</code>
              from
              <code>@/utils/feedback</code>
              ）：
            </p>
            <van-button block type="primary" plain @click="onDemoConfirm">
              打开确认弹窗
            </van-button>
          </section>

          <section>
            <p class="text-[12px] mb-2 text-[var(--color-text-secondary)]">
              操作菜单（
              <code>ActionSheetMenu</code>
              ）：
            </p>
            <van-button block plain @click="showActionSheet = true">
              打开操作菜单
            </van-button>
            <ActionSheetMenu
              v-model:show="showActionSheet"
              title="更多操作"
              description="请选择要执行的操作"
              :options="[
                { label: '编辑', value: 'edit' },
                { label: '分享', value: 'share' },
                { label: '删除', value: 'delete', color: THEME_COLORS.danger }
              ]"
              @select="onActionSelect"
            />
          </section>
        </div>
      </van-collapse-item>

      <van-collapse-item name="display" title="展示相关">
        <div class="pt-[8px] space-y-3">
          <p class="text-[12px] mb-2 text-[var(--color-text-secondary)]">
            卡片组件（
            <code>BaseCard</code>
            ）：
          </p>

          <BaseCard>
            基础卡片容器，适用于信息分组展示，支持深色模式。
          </BaseCard>

          <BaseCard shadow="md" border>
            带边框与稍强阴影的卡片，内容自行组织标题、按钮等。
          </BaseCard>
        </div>
      </van-collapse-item>
    </van-collapse>
  </div>
</template>

<style scoped>
.tools-collapse :deep(.van-collapse-item__content) {
  padding: 8px 0 2px;
}

.tools-sticky-demo {
  position: relative;
  min-height: 168px;
  border: 1px dashed var(--van-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--van-background);
}

.tools-sticky-demo__body {
  padding: 8px 0 72px;
}
</style>