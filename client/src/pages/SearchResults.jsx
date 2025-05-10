import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DisplayCampaigns } from "../components";
import { useStateContext } from "../context";

const SearchResults = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const { getCampaigns } = useStateContext();
  const location = useLocation();

  // Lấy từ khóa tìm kiếm từ query string
  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const data = await getCampaigns();
        const filteredCampaigns = data.filter((campaign) => {
          const title = (campaign.title || "").toLowerCase();
          const description = (campaign.description || "").toLowerCase();
          const owner = (campaign.owner || "").toLowerCase();
          return (
            title.includes(query.toLowerCase()) ||
            description.includes(query.toLowerCase()) ||
            owner.includes(query.toLowerCase())
          );
        });
        setCampaigns(filteredCampaigns);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm chiến dịch:", error);
      }
      setIsLoading(false);
    };

    if (query) fetchCampaigns();
  }, [query, getCampaigns]);

  return (
    <DisplayCampaigns
      title={`Search Results for "${query}"`}
      isLoading={isLoading}
      campaigns={campaigns}
    />
  );
};

export default SearchResults;
