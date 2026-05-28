import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

export const useRequireAuth = () => {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  return !!token;
};

export const useRedirectIfAuthed = () => {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);
};

export default useAuthStore;