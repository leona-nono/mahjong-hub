import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/db-health';

// 公开健康检查：仅回传数据库连通状态与时间戳，不暴露任何业务数据。
// 用于在不登录的情况下验证 Production 的 DATABASE_URL 是否已生效。
export const dynamic = 'force-dynamic';

export async function GET() {
  const dbConnected = await isDbConnected();
  return NextResponse.json({
    dbConnected,
    timestamp: new Date().toISOString()
  });
}
