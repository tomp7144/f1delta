// Runs before redirect rules and static files — no query pass-through possible.
export default (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("d");
  return Response.redirect(
    new URL(id ? `/drivers/${id}` : "/drivers", req.url).href,
    301
  );
};

export const config = { path: "/driver" };
