import {
    ENV_AH,
    AUCTION_HOUSE_ADDRESS,
    TOKEN_PROGRAM_ID,
  } from './helpers/constants';
import { 
  Transaction,
  PublicKey, 
  LAMPORTS_PER_SOL,
  SystemProgram, 
  TransactionInstruction,
  SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js'
import { web3 } from '@project-serum/anchor';
import { GRAPE_RPC_ENDPOINT, OTHER_MARKETPLACES } from '../../utils/grapeTools/constants';
import { InstructionsAndSignersSet } from "./helpers/types";

import { AuctionHouseProgram } from '@metaplex-foundation/mpl-auction-house'

import {
    loadAuctionHouseProgram,
    getAuctionHouseTradeState,
    getAtaForMint,
    getAuctionHouseProgramAsSigner,
    getMetadata,
  } from './helpers/accounts';
import { getPriceWithMantissa } from './helpers/various';

const { 
  createCancelInstruction, 
  createCancelListingReceiptInstruction } =
  AuctionHouseProgram.instructions

import { ConstructionOutlined } from '@mui/icons-material';
  export async function gah_cancelListing(price: number, mint: string, walletPublicKey: string, mintOwner: any, weightedScore: any, daoPublicKey: string, updateAuthority: string, collectionAuctionHouse: string): Promise<InstructionsAndSignersSet> {
    console.log("collectionAuctionHouse " + JSON.stringify(collectionAuctionHouse));
    let tokenSize = 1;
    const auctionHouseKey = new web3.PublicKey(collectionAuctionHouse || AUCTION_HOUSE_ADDRESS);
    const mintKey = new web3.PublicKey(mint);
    let anchorProgram = await loadAuctionHouseProgram(null, ENV_AH, GRAPE_RPC_ENDPOINT);
    const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(auctionHouseKey,);    
    //check if escrow amount already exists to determine if we need to deposit amount to grapevine 
    
    const buyerPrice = Number(price) * LAMPORTS_PER_SOL
    //console.log("buyerPrice: "+buyerPrice);
    //console.log("auctionHouseObj: "+JSON.stringify(auctionHouseObj));
    const auctionHouse = new PublicKey(auctionHouseKey);//new PublicKey(auctionHouseObj.auctionHouse.address)
    //console.log("auctionHouse: "+auctionHouseObj.auctionHouse.address);
    const authority = new PublicKey(auctionHouseObj.authority)
    const auctionHouseFeeAccount = new PublicKey(
      auctionHouseObj.auctionHouseFeeAccount
    )
    const treasuryMint = new PublicKey(auctionHouseObj.treasuryMint)
    const tokenMint = mintKey
    //console.log("mintOwner: "+JSON.stringify(mintOwner));
    //const tokenAccount = new PublicKey(mintOwner)
    const results = await anchorProgram.provider.connection.getTokenLargestAccounts(mintKey);    
    const tokenAccount: web3.PublicKey = results.value[0].address;

      // IMPORTANT THIS IS THE MAKE LISTING
      // We need to cancel the listing

    let sellerWalletKey = new PublicKey(walletPublicKey);
    if (daoPublicKey){
      sellerWalletKey = new web3.PublicKey(daoPublicKey);
    }
    
    const txt = new Transaction()
    /*
    const [tradeState, tradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        sellerWalletKey,
        auctionHouse,
        auctionHouseObj.treasuryMint,
        tokenMint,
        buyerPrice,
        1
      )
      */
      const [tradeState, tradeStateBump] = 
        await AuctionHouseProgram.findTradeStateAddress(
          sellerWalletKey,
          auctionHouse,
          tokenAccount,
          treasuryMint,
          tokenMint,
          buyerPrice,
          1
        )
      
      const cancelInstructionAccounts = {
        wallet: sellerWalletKey,
        tokenAccount,
        tokenMint,
        authority,
        auctionHouse,
        auctionHouseFeeAccount,
        tradeState,
      }
      const cancelListingInstructionArgs = {
        buyerPrice,
        tokenSize: 1,
      }

      const [receipt, receiptBump] =
          await AuctionHouseProgram.findListingReceiptAddress(tradeState)

      const cancelListingReceiptAccounts = {
        receipt,
        instruction: SYSVAR_INSTRUCTIONS_PUBKEY,
      }

      const cancelListingInstruction = createCancelInstruction(
        cancelInstructionAccounts,
        cancelListingInstructionArgs
      )

      const cancelListingReceiptInstruction =
        createCancelListingReceiptInstruction(cancelListingReceiptAccounts)

    txt.add(cancelListingInstruction).add(cancelListingReceiptInstruction)
    
    //txt.recentBlockhash = (await connection.getRecentBlockhash()).blockhash
    txt.feePayer = sellerWalletKey;
    
    const transferAuthority = web3.Keypair.generate();
    const signers = true ? [] : [transferAuthority];
    const instructions = txt.instructions;
    
    /*
    let derivedMintPDA = await web3.PublicKey.findProgramAddress([Buffer.from((mintKey).toBuffer())], auctionHouseKey);
    let derivedBuyerPDA = await web3.PublicKey.findProgramAddress([Buffer.from((sellerWalletKey).toBuffer())], auctionHouseKey);
    let derivedOwnerPDA = await web3.PublicKey.findProgramAddress([Buffer.from((new PublicKey(mintOwner)).toBuffer())], auctionHouseKey);
    let derivedUpdateAuthorityPDA = await web3.PublicKey.findProgramAddress([Buffer.from((new PublicKey(updateAuthority)).toBuffer())], auctionHouseKey);
  
    const GRAPE_AH_MEMO = {
      state:2, // status (0: withdraw, 1: offer, 2: listing, 3: buy/execute (from listing), 4: buy/execute(accept offer), 5: cancel)
      ah:auctionHouseKey.toString(), // pk
      mint:mintKey.toString(), // mint
      ua:updateAuthority, // updateAuthority
      amount:buyerPrice, // price
      score:weightedScore, // spam protection for our feed/higher score weight higher feed visibility
    };
    
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: sellerWalletKey,
        toPubkey: derivedMintPDA[0],
        lamports: 0,
      })
    );
    instructions.push(
      SystemProgram.transfer({
          fromPubkey: sellerWalletKey,
          toPubkey: derivedBuyerPDA[0],
          lamports: 0,
      })
    );
    instructions.push(
      SystemProgram.transfer({
          fromPubkey: sellerWalletKey,
          toPubkey: derivedOwnerPDA[0],
          lamports: 0,
      })
    );
    instructions.push(
      SystemProgram.transfer({
          fromPubkey: sellerWalletKey,
          toPubkey: derivedUpdateAuthorityPDA[0],
          lamports: 0,
      })
    );
    instructions.push(
      new TransactionInstruction({
          keys: [{ pubkey: sellerWalletKey, isSigner: true, isWritable: true }],
          data: Buffer.from(JSON.stringify(GRAPE_AH_MEMO), 'utf-8'),
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      })
    );
    */

    return {
      signers: signers,
      instructions: instructions
    }

  }