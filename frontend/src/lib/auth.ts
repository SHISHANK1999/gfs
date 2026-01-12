export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("gfs_user") !== null;
};

export const loginUser = (data: any) => {
  localStorage.setItem("gfs_user", JSON.stringify(data));
};

export const logoutUser = () => {
  localStorage.removeItem("gfs_user");
};