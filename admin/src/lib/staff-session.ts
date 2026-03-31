import { ref } from "vue";
import { api, type StaffMeDto } from "@/lib/api-client";

/** 顶栏/个人设置共用的当前后台用户资料（登录后拉取，资料保存后刷新） */
export const staffMe = ref<StaffMeDto | null>(null);

export async function refreshStaffMe(): Promise<boolean> {
  const r = await api.auth.me();
  if (!r.ok || !r.data) {
    staffMe.value = null;
    return false;
  }
  staffMe.value = r.data;
  return true;
}
