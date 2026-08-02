import { NextResponse } from "next/server";
import { getUserPermissions, requireActiveUser } from "@/lib/rbac";

export async function GET() {
  try {
    const user = await requireActiveUser();
    const permissionsMap = await getUserPermissions(user.id);
    
    // Convert Map to Object for JSON response
    const permissions: Record<string, any> = {};
    permissionsMap.forEach((value, key) => {
      permissions[key] = value;
    });

    return NextResponse.json({ success: true, permissions });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "USER_NOT_FOUND" || error.message === "ACCOUNT_DISABLED") {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
