import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import path from "path";
import fs from "fs/promises";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(url: string, retries: number = 0): Promise<any> {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    return response;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.warn(`Retry ${retries + 1} for URL: ${url}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries + 1);
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const decodedUrl = decodeURIComponent(url);

  try {
    const imageResponse = await fetchWithRetry(decodedUrl);
    const contentType = imageResponse.headers["content-type"] || "image/jpeg";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(imageResponse.data, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error proxying image:", error);

    // Return a default image instead of a JSON error
    const defaultImagePath = path.join(
      process.cwd(),
      "public",
      "placeholder-image.jpg"
    );
    const defaultImageBuffer = await fs.readFile(defaultImagePath);

    const headers = new Headers();
    headers.set("Content-Type", "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(defaultImageBuffer, {
      status: 200,
      headers,
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return new NextResponse(null, {
    status: 204,
    headers,
  });
}
