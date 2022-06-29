import { Navigate } from "react-router-dom";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

const RequireWallet = (props: any) => {
  const wallet = useAnchorWallet();
  return wallet ? props.children : <Navigate to="/" replace />;
};

export default RequireWallet;