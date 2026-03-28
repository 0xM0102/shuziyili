<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <a-card :bordered="true">
    <a-space direction="vertical" size="small" style="width: 100%">
      <a-space wrap>
        <a-button type="primary" @click="router.push('/portal-users')">平台用户</a-button>
        <a-button @click="router.push('/staff-users')">后台账号</a-button>
        <a-button @click="router.push('/articles')">文章管理</a-button>
        <a-button @click="router.push('/banners')">首页配置</a-button>
      </a-space>
    </a-space>
  </a-card>
</template>
