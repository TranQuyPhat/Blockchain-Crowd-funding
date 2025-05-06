import React, { useState, useEffect } from "react";
import { DisplayCampaigns } from "../components";
import { useStateContext } from "../context";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, contract, getUserCampaigns } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await getUserCampaigns();
      console.log('Dữ liệu từ getUserCampaigns:', data);
      setCampaigns(data);
    } catch (error) {
      console.error('Lỗi khi lấy chiến dịch:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [address, contract]);
  const shortenAddress = (addr) => {
    if (!addr) return "Chưa kết nối";
    return `${addr.slice(0, 5)}...`; // Lấy 5 ký tự đầu và thêm "..."
  };
  return (
    <div className="profile-container">
      {/* Phần hiển thị thông tin người dùng */}
      <div className="user-info mb-8">
        <h2 className="font-epilogue font-semibold text-[24px] text-white">
          Hồ sơ người dùng
        </h2>
        <div className="bg-[#1c1c24] p-6 rounded-[10px] mt-4">
          <p className="font-epilogue text-[#808191]">
            <strong>Người dùng:</strong> {shortenAddress(address)}
          </p>
        </div>
      </div>

      {/* Phần hiển thị chiến dịch */}
      <DisplayCampaigns
        title="Tất cả chiến dịch"
        isLoading={isLoading}
        campaigns={campaigns}
      />
    </div>
  );
};

export default Profile;
