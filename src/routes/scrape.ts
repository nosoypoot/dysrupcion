interface ScrapeBody {
  url: string;
}

interface OgData {
  title: string;
  date: string | null;
  image: string | null;
  url: string;
}

export async function handleScrape(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: ScrapeBody;
  try {
    body = await request.json() as ScrapeBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.url) {
    return Response.json({ error: "Missing required field: url" }, { status: 400 });
  }

  // Mock mode: return fake OG data based on the URL.
  // In production this would fetch the URL and parse <meta property="og:*"> tags.
  const ogData: OgData = getMockOgData(body.url);

  return Response.json({ ok: true, og: ogData });
}

function getMockOgData(url: string): OgData {
  if (url.includes("lu.ma")) {
    return {
      title: "Merida Tech Event on Lu.ma",
      date: "2026-04-12T18:00:00-06:00",
      image: "https://images.lumacdn.com/event-covers/placeholder.png",
      url,
    };
  }

  if (url.includes("meetup.com")) {
    return {
      title: "Meetup Event in Merida",
      date: "2026-04-19T19:00:00-06:00",
      image: "https://secure.meetupstatic.com/photos/event/placeholder.png",
      url,
    };
  }

  if (url.includes("partiful")) {
    return {
      title: "Community Gathering via Partiful",
      date: "2026-04-25T17:00:00-06:00",
      image: "https://partiful.com/img/placeholder.png",
      url,
    };
  }

  return {
    title: "Event from " + new URL(url).hostname,
    date: null,
    image: null,
    url,
  };
}
