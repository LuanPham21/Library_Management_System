import Cookies from "js-cookie";

export const authStorage = {
  getToken: () => Cookies.get("token") ?? null,

  setToken: (token: string) => {
    Cookies.set("token", token, {
      expires: 7,
      sameSite: "strict",
    });
  },

  removeToken: () => {
    Cookies.remove("token");
  },

  isLoggedIn: () => !!authStorage.getToken(),
};
