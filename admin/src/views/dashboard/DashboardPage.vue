<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <a-card title="仪表盘（占位）" :bordered="true">
    <a-space direction="vertical" size="small" style="width: 100%">
      <div>这里后续放：内容数据概览、待审核、访问趋势等。</div>
      <a-space wrap>
        <a-button type="primary" @click="router.push('/portal-users')">平台用户</a-button>
        <a-button @click="router.push('/staff-users')">后台账号</a-button>
        <a-button @click="router.push('/articles')">文章管理</a-button>
        <a-button @click="router.push('/banners')">首页配置</a-button>
      </a-space>
      <a-alert
        type="info"
        show-icon
        message="提示"
        description="「平台用户」为门户注册客户；「后台账号」为可登录本后台的操作员，两套数据相互独立。"
      />
    </a-space>
  </a-card>
</template>
