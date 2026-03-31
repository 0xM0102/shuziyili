<script setup lang="ts">
import { UploadOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, reactive, ref } from "vue";
import { api, type StaffRole } from "@/lib/api-client";
import { mapApiMessage } from "@/lib/auth-messages";
import { refreshStaffMe } from "@/lib/staff-session";
import { STAFF_ROLE_LABELS, getStaffAvatarInitial } from "@/lib/staff-ui";
import { message } from "ant-design-vue";

const profileLoading = ref(false);
const savingProfile = ref(false);
const savingPassword = ref(false);
const uploadingAvatar = ref(false);

const identifier = ref("");
const role = ref<StaffRole | "">("");

const form = reactive({
  nickname: "",
  avatarUrl: "",
  bio: "",
});

const pwd = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const avatarChar = computed(() => {
  return getStaffAvatarInitial({
    nickname: form.nickname,
    identifier: identifier.value,
  });
});

const roleText = computed(() => {
  if (!role.value) return "—";
  return STAFF_ROLE_LABELS[role.value];
});

async function load() {
  profileLoading.value = true;
  try {
    const r = await api.auth.me();
    if (!r.ok || !r.data) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    identifier.value = r.data.identifier;
    role.value = r.data.role;
    form.nickname = r.data.nickname ?? "";
    form.avatarUrl = r.data.avatarUrl ?? "";
    form.bio = r.data.bio ?? "";
  } finally {
    profileLoading.value = false;
  }
}

async function saveProfile() {
  savingProfile.value = true;
  try {
    const r = await api.auth.updateProfile({
      nickname: form.nickname,
      avatarUrl: form.avatarUrl.trim(),
      bio: form.bio,
    });
    if (!r.ok || !r.data) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("资料已保存");
    await refreshStaffMe();
  } finally {
    savingProfile.value = false;
  }
}

async function beforeAvatarUpload(file: File) {
  uploadingAvatar.value = true;
  try {
    const r = await api.admin.uploadMedia(file, { scope: "staff_avatar" });
    if (!r.ok || !r.data) {
      void message.error(mapApiMessage(r.message));
      return false;
    }
    const url = typeof r.data.url === "string" ? r.data.url.trim() : "";
    if (!url) {
      void message.error("上传成功但未返回图片地址");
      return false;
    }
    form.avatarUrl = url;
    void message.success("头像已上传，请点击「保存资料」写入账号");
    return false;
  } finally {
    uploadingAvatar.value = false;
  }
}

async function savePassword() {
  if (pwd.newPassword.length < 6) {
    void message.warning("新密码至少 6 位");
    return;
  }
  if (pwd.newPassword !== pwd.confirmPassword) {
    void message.warning("两次输入的新密码不一致");
    return;
  }
  savingPassword.value = true;
  try {
    const r = await api.auth.changePassword(pwd.oldPassword, pwd.newPassword);
    if (!r.ok) {
      void message.error(mapApiMessage(r.message));
      return;
    }
    void message.success("密码已修改");
    pwd.oldPassword = "";
    pwd.newPassword = "";
    pwd.confirmPassword = "";
  } finally {
    savingPassword.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <div class="staff-profile">
    <a-row :gutter="[20, 20]">
      <a-col :xs="24" :lg="15">
        <a-card :bordered="true" title="基本资料" class="profile-card" :loading="profileLoading">
          <template #extra>
            <a-button type="primary" :loading="savingProfile" @click="saveProfile">保存资料</a-button>
          </template>

          <a-alert
            type="info"
            show-icon
            class="profile-tip"
            message="头像与文章、Banner 相同，使用 COS 媒体库上传后的 URL；也可先到「媒体库」上传再粘贴链接。"
          />

          <a-descriptions bordered size="small" :column="1" class="profile-desc">
            <a-descriptions-item label="登录账号">{{ identifier || "—" }}</a-descriptions-item>
            <a-descriptions-item label="身份">{{ roleText }}（{{ role }}）</a-descriptions-item>
          </a-descriptions>

          <a-form layout="vertical" class="profile-form">
            <a-form-item label="头像">
              <div class="avatar-row">
                <!-- 使用原生 img 展示 URL，避免 a-avatar 在图片曾加载失败后内部状态导致新 URL 仍显示占位字 -->
                <img
                  v-if="form.avatarUrl"
                  :key="form.avatarUrl"
                  :src="form.avatarUrl"
                  alt=""
                  class="profile-avatar-img"
                />
                <a-avatar v-else :size="72" class="profile-avatar-preview">
                  {{ avatarChar }}
                </a-avatar>
                <div class="avatar-side">
                  <a-upload
                    :before-upload="beforeAvatarUpload"
                    :show-upload-list="false"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                  >
                    <a-button :loading="uploadingAvatar">
                      <template #icon><UploadOutlined /></template>
                      上传到 COS
                    </a-button>
                  </a-upload>
                  <span class="avatar-hint">jpg / png / gif / webp</span>
                </div>
              </div>
              <a-input
                v-model:value="form.avatarUrl"
                class="avatar-url-input"
                placeholder="https://...（上传后自动填入）"
                allow-clear
              />
            </a-form-item>
            <a-form-item label="昵称">
              <a-input v-model:value="form.nickname" :maxlength="64" show-count placeholder="可选" />
            </a-form-item>
            <a-form-item label="简介">
              <a-textarea v-model:value="form.bio" :rows="3" :maxlength="500" show-count placeholder="可选" />
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="9">
        <a-card :bordered="true" title="修改密码" class="profile-card">
          <p class="pwd-intro">修改登录密码需填写当前密码；新密码至少 6 位。</p>
          <a-form layout="vertical" class="pwd-form">
            <a-form-item label="当前密码" required>
              <a-input-password v-model:value="pwd.oldPassword" autocomplete="current-password" />
            </a-form-item>
            <a-form-item label="新密码" required>
              <a-input-password v-model:value="pwd.newPassword" autocomplete="new-password" placeholder="至少 6 位" />
            </a-form-item>
            <a-form-item label="确认新密码" required>
              <a-input-password v-model:value="pwd.confirmPassword" autocomplete="new-password" />
            </a-form-item>
            <a-form-item class="pwd-actions">
              <a-button type="primary" block :loading="savingPassword" @click="savePassword">修改密码</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.staff-profile {
  width: 100%;
}

.profile-card {
  height: 100%;
}

.profile-tip {
  margin-bottom: 16px;
}

.profile-desc {
  margin-bottom: 20px;
  max-width: 100%;
}

.profile-form {
  max-width: 100%;
}

.avatar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
}

.profile-avatar-preview {
  flex-shrink: 0;
  border: 2px solid #eef0f4;
}

.profile-avatar-img {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eef0f4;
  display: block;
}

.avatar-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.avatar-hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.avatar-url-input {
  margin-top: 10px;
}

.pwd-intro {
  margin: 0 0 16px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  line-height: 1.6;
}

.pwd-form :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

.pwd-actions {
  margin-bottom: 0;
  padding-top: 4px;
}
</style>
