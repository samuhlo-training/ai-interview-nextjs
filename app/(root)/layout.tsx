import React, { ReactNode } from "react";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return <body className="">{children}</body>;
};

export default RootLayout;
