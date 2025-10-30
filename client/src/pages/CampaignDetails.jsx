import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useStateContext } from "../context";
import {
  CountBox,
  CustomButton,
  Loader,
  Expandable,
  FormField,
} from "../components";
import { calculateBarPercentage, daysLeft } from "../utils";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { share } from "../assets";
import { ExternalLink } from "lucide-react";

const CHAIN_EXPLORER = "https://sepolia.etherscan.io/address/"; // Use appropriate chain

const CampaignDetails = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const {
    getDonations,
    contract,
    address,
    donate,
    withdraw,
    deleteCampaign,
    campaigns,
    isLoading,
    setIsLoading,
  } = useStateContext();
  const [amount, setAmount] = useState("");
  const [donators, setDonators] = useState([]);
  const [campaign, setCampaign] = useState([]);
  const [injectMetaTags, setInjectMetaTags] = useState(false);
  const [eventHistory, setEventHistory] = useState([]);

  useEffect(() => {
    if (contract) {
      fetchDonators();
    }
  }, [contract, address]);

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      const foundCampaign = campaigns.find((c) => c.id === Number(campaignId));
      setCampaign(foundCampaign);
    }
  }, [campaigns, campaignId]);

  const fetchDonators = async () => {
    const data = await getDonations(campaignId);
    setDonators(data);
    // Build event history from on-chain donations; withdrawals will be appended when available
    const donationEvents = (data || []).map((d) => ({
      type: "Donation",
      user: d.donator,
      amount: `${d.donation} ETH`,
      hash: d.txHash || `${campaignId}-${d.donator}-${d.donation}`,
    }));
    setEventHistory(donationEvents);
  };

  const handleDonate = async () => {
    setIsLoading(true);
    if (!address) {
      toast.error("Please connect to MetaMask🦊", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setIsLoading(false);
      return;
    }
    if (amount === 0 || amount === "") {
      toast.error("Please enter a valid donation amount.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setIsLoading(false);
      return;
    }
    try {
      await donate(campaign?.id, amount);
      navigate("/");
    } catch (error) {
      console.error("Error donating:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          image: campaign?.image,
          title: campaign?.title,
          text: campaign?.description,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      console.log("Web Share API not supported");
    }
    setInjectMetaTags(true);
  };
  const handleDelete = async () => {
    setIsLoading(true);
    const confirmDelete = confirm("Do you really want to delete this Campaign");
    if (!confirmDelete) {
      toast.warning("🤔 No campaign is deleted. You've canceled the operation.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setIsLoading(false);
      return;
    }
    await deleteCampaign(campaign?.id);
    navigate("/");
    setIsLoading(false);
  };
  const isOwner = String(campaign?.owner || '').toLowerCase() === String(address || '').toLowerCase();
  const canWithdraw = Number(campaign?.amountCollected || 0) > 0 && Number(campaign?.deadline || 0) < Date.now();

  const handleWithdraw = async () => {
    if (!isOwner) return;
    if (!canWithdraw) {
      toast.error("Cannot withdraw yet (needs funds and after deadline)", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    try {
      setIsLoading(true);
      await withdraw(campaign?.id);
      navigate("/");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  const remainingDays = daysLeft(campaign?.deadline);

  const contractAddr = campaign?.contractAddress || (window.ethereum?.selectedAddress || "0xYourDemoContractAddress");
  const etherscanLink = `${CHAIN_EXPLORER}${contractAddr}`;

  if (campaigns?.length <= 0) return <Loader />;
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {injectMetaTags && (
        <Helmet>
          <meta property="og:title" content={campaign?.title} />
          <meta property="og:description" content={campaign?.description} />
          {campaign?.image && <meta property="og:image" content={campaign?.image} />}
        </Helmet>
      )}
      {isLoading && <Loader />}

      {/* Top: image + progress + stats */}
      <div className="w-full flex md:flex-row flex-col mt-4 gap-8 items-start justify-center">
        <div className="flex-1 flex-col">
          <img src={campaign?.image} alt="campaign" className="w-full h-[410px] object-cover rounded-xl" />
          <div className="relative w-full h-[6px] bg-[#e5e5e5] dark:bg-[#3a3a43] mt-2 rounded-full">
            <div
              className="absolute h-full bg-[#6F01Ec] rounded-full"
              style={{
                width: `${calculateBarPercentage(campaign?.target, campaign?.amountCollected)}%`,
                maxWidth: "100%",
              }}
            ></div>
          </div>
          {/* Etherscan button */}
          <div className="mt-4 flex flex-row items-center gap-3">
            <a href={etherscanLink} target="_blank" rel="noopener noreferrer" className="flex items-center px-5 py-2 glass-card bg-[#22223f]/80 dark:bg-[#262647]/90 text-[#03dac5] rounded-md font-semibold shadow hover:bg-[#25243f] hover:text-[#6F01Ec] transition-colors">
              <ExternalLink className="w-4 h-4 mr-2" /> View On Etherscan
            </a>
          </div>
        </div>
        <div className="flex md:w-[150px] w-full md:flex-wrap sm:flex-row flex-col justify-between sm:items-start items-center gap-6">
          <CountBox title="Days Left" value={remainingDays == 0 ? "Ended" : remainingDays.toString()} />
          <CountBox title={`Raised of ${campaign?.target}`} value={campaign?.amountCollected} />
          <CountBox title="Total Backers" value={donators?.length} />
        </div>
      </div>

      {/* Middle: title/organizer/story/donors */}
      <div className="mt-12 flex lg:flex-row flex-col gap-8 items-start">
        <div className="flex-[2] flex flex-col gap-10">
          <div>
            <h4 className="font-epilogue font-semibold text-2xl text-black dark:text-white uppercase flex gap-2 items-center">
              {campaign?.title}
              <img className="h-8 cursor-pointer" onClick={handleShare} src={share} alt="share" />
            </h4>
            <p className="mt-1 font-epilogue font-normal leading-[18px] text-[#4d4d4d] dark:text-[#808191]">
              {campaign?.category}
            </p>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-lg text-black dark:text-white uppercase">Organizer</h4>
            <div className="mt-5 flex flex-row items-center flex-wrap gap-4">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#f0f0f0] dark:bg-[#2c2f32] cursor-pointer overflow-hidden">
                <Jazzicon className="w-1/2 h-1/2 object-contain" diameter={52} seed={jsNumberForAddress(`${campaign?.owner}`)} />
              </div>
              <div className="w-full">
                <h4 className="font-epilogue font-semibold text-sm text-black dark:text-white truncate ">
                  {campaign?.name} is organizing this fundraiser for {campaign?.category} category.
                </h4>
                <p className="mt-1 font-epilogue font-normal text-[13px] text-[#4d4d4d] dark:text-[#808191] truncate">{campaign?.owner}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-lg text-black dark:text-white uppercase">Story</h4>
            <div className="mt-5 text-[#4d4d4d] dark:text-[#808191]">
              <Expandable>{campaign?.description}</Expandable>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-lg text-black dark:text-white uppercase">Donors</h4>
            <div className=" mt-5 flex flex-col gap-4">
              {donators?.length > 0 ? (
                donators?.map((item, index) => (
                  <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                    <p className="font-epilogue font-normal   text-[#78787c] dark:text-[#b2b3bd] leading-[26px] truncate">
                      {index + 1}. {item.donator}
                    </p>
                    <p className="font-epilogue font-normal   text-[#4d4d4d] dark:text-[#808191] leading-[26px] mr-3">{item.donation}</p>
                  </div>
                ))
              ) : (
                <p className="font-epilogue font-normal   text-[#4d4d4d] dark:text-[#808191] leading-[26px] text-justify">No Donors yet. Be the first one to donate!</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: actions */}
        <div className="flex-1">
          {isOwner ? (
            <>
              <h4 className="font-epilogue font-semibold text-lg text-black dark:text-white uppercase">Manage</h4>
              <div className=" mt-5 flex flex-col p-5 bg-[#f2f2f2] dark:bg-[#1c1c24] rounded-xl gap-3">
                <CustomButton
                  btnType="button"
                  title="Withdraw"
                  styles={`w-full ${canWithdraw ? 'bg-[#6F01Ec]' : 'bg-gray-400 cursor-not-allowed'}`}
                  isDisabled={!canWithdraw}
                  handleClick={handleWithdraw}
                />
                <CustomButton
                  btnType="button"
                  title="Delete Campaign"
                  styles={`w-full bg-[#e00b0b]`}
                  handleClick={handleDelete}
                />
                {!canWithdraw && (
                  <p className="text-xs text-[#4d4d4d] dark:text-[#808191]">Withdraw enabled only after deadline and if funds exist.</p>
                )}
              </div>
            </>
          ) : (
            <>
              <h4 className="font-epilogue font-semibold text-lg text-black dark:text-white uppercase">Fund</h4>
              <div className=" mt-5 flex flex-col p-5 bg-[#f2f2f2] dark:bg-[#1c1c24] rounded-xl ">
                <p className=" font-epilogue font-medium text-[20px ] leading-8 text-center text-[#4d4d4d] dark:text-[#808191] ">Fund the campaign</p>
                <div className="mt-6">
                  <FormField labelName="Amount" placeholder="ETH 0.1" inputType="number" value={amount} handleChange={(e) => setAmount(e.target.value)} />
                  <div className="my-5 p-4 bg-[#eaeaea] dark:bg-[#13131a] rounded-xl ">
                    <h4 className="font-epilogue font-semibold text-sm leading-[22px] text-black dark:text-white ">Empower change. Support now.</h4>
                    <p className=" mt-5 font-epilogue font-normal leading-[22px] text-[#4d4d4d] dark:text-[#808191] ">Transform lives, shape the future. Your donation fuels progress. Join us, make an impact.</p>
                  </div>
                  <CustomButton
                    btnType="button"
                    title={remainingDays === 0 ? "Deadline Reached" : "Fund Campaign"}
                    styles={`w-full bg-[#6F01Ec] ${remainingDays === 0 && "!text-white"}`}
                    isDisabled={remainingDays === 0}
                    handleClick={handleDonate}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Blockchain Transparency section */}
      <section className="mt-12 glass-card bg-[#191927]/80 dark:bg-[#13131a]/90 p-6 rounded-xl">
        <h2 className="text-lg font-bold text-[#03dac5] mb-2">Blockchain Transparency</h2>
        <p className="text-gray-400 text-sm mb-3">All donations and withdrawals are public events on the blockchain. You can verify every transaction by Campaign ID or view campaign activity history live.</p>
        <div className="overflow-x-auto">
          <table className="w-full  text-left">
            <thead>
              <tr className="text-[#6F01Ec] font-semibold">
                <th>Type</th>
                <th>User</th>
                <th>Amount</th>
                <th>Txn Hash</th>
              </tr>
            </thead>
            <tbody>
              {eventHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-4">No data as of now</td>
                </tr>
              ) : (
                eventHistory.map((evt) => (
                  <tr key={evt.hash} className="hover:bg-[#2c2f32]/20 transition text-white">
                    <td>{evt.type}</td>
                    <td>{evt.user}</td>
                    <td>{evt.amount}</td>
                    <td>
                      {String(evt.hash).startsWith("0x") ? (
                        <a href={`https://sepolia.etherscan.io/tx/${evt.hash}`} target="_blank" rel="noopener noreferrer" className="text-[#03dac5] underline inline-flex items-center">View <ExternalLink className="w-3 h-3 ml-1" /></a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* Removed Leaderboard (Top Donors) section as requested */}
    </div>
  );
};

export default CampaignDetails;
