export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Response.json({
    hasUrl: !!url,
    hasKey: !!key,
    urlPrefix: url?.slice(0, 40) ?? null,
    keyPrefix: key?.slice(0, 20) ?? null,
    keyLength: key?.length ?? 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    allNextPublicKeys: Object.keys(process.env).filter((k) => k.startsWith("NEXT_PUBLIC_")),
  });
}
