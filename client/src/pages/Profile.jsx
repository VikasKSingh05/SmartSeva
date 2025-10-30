import React, { useEffect, useState } from "react";
import { useStateContext } from "../context";
import { DisplayCampaigns } from "../components";
import ProtectedRoute from "../components/ProtectedRoute";

const Profile = () => {
  const { address, contract, getUserCampaigns, userCampaigns } = useStateContext();
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    let isMounted = true; 
    const run = async () => {
      if (contract && address && isMounted) {
        setLoadingUser(true);
        await getUserCampaigns();
        setLoadingUser(false);
      }
    };

    run();

    return () => {
      isMounted = false; 
    };
  }, [contract, address]); 
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DisplayCampaigns
          title="My Campaigns"
          isLoading={loadingUser}
          campaigns={userCampaigns}
        />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
