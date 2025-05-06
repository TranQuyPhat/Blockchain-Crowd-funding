import { ethers } from "ethers";
import React, { createContext, useContext, useState } from "react";
import CrowdFundingABI from "../abis/CrowdFunding.json"; // bạn cần đúng ABI và path

const StateContext = createContext();

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const StateContextProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState(null);

  // Kết nối Metamask
  const connect = async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(accounts[0]);

      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      const tempSigner = tempProvider.getSigner();
      const tempContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CrowdFundingABI.abi,
        tempSigner
      );

      setProvider(tempProvider);
      setSigner(tempSigner);
      setContract(tempContract);
    } else {
      alert("Please install MetaMask");
    }
  };

  // Tạo chiến dịch
  const publishCampaign = async (form) => {
    try {
      console.log("CONTRACT:::", contract);

      const tx = await contract.createCampaign(
        address,
        form.title,
        form.description,
        ethers.utils.parseEther(form.target + ""),
        new Date(form.deadline + "").getTime(),
        form.image
      );

      await tx.wait();
      console.log("Contract call success", tx);
    } catch (error) {
      console.log("Contract call failure", error);
    }
  };

  // Lấy tất cả chiến dịch
  const getCampaigns = async () => {
    const campaigns = await contract.getCampaigns();

    const parsedCampaigns = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      pId: i,
    }));

    return parsedCampaigns;
  };

  // Lấy chiến dịch của người dùng hiện tại
  const getUserCampaigns = async () => {
    try {
      if (!contract) throw new Error("Hợp đồng chưa được khởi tạo!");
      if (!address) {
        console.warn("Ví chưa kết nối");
        return [];
      }

      // Gọi trực tiếp hàm getUserCampaigns từ hợp đồng (khuyến nghị)
      const campaigns = await contract.getUserCampaigns(address);

      console.log("Raw data từ getUserCampaigns:", campaigns);

      const parsedCampaigns = campaigns.map((campaign, i) => ({
        owner: campaign.owner.toLowerCase(), // Chuẩn hóa địa chỉ
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(
          campaign.amountCollected.toString()
        ),
        image: campaign.image,
        pId: i,
      }));

      console.log("Parsed user campaigns:", parsedCampaigns);
      return parsedCampaigns;
    } catch (error) {
      console.error("Lỗi khi lấy chiến dịch của người dùng:", error);
      return [];
    }
  };
  // Gửi tiền ủng hộ
  const donate = async (pId, amount) => {
    const tx = await contract.donateToCampaign(pId, {
      value: ethers.utils.parseEther(amount),
    });

    await tx.wait();
    return tx;
  };

  // Lấy danh sách người đã ủng hộ
  const getDonations = async (pId) => {
    try {
      if (!contract) throw new Error("Hợp đồng chưa được khởi tạo!");

      const [donators, donations] = await contract.getDonators(pId);
      const parsedDonations = donators.map((donator, i) => ({
        donator: donator.toLowerCase(), // Chuẩn hóa địa chỉ
        donation: ethers.utils.formatEther(donations[i].toString()),
      }));

      console.log("Parsed donations:", parsedDonations);
      return parsedDonations;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ủng hộ:", error);
      return [];
    }
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
