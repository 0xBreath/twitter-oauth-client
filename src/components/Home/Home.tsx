import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { signArbitraryMessage } from "./solana";
import queryString from 'query-string';
import {
  Button,
  CircularProgress,
  Snackbar,
  Toolbar,
  Alert,
  makeStyles,
} from "@mui/material";
import "./Home.css";
import ProjectEluuneHeader from "../../assets/ProjectEluuneBanner.png";
import BackgroundImage from "../../assets/MemoryGod.jpg";

const ProximaNovaUrl =
  "https://fonts.gstatic.com/l/font?kit=FwZc7-Am2FI_-VOxaLDvvq27omO73q3LkQ&skey=96867d716c89840e&v=v19";
const HomeNew = (props: any) => {
  const { wallet, signMessage, publicKey } = useWallet();
  const [isRegister, setRegister] = useState(false); // true when user press REGISTER button
  const [isExists, setExists] = useState(false); // true when wallet already exists within database
  const [isConnected, setDisconnecting] = useState(false)
  const [isTwitter, setTwitter] = useState(false)

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const USER_ROUTE = "http://localhost:3001/users";


  const onUnsignWallet = async () => {
    try {
      setDisconnecting(true);
      if (wallet && publicKey) {
        // wallet signs message => returns trx details
        // call backend to verify signature
        const trx = await signArbitraryMessage(publicKey, signMessage);
        const pubkey = trx.pubkey;
        console.log("pubkey: ", pubkey);
        const sig = trx.signature;
        console.log("sig: ", sig);
        const msg = trx.message;
        console.log("msg: ", msg);

        const route = USER_ROUTE + `/${pubkey}/disconnect`;
        console.log("user POST route: ", route);

        const payload = {
          pubkey: pubkey,
          signature: sig,
          message: msg,
        };

        // verify User on backend
        // verified = boolean verified user?
        let verified = await fetch(route, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        let status = verified.ok;
        console.log("verified? = ", status);

        try {
          // failed to verified signature
          if (!status) {
            setAlertState({
              open: true,
              message: "Error: failed to verify wallet!. Please try again.",
              severity: "error",
            });
          }
          // signature verified, continue checks
          else {
            console.log("user verified!");
            setAlertState({
              open: true,
              message: "Disconnect succeeded!.",
              severity: "success",
            });
          }
        } catch {
          setAlertState({
            open: true,
            message: `Error: User doesnt exist yet!`,
            severity: "error",
          });
        }
      } // end of if
    } catch (error: any) {
      console.log("I errored");
      let message = error.msg || "Disconnection errored out! Please try again.";

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setDisconnecting(false);
    }
  }; // end of onUnsignWallet

  const onTwitter = async () => {
    try {
      setTwitter(true);
      if (wallet && publicKey) {
        let pubkey = publicKey.toString()
        const TWITTER_AUTH_ROUTE = USER_ROUTE + `/${pubkey}/twitter/authorize`;
        let res = await fetch(TWITTER_AUTH_ROUTE, {
          method : "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        let oauth_token = await res.text();
        console.log('twitter oauth_token -> ', oauth_token);
        window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`

      } // end of if
    } catch (error: any) {
      console.log("Twitter login errored");
      let message = error.msg || "Twitter login failed! Please try again.";

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setTwitter(false);
    }
  };// end of onTwitter

  const onRegister = async () => {
    try {
      setRegister(true);
      if (wallet && publicKey) {
        // wallet signs message => returns trx details
        // call backend to verify signature
        const trx = await signArbitraryMessage(publicKey, signMessage);
        console.log("i stay here");
        const pubkey = trx.pubkey;
        console.log("pubkey: ", pubkey);
        const sig = trx.signature;
        console.log("sig: ", sig);
        const msg = trx.message;
        console.log("msg: ", msg);

        const route = USER_ROUTE + `/${pubkey}`;
        console.log("user POST route: ", route);

        const payload = {
          pubkey: pubkey,
          signature: sig,
          message: msg,
        };

        // verify User on backend
        // verified = boolean verified user?
        let verified = await fetch(route, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        let status = verified.ok;
        console.log("verified? = ", status);

        try {
          // failed to verified signature
          if (!status) {
            setAlertState({
              open: true,
              message: "Error: failed to verify wallet!. Please try again.",
              severity: "error",
            });
          }
          // signature verified, continue checks
          else {
            console.log("user verified!");
            setAlertState({
              open: true,
              message: "Welcome to Eleriah! Registration succeeded.",
              severity: "success",
            });
          }
        } catch {
          setAlertState({
            open: true,
            message: `Error: User already registered!`,
            severity: "error",
          });
        }
      } // end of if
    } catch (error: any) {
      console.log("I errored");
      let message = error.msg || "Registration errored out! Please try again.";

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setRegister(false);
    }
  };// end of onRegister()

  useEffect(() => {
    (async() => {
      // read current URL to see if Twitter oauth completed -> returned params
      const {oauth_token, oauth_verifier} = queryString.parse(window.location.search);  

      if (oauth_token && oauth_verifier) {
        try {
          console.log('oauth_token -> ', oauth_token);
          console.log('oauth_verifier -> ', oauth_verifier);
  
          let body = {
            oauth_token: oauth_token,
            oauth_verifier: oauth_verifier
          } 
          const TWITTER_POST_USER_ROUTE = USER_ROUTE + '/twitter/callback';
          let res = await fetch(TWITTER_POST_USER_ROUTE, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(body),     
          })

          if (res.status == 200) {
            setAlertState({
              open: true,
              message: "Twitter connected successfully!",
              severity: "success",
            });
          }
        } catch (err) {
          console.log(err)
          setAlertState({
            open: true,
            message: "Twitter failed to register. Please refresh and try again.",
            severity: "error",
          });
        }
      }      
    })();
  }, []);

  return (
    <>
      <div className="HomeBg">
        <div className="logoHeader">
          <div>
            <img className="Logo" src={ProjectEluuneHeader} alt="diagram" />
          </div>
          {/* <img className="Logo" src={mainLogo} alt="diagram" /> */}
        </div>
        <div className="central">
          <div className="title1">
            Take the historic first step into the world of Eleriah
          </div>
          {!wallet ? (
            <WalletMultiButton className="centralConnect">
              CONNECT WALLET
            </WalletMultiButton>
          ) : (
            <>
              <Button
                disabled={isRegister}
                onClick={onRegister}
                variant="contained"
                sx={{
                  backgroundColor: "white",
                  color: "black",
                  fontFamily: "Proxima Nova, sans-serif",
                  fontSize: "16px",
                  letterSpacing: "0.1em",
                  height: "48px",
                  lineHeight: "48px",
                  padding: "0 24px",
                  borderRadius: "4px",
                  marginTop: "3em",
                  "&:disabled": {
                    backgroundColor: "#160617",
                    color: "white",
                    opacity: "0.5",
                  },
                  "&:hover": {
                    backgroundColor: "#FFFFF3",
                    boxShadow: "0 0 50px white",
                    color: "black",
                  },
                }}
              >
                {isExists ? (
                  "wallet already registered"
                ) : isRegister ? (
                  <CircularProgress />
                ) : (
                  <div className="centralConnect">REGISTER</div>
                )}
              </Button>

              <Button
                disabled={isConnected}
                onClick={onUnsignWallet}
                variant="contained"
                sx={{
                  backgroundColor: "white",
                  color: "black",
                  fontFamily: "Proxima Nova, sans-serif",
                  fontSize: "16px",
                  letterSpacing: "0.1em",
                  height: "48px",
                  lineHeight: "48px",
                  padding: "0 24px",
                  borderRadius: "4px",
                  marginTop: "3em",
                  marginLeft:"20px",
                  "&:disabled": {
                    backgroundColor: "#160617",
                    color: "white",
                    opacity: "0.5",
                  },
                  "&:hover": {
                    backgroundColor: "#FFFFF3",
                    boxShadow: "0 0 50px white",
                    color: "black",
                  },
                }}
              >
                {isExists ? (
                  "wallet already registered"
                ) : isConnected ? (
                  <CircularProgress />
                ) : (
                  <div className="centralConnect">Disconnect wallet</div>
                )}
              </Button>

              <Button
                disabled={isConnected}
                onClick={onTwitter}
                variant="contained"
                sx={{
                  backgroundColor: "white",
                  color: "black",
                  fontFamily: "Proxima Nova, sans-serif",
                  fontSize: "16px",
                  letterSpacing: "0.1em",
                  height: "48px",
                  lineHeight: "48px",
                  padding: "0 24px",
                  borderRadius: "4px",
                  marginTop: "3em",
                  marginLeft:"20px",
                  "&:disabled": {
                    backgroundColor: "#160617",
                    color: "white",
                    opacity: "0.5",
                  },
                  "&:hover": {
                    backgroundColor: "#FFFFF3",
                    boxShadow: "0 0 50px white",
                    color: "black",
                  },
                }}
              >
                {isExists ? (
                  "wallet already registered"
                ) : isConnected ? (
                  <CircularProgress />
                ) : (
                  <div className="centralConnect">Connect Twitter</div>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

export default HomeNew;
