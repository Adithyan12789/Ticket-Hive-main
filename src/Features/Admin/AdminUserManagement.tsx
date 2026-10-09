import React, { useState, useEffect } from "react";
import UserTable from "./UserTable";
import { useGetUserDataQuery } from "../../Store/AdminApiSlice";
import AdminLayout from "./AdminLayout";
import Loader from "../../Features/User/Loader";
import { User } from "../../Core/UserTypes";

const AdminUser: React.FC = () => {
  const [usersData, setUsersData] = useState<User[]>([]);

  // Use the query hook directly instead of mutation
  const { data: userDataFromApi, isLoading, isError, error, refetch: refetchQuery } = useGetUserDataQuery(undefined);

  const refetchData = () => {
    refetchQuery();
  };

  useEffect(() => {
    document.title = "Users List";
  }, []);

  useEffect(() => {
    if (userDataFromApi) {
      console.log("Full API res: ", userDataFromApi);
      setUsersData(userDataFromApi);
    }
  }, [userDataFromApi]);

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
        <UserTable users={usersData} refetchData={refetchData} />
      </div>
    </AdminLayout>
  );
};

export default AdminUser;
