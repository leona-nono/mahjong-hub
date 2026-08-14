import { auth } from '@/auth';
import { prisma } from '@/lib/db';

/** Auth.js session user id, with email lookup if the callback omitted id. */
export async function requireUserId(): Promise<string | null> {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user) return null;
  if (user.id) return user.id;
  if (!user.email) return null;
  const row = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true }
  });
  return row?.id ?? null;
}
