<script setup lang="ts">
defineProps<{
  /** 气泡内说明，支持换行 */
  content: string;
}>();
</script>

<template>
  <a-popover placement="bottomLeft" trigger="click" overlay-class-name="help-tip-overlay">
    <template #content>
      <div class="help-tip-body">{{ content }}</div>
    </template>
    <button type="button" class="help-tip-trigger" aria-label="页面说明">?</button>
  </a-popover>
</template>

<style scoped>
.help-tip-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 6px;
  flex-shrink: 0;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
  background: #fafafa;
  color: #666;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  vertical-align: middle;
}
.help-tip-trigger:hover {
  border-color: #2174ff;
  color: #2174ff;
  background: #f0f7ff;
}
</style>

<style>
.help-tip-overlay .ant-popover-inner {
  max-width: 360px;
}
.help-tip-body {
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(0, 0, 0, 0.85);
}
</style>
