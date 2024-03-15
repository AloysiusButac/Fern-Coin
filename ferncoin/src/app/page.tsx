"use client";
import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { getContract } from "../config";
import Image from "next/image";
import { clsx } from 'clsx';
import { connect } from "http2";

// Widget for Links
function LinkPill( {title='Title', subtitle='Some Text Here.', glyph=true, active=false, OnClick=null}: {title:string, subtitle:string, glyph:boolean, active:boolean, OnClick:any}) {
  return (
    <button onClick={ OnClick } className="group rounded-b-lg border border-transparent px-5 pb-4 pt-2 transition-colors hover:border-blue-300 hover:bg-slate-100/30 ">
      <h2 className={`mb-3 -ml-6 text-2xl font-semibold`}><span className={clsx('inline-block pr-3 transition-transform group-hover:translate-x-1 motion-reduce:transform-none', { 'hidden' : !glyph })}> -&gt; </span> {title}{" "} </h2>
      <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-balance hover:opacity-100`}> {subtitle} </p>
    </button>
  );
}
// Widget for Login Page
function LoginPage( {OnClick, state=true, active_state="Login", inactive_state="Logout", className="", message=""}: {OnClick:any, state:boolean, active_state:string, inactive_state:string, className:string, message:string} ) {
  return (
    <div className={clsx(`flex flex-col items-center align-middle m-3 w-full ${className ?? ''}` )}>
      <button type="button" onClick={OnClick} className="text-white bg-gradient-to-r from-sky-500 to-indigo-500 focus:ring-2 focus:ring-blue-400 font-medium rounded-lg text-sm px-12 py-2.5 me-2 mb-2 mt-24 focus:outline-none">
        { state ? active_state : inactive_state }
      </button>
      <p className={clsx(`${message ? '' : 'hidden'}`)}>{ message ?? '' }</p>
    </div>
  );
}
// Widget for Minting Page
function MintPage( {Amount=0, InputChange=null, MintAction=null, className="", message=""}: {Amount:number, InputChange:any, MintAction:any, className:string, message:string} ) {
  return (
    <div className={clsx(`flex flex-col items-center align-middle m-3 w-full ${className ?? ''}` )}>
      <h3>Mint Fern Coins</h3>
        <input type="number" name="mint-input" placeholder="Enter Amount" value={Amount} onChange={InputChange} className="border border-gray-300 px-4 py-4 my-12 text-black rounded-xl w-2/3" />
        <p className={clsx(`${message ? '' : 'hidden'}`)}>{ message ?? '' }</p>
        <button type="button" onClick={MintAction} className="text-white bg-gradient-to-r from-sky-500 to-indigo-500 focus:ring-2 focus:ring-blue-400 font-medium rounded-lg text-sm px-12 py-2.5 me-2 mb-2 w-1/5 focus:outline-none">
          Mint
        </button>
    </div>
  );
}
// Widget for Staking Page
function StakePage( {Amount=0, InputChange=null, StakeAction=null, className="", message=""}: {Amount:number, InputChange:any, StakeAction:any, className:string, message:string} ) {
  return (
    <div className={clsx(`flex flex-col items-center align-middle m-3 w-full ${className ?? ''}` )}>
      <h3>Stake Fern Coins</h3>
        <input type="number" name="mint-input" placeholder="Enter Amount" value={Amount} onChange={InputChange} className="border border-gray-300 px-4 py-4 my-12 text-black rounded-xl w-2/3" />
        <p className={clsx(`${message ? '' : 'hidden'}`)}>{ message ?? '' }</p>
        <button type="button" onClick={StakeAction} className="text-white bg-gradient-to-r from-sky-500 to-indigo-500 focus:ring-2 focus:ring-blue-400 font-medium rounded-lg text-sm px-12 py-2.5 me-2 mb-2 w-1/5 focus:outline-none">
          Stake
        </button>
    </div>
  );
}
// Widget for Withrawing Page
function WithdrawPage( {Amount=0, WithdrawAction=null, className="", message=""}: {Amount:number, WithdrawAction:any, className:string, message:string} ) {
  return (
    <div className={clsx(`flex flex-col items-center align-middle m-3 w-full ${className ?? ''}` )}>
      <h3>Withdraw Fern Coins</h3>
      <button type="button" onClick={WithdrawAction} className="text-white bg-gradient-to-r from-sky-500 to-indigo-500 focus:ring-2 focus:ring-blue-400 font-medium rounded-lg text-sm px-12 py-2.5 mx-2 my-12 w-3/5 focus:outline-none">
        Withdraw
      </button>
      <p className={clsx(`${message ? '' : 'hidden'}`)}>{ message ?? '' }</p>
    </div>
  );
}

export default function Home() {
  const [walletKey, setWalletKey] = useState<string | null>(null);
  const [mintAmount, setMintAmount] = useState<number>(0);        // int: The Amount to be minted
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [stakedAmount, setStakedAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);

  const [mintSubmitted, setMintSubmitted] = useState(false);
  const [stakeSubmitted, setStakeSubmitted] = useState(false);
  const [withdrawSubmitted, setWithdrawSubmitted] = useState(false);
  const [activePage, setActivePage] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const mint = async () => {
    setErrorMessage("");
    if (mintAmount <= 0) {
      setErrorMessage("Please enter a valid amount to mint.");
      return;
    }

    const { ethereum } = window as any;
    const provider = new BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const contract = getContract(signer);

    try {
      const tx = await contract.mint(signer, Math.floor(mintAmount));
      await tx.wait();
      setMintSubmitted(true);
      checkwalletBalance();
      setErrorMessage("");
    } catch (e: any) {
      const decodedError = contract.interface.parseError(e.data);
      setErrorMessage(`Minting failed: ${decodedError?.args}`);
    }
  };

  const mintAmountChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!isNaN(Number(inputValue))) {
      setMintAmount(Number(inputValue));
    } else {
      setMintAmount(0);
    }
  };

  const stake = async () => {
    const { ethereum } = window as any;
    const provider = new BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const contract = getContract(signer);

    try {
      const tx = await contract.stake(Math.floor(stakeAmount));
      await tx.wait();
      setStakeSubmitted(true);
      checkwalletBalance();
      setStakedAmount(stakedAmount + stakeAmount);
      setErrorMessage("");
    } catch (e: any) {
      const decodedError = contract.interface.parseError(e.data);
      // alert(`Staking failed: ${decodedError?.args}`);
      setErrorMessage(`Staking failed: ${decodedError?.args}`);
    }
  };

  const stakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!isNaN(Number(inputValue))) {
      setStakeAmount(Number(inputValue));
    } else {
      setStakeAmount(0);
    }
  };

  const withdraw= async () => {
    const { ethereum } = window as any;
    const provider = new BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const contract = getContract(signer);

    try {
      const tx = await contract.withdraw();
      await tx.wait();
      setWithdrawSubmitted(true);
      checkwalletBalance();
      setErrorMessage("");
    } catch (e: any) {
      const decodedError = contract.interface.parseError(e.data);
      setErrorMessage(`Withdrawal failed: ${decodedError?.args}`);
    }
  };

  const connectWallet = async () => {
    if(walletKey != null) {
      setWalletKey(null);
      return;
    }

    const { ethereum } = window as any;

    try {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [
              "https://sepolia-rollup.arbitrum.io/rpc",
              "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
            ],
            chainId: "0x66eee",
            chainName: "Arbitrum Sepolia",
          },
        ],
      });

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletKey(accounts[0]); // 

      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0x66eee",
          },
        ],
      });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage('Error connecting wallet. Please make sure you have an Ethereum-compatible wallet installed and connected.');
      console.error("Error connecting wallet:", error);
    }
  };

  const checkwalletBalance = async () => {
    const { ethereum } = window as any;
    const provider = new BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const contract = getContract(signer);

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const userwalletBalance = await contract.walletBalanceOf(accounts[0]);
      setWalletBalance(userwalletBalance.toNumber());
    } catch (error) {
      console.error("Error checking walletBalance:", error);
    }
  };

  const importToken = async () => {
    const tokenAddress = '0x2850B5283a6505b02d0446115Ff4f66A3663F7ac';
    const tokenSymbol = 'RAJ';
    const tokenDecimals = 18;

    const { ethereum } = window as any;

    try {
      const success = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
          },
        },
      });

      if (success) {
        alert(`Token ${tokenSymbol} has been imported successfully!`);
      } else {
        console.error(`Failed to add ${tokenSymbol} token to Metamask`);
      }
    } catch (error) {
      console.error('Error adding token to Metamask:', error);
      // Handle error or show an error message to the user
    }
  };

  useEffect(() => {
    if (walletKey) {
      checkwalletBalance();
    }
  }, [walletKey, mintSubmitted, stakeSubmitted, withdrawSubmitted]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-24">
      <header className="text-center">
        <h1 className="text-5xl italic mt-12">FernCoins</h1>
        <h5 className="text-sm italic mb-12">Mint, Stake, and Withdraw</h5>
        <Image src={'/arbitrum-logo.svg'} width={200} height={200} alt="Arbitrum Logo"></Image>
      </header>

      <div style={{height: 450 + 'px'}} className="flex flex-col bg-white py-12 ps-52 pe-36 text-black rounded w-8/12 items-center align-middle">
        <div className="mb-12">
          <p className={clsx('italic text-gray-500', { 'hidden' : !walletKey })}>Connected Wallet: {walletKey}</p>
        </div>

        <LoginPage className={activePage == 1 ? '' : 'hidden'} message={errorMessage} OnClick={ connectWallet } state={walletKey != null} active_state={"Disconnect Wallet"} inactive_state={"Connect Wallet"}/>
        <MintPage className={activePage == 2 ? '' : 'hidden'} message={errorMessage} Amount={mintAmount} InputChange={mintAmountChanged} MintAction={mint}/>
        <StakePage className={activePage == 3 ? '' : 'hidden'} message={errorMessage} Amount={stakeAmount} InputChange={stakeAmountChange} StakeAction={stake}/>
        <WithdrawPage className={activePage == 4 ? '' : 'hidden'} message={errorMessage} Amount={withdrawAmount} WithdrawAction={withdraw}/>
      </div>
      <div className="mb-12 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <LinkPill title={'Login'} subtitle={''} glyph={false} active={false} OnClick={ () => setActivePage(1) }/>
        <LinkPill title={'Mint'} subtitle={'Mint FernCoins for your Wallet!'} glyph={true} active={false} OnClick={ () => { if(walletKey != null) { setActivePage(2) }}}/>
        <LinkPill title={'Stake'} subtitle={'What\'s there to lose?'} glyph={true} active={false} OnClick={ () => { if(walletKey != null) { setActivePage(3) }}}/>
        <LinkPill title={'Withdraw'} subtitle={'Time to Cashout'} glyph={true} active={false} OnClick={ () => { if(walletKey != null) { setActivePage(4) }}}/>
      </div>

      <div className="mb-12">
        <h2>Special Thanks to:</h2>
        <a href="https://theblokc.com/" className="-mx-1.5 my-3 p-1.5 flex items-center justify-center">
          <div className="flex flex-inline items-center text-center">
            <Image src={'/the-blokc-logo.png'} width={75} height={75} alt="The BLOKC Group Logo" loading="lazy"/>
            <span className="text-xl text-white font-semibold leading-6 text-gray-900 mx-6">The BLOKC</span>
          </div>
        </a>
      </div>

      {/* FOOTER SECTION */}
      <footer style={{ position: "absolute", bottom: 0, width:"100%" }} className={'bg-white text-black items-center w-full m-0 p-0'}>
        <div className="flex flex-col text-center py-2">
          <p>Project created by <strong>Aloysius Atheos L. Butac</strong>. Find me at <a href="https://github.com/AloysiusButac" target="_blank"><i className="fa fa-github" style={{ fontSize: 20 + 'px', paddingLeft: 5 + 'px' }}></i></a></p>
        </div>
      </footer>
    </main>
  );
}
