// 301 /driver?d=<id> → /drivers/<id>  (clean, no query pass-through)
export default async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("d");
  return new Response(null, {
    status: 301,
    headers: { Location: id ? `/drivers/${id}` : "/drivers" },
  });
};

export const config = { path: "/driver" };
