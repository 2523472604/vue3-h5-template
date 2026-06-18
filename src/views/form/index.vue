<script setup name="FormDemo">
import { ref } from "vue";
import { showSuccessToast } from "vant";
import "vant/es/form/style";
import "vant/es/field/style";
import "vant/es/button/style";
import "vant/es/toast/style";

import PageShell from "@/components/PageShell/index.vue";
import CardSection from "@/components/CardSection/index.vue";
import PopupMultiSelect from "@/components/PopupMultiSelect/index.vue";
import PopupSelect from "@/components/PopupSelect/index.vue";
import AreaPicker from "@/components/AreaPicker/index.vue";
import DateTimePicker from "@/components/DateTimePicker/index.vue";
import StickyActionBar from "@/components/StickyActionBar/index.vue";
import { confirm } from "@/utils/feedback";
import {
  ruleChineseName,
  ruleEmail,
  ruleIdCard,
  ruleMobile,
  ruleRequired
} from "@/utils/validate";

const formRef = ref();

const tagOptions = [
  { label: "Vue", value: "vue" },
  { label: "Vite", value: "vite" },
  { label: "Vant", value: "vant" },
  { label: "Pinia", value: "pinia" },
  { label: "TypeScript", value: "ts" },
  { label: "Tailwind", value: "tailwind" }
];

const statusOptions = [
  { label: "待处理", value: "pending" },
  { label: "处理中", value: "processing" },
  { label: "已完成", value: "done" },
  { label: "已关闭", value: "closed", disabled: true }
];

function createEmptyForm() {
  return {
    name: "",
    mobile: "",
    email: "",
    idCard: "",
    region: null,
    tags: [],
    date: "",
    time: "",
    status: "",
    remark: ""
  };
}

const form = ref(createEmptyForm());

function onReset() {
  form.value = createEmptyForm();
  formRef.value?.resetValidation();
}

async function onSubmit() {
  try {
    await confirm({
      title: "确认提交",
      message: "确定要提交当前表单吗？"
    });
    showSuccessToast("提交成功");
    console.log("form submit:", { ...form.value });
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <PageShell>
    <van-form ref="formRef" required="auto" label-width="6.2em" @submit="onSubmit">
      <CardSection title="基本信息" variant="form">
        <van-field
          v-model="form.name"
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          clearable
          :rules="[ruleRequired('请输入姓名'), ruleChineseName()]"
        />
        <van-field
          v-model="form.idCard"
          name="idCard"
          label="身份证"
          maxlength="18"
          placeholder="请输入身份证号"
          clearable
          :rules="[ruleRequired('请输入身份证号'), ruleIdCard()]"
        />
        <AreaPicker
          v-model="form.region"
          field-label="所在地区"
          title="选择省市区"
          placeholder="请选择省市区"
          required
        />
        <van-field
          v-show="false"
          name="region"
          :model-value="form.region?.label || ''"
          :rules="[ruleRequired('请选择所在地区')]"
        />
        <van-field
          v-model="form.mobile"
          name="mobile"
          label="手机号"
          type="tel"
          maxlength="11"
          placeholder="请输入手机号"
          clearable
          :rules="[ruleRequired('请输入手机号'), ruleMobile()]"
        />
        <van-field
          v-model="form.email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          clearable
          :rules="[ruleRequired('请输入邮箱'), ruleEmail()]"
        />
      </CardSection>

      <CardSection title="预约信息" variant="form">
        <PopupMultiSelect
          v-model="form.tags"
          field-label="技术栈"
          title="选择技术栈"
          placeholder="请选择技术栈"
          :options="tagOptions"
          required
        />
        <van-field
          v-show="false"
          name="tags"
          :model-value="form.tags.length ? form.tags.join(',') : ''"
          :rules="[ruleRequired('请选择技术栈')]"
        />
        <DateTimePicker
          v-model="form.date"
          type="date"
          field-label="预约日期"
          title="选择日期"
          display-format="年月日"
        />
        <DateTimePicker
          v-model="form.time"
          type="time"
          field-label="预约时间"
          title="选择时间"
        />
        <PopupSelect
          v-model="form.status"
          field-label="工单状态"
          title="选择状态"
          :options="statusOptions"
        />
        <van-field
          v-model="form.remark"
          name="remark"
          label="备注"
          type="textarea"
          rows="2"
          autosize
          maxlength="200"
          show-word-limit
          placeholder="选填"
        />
      </CardSection>
    </van-form>

    <StickyActionBar :placeholder="false">
      <van-button plain @click="onReset">重置</van-button>
      <van-button type="primary" @click="formRef?.submit()">提交</van-button>
    </StickyActionBar>
  </PageShell>
</template>
