<script setup lang="ts">
import { LoginOutlined } from "@ant-design/icons-vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api, setToken } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { message } from "ant-design-vue";

const router = useRouter();

const username = ref("");
const password = ref("");
const loading = ref(false);

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isPhone(v: string) {
  return /^\+?\d{6,20}$/.test(v);
}

const submit = async () => {
  const id = username.value.trim();
  const pw = password.value;
  if (!id) {
    void message.warning("请输入邮箱或手机号");
    return;
  }
  if (!(isEmail(id) || isPhone(id))) {
    void message.warning("账号格式不正确，请输入邮箱或手机号");
    return;
  }
  if (!pw || pw.trim().length < 6) {
    void message.warning("请输入至少 6 位密码");
    return;
  }

  loading.value = true;
  try {
    const resp = await api.auth.login(id, pw);
    if (resp.ok && resp.data?.token) {
      setToken(resp.data.token);
      await router.push("/dashboard");
      return;
    }
    void message.error(mapApiMessage(resp.message));
  } catch (e) {
    void message.error(e instanceof Error ? e.message : mapApiMessage(undefined));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="wrap">
    <div class="card">
      <div class="brand">
        <img src="/yl_logo.svg" alt="" class="logo" width="40" height="40" />
        <div class="text">
          <div class="name">数字伊犁</div>
          <div class="sub">管理后台</div>
        </div>
      </div>

      <a-form layout="vertical" @submit.prevent="submit">
        <a-form-item label="操作员账号">
          <a-input
            v-model:value="username"
            size="large"
            placeholder="请输入邮箱或手机号"
            @press-enter="submit"
          />
        </a-form-item>
        <a-form-item label="密码">
          <a-input-password
            v-model:value="password"
            size="large"
            placeholder="请输入密码"
            @press-enter="submit"
          />
        </a-form-item>
        <a-button type="primary" html-type="submit" size="large" block :loading="loading">
          <template #icon><LoginOutlined /></template>
          登录
        </a-button>
      </a-form>

      <div class="hint">
        此处仅后台操作员登录（与门户客户账号不同）。短信登录请使用门户站点。
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  height: 100%;
  display: grid;
  place-items: center;
  padding: 16px;
  background: radial-gradient(circle at 20% 10%, rgba(33, 116, 255, 0.15), transparent 55%),
    radial-gradient(circle at 80% 60%, rgba(0, 0, 0, 0.06), transparent 55%), #f5f7fa;
}
.card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid #e5e8ef;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.logo {
  flex-shrink: 0;
  object-fit: contain;
}
.name {
  font-weight: 800;
  color: #333;
}
.sub {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}
.hint {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}
</style>
