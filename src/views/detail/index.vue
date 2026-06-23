<script setup name="DetailDemo">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast } from "vant";
import "vant/es/cell/style";
import "vant/es/tag/style";
import "vant/es/button/style";
import "vant/es/toast/style";

import PageShell from "@/components/PageShell/index.vue";
import CardSection from "@/components/CardSection/index.vue";
import FilePreview from "@/components/FilePreview/index.vue";
import StickyActionBar from "@/components/StickyActionBar/index.vue";
import ActionSheetMenu from "@/components/ActionSheetMenu/index.vue";
import { THEME_COLORS } from "@/constants/theme";

const route = useRoute();
const router = useRouter();
const showActionSheet = ref(false);

const detailMap = {
  "1": {
    id: "1",
    status: "处理中",
    statusType: "primary",
    title: "工单 WO20260318001",
    subtitle: "提交于 2026-03-18 14:30",
    name: "张三",
    idCard: "330106199001011234",
    region: "浙江省 / 杭州市 / 西湖区",
    mobile: "13800138000",
    email: "zhangsan@example.com",
    tags: "Vue、Vant",
    date: "2026年03月20日",
    time: "14:30",
    orderStatus: "处理中",
    remark: "希望尽快处理，如有疑问请联系。",
    files: [
      {
        name: "申请说明.pdf",
        url: "https://fastly.jsdelivr.net/npm/@vant/assets/icon-demo.pdf",
        type: "application/pdf"
      },
      {
        name: "附件图片.jpg",
        url: "https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg",
        type: "image/jpeg"
      }
    ]
  },
  "2": {
    id: "2",
    status: "已完成",
    statusType: "success",
    title: "工单 WO20260317002",
    subtitle: "提交于 2026-03-17 09:15",
    name: "李四",
    idCard: "330106199002021234",
    region: "浙江省 / 杭州市 / 滨江区",
    mobile: "13900139000",
    email: "lisi@example.com",
    tags: "Pinia、TypeScript",
    date: "2026年03月19日",
    time: "10:00",
    orderStatus: "已完成",
    remark: "",
    files: []
  }
};

const detail = computed(() => {
  const id = String(route.params.id || "1");
  return detailMap[id] || detailMap["1"];
});

function onEdit() {
  router.push({ name: "FormDemo" });
}

function onMoreSelect({ value }) {
  showToast(`选择了：${value}`);
}

function onMore() {
  showActionSheet.value = true;
}
</script>

<template>
  <PageShell>
    <CardSection>
      <div class="detail-summary">
        <van-tag :type="detail.statusType" plain>{{ detail.status }}</van-tag>
        <p class="detail-summary__title">{{ detail.title }}</p>
        <p class="detail-summary__subtitle">{{ detail.subtitle }}</p>
      </div>
    </CardSection>

    <CardSection title="基本信息">
      <van-cell title="姓名" :value="detail.name" />
      <van-cell title="身份证" :value="detail.idCard" />
      <van-cell title="所在地区" :value="detail.region" />
      <van-cell title="手机号" :value="detail.mobile" />
      <van-cell title="邮箱" :value="detail.email" />
    </CardSection>

    <CardSection title="预约信息">
      <van-cell title="技术栈" :value="detail.tags" />
      <van-cell title="预约日期" :value="detail.date" />
      <van-cell title="预约时间" :value="detail.time" />
      <van-cell title="工单状态" :value="detail.orderStatus" />
      <van-cell v-if="detail.remark" title="备注" :label="detail.remark" />
    </CardSection>

    <CardSection v-if="detail.files.length" title="附件">
      <div class="detail-files">
        <FilePreview :files="detail.files" />
      </div>
    </CardSection>

    <StickyActionBar :placeholder="false">
      <van-button plain @click="onMore">更多</van-button>
      <van-button type="primary" @click="onEdit">编辑</van-button>
    </StickyActionBar>

    <ActionSheetMenu
      v-model:show="showActionSheet"
      title="更多操作"
      :options="[
        { label: '分享', value: 'share' },
        { label: '导出', value: 'export' },
        { label: '删除', value: 'delete', color: THEME_COLORS.danger }
      ]"
      @select="onMoreSelect"
    />
  </PageShell>
</template>

<style scoped>
.detail-summary {
  padding: 16px;
}

.detail-summary__title {
  margin: 10px 0 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-all;
}

.detail-summary__subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--color-text-secondary, var(--van-text-color-2));
}

.detail-files {
  padding: 12px 16px 16px;
}
</style>
