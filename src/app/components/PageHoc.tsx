"use client";

import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Loading } from "./Loading";

type Props = {
  children: ReactNode;
};

const PageHoc = ({ children }: Props) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return children;
};

export default PageHoc;