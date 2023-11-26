import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  const username = String(process.env.BRIGH_DATA_USERNAME);
  const password = String(process.env.BRIGH_DATA_PASSWORD);

  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "bird.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    const response = await axios.get(url, options);

    const $ = cheerio.load(response.data);

    const title = $("#productTitle").text().trim();
    console.log(title);

    // let elements = ["#productTitle"];

    // let priceText;
    // for (const element of elements) {
    //   console.log("inside..");
    //   if (element) {
    //     priceText = $(element).text().trim();
    //   }

    //   console.log(priceText, "this is price text");

    const currentPrice = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $("a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base"),
      $(".a-price.a-text-price.a-size-medium.apexPriceToPay span.a-offscreen"),
      $(".a-price.a-text-price")
    );

    const origianlPrice = extractPrice(
      $(
        "td.a-span12.a-color-secondary.a-size-base span.a-price.a-text-price.a-size-base span.a-offscreen"
      ),
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listprice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ==
      "currently unavailable";

    const images = $("#landingImage").attr("data-a-dynamic-image") || "";

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($(".a-price-symbol"));

    let discountRate: number | string;
    discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");

    const description = extractDescription($);

    // console.log(
    //   currentPrice,
    //   "current Price",
    //   origianlPrice,
    //   "original price",
    //   outOfStock,
    //   "currently unavailable",
    //   imageUrls,
    //   "image",
    //   currency,
    //   "currency",
    //   discountRate,
    //   "discount rate",
    //   description,
    //   "description"
    // );

    discountRate =
      ((Number(origianlPrice) - Number(currentPrice)) / Number(origianlPrice)) *
      100;
    const data = {
      url,
      currency: currency || "$",
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice),
      originalPrice: Number(origianlPrice),
      priceHistory: [],
      discountRate: Number(discountRate) || 15,
      category: "category",
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(origianlPrice),
      highestPrice: Number(origianlPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(origianlPrice),
    };

    // console.log(data, "data..");
    return data;
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}
