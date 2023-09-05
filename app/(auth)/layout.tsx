import React from "react";

interface Props {
  children: React.ReactNode;
}
export default function AuthLayout({ children }: Props) {
  return <div className="h-full bg-red-500">{children}</div>;
}
