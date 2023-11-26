"use client";
import { scrapeAndStoreProduct } from "@/lib/actions";
import { useState, FormEvent } from "react";

const SearchBar = () => {
  const [searchPrompt, setSearchPrompt] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>();

  const isValidAmazonProductURL = (url: string | undefined) => {
    try {
      if (url) {
        const parsedURL = new URL(url);
        const hostName = parsedURL.hostname;

        if (
          hostName.includes("amazon.com") ||
          hostName.includes("amazon.") ||
          hostName.endsWith("amazon")
        ) {
          return true;
        }
      }
    } catch (error) {
      return false;
    }
    return false;
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidAmazonProductURL(searchPrompt);

    if (!isValidLink) return alert("Please enter a valid amazon link");

    try {
      if (searchPrompt) {
        const product = await scrapeAndStoreProduct(searchPrompt);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPrompt}
        placeholder="enter product link?"
        className="searchbar-input"
        onChange={(e) => setSearchPrompt(e.target.value)}
      />

      <button type="submit" className="searchbar-btn">
        {isLoading ? "Searching.." : "Search"}
      </button>
    </form>
  );
};

export default SearchBar;
