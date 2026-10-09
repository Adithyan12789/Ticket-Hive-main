import React, { useState, useEffect } from "react";
import TheaterOwnersTable from "./TheaterOwnersTable";
import { useGetTheaterOwnerDataQuery } from "../../Store/AdminApiSlice";
import AdminLayout from "./AdminLayout";
import Loader from "../../Features/User/Loader";
import { Theater } from "../../Core/TheaterTypes";

const TheaterOwners: React.FC = () => {
  const [theaterOwnersData, settheaterOwnersData] = useState<Theater[]>([]);

  // Use the query hook directly
  const { data: theaterOwnersDataFromApi, isLoading, isError, error, refetch: refetchQuery } = useGetTheaterOwnerDataQuery(undefined);

  const refetchData = () => {
    refetchQuery();
  };

  useEffect(() => {
    document.title = "Theater Owners List";
  }, []);

  useEffect(() => {
    if (theaterOwnersDataFromApi) {
      console.log("Full API res: ", theaterOwnersDataFromApi);
      settheaterOwnersData(theaterOwnersDataFromApi);
    }
  }, [theaterOwnersDataFromApi]);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 font-medium">
          Error:{" "}
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <AdminLayout adminName={"Adithyan"}>
      <div className="p-4 md:p-8">
        <TheaterOwnersTable theaterOwners={theaterOwnersData} refetchData={refetchData} />
      </div>
    </AdminLayout>
  );
};

export default TheaterOwners;
