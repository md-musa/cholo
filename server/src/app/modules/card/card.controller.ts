import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import mongoose from "mongoose";
import { CardModel } from "./card.model";
import { PassengerModel } from "../auth/auth.model";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";

const SIGNATURE_SECRET = "tms_secret_salt";


const computeSignature = (tranId: string, amount: string): string => {
  return crypto.createHash("md5").update(tranId + amount + SIGNATURE_SECRET).digest("hex");
};


const registerCard = async (req: Request, res: Response): Promise<void> => {
  const { nfcUid } = req.body;

  if (!nfcUid) {
    throw ApiError.badRequest("NFC UID is required");
  }


  const existingCard = await CardModel.findOne({ nfcUid });
  if (existingCard) {
    throw ApiError.badRequest("Card with this NFC UID already exists");
  }

  const newCard = await CardModel.create({
    nfcUid,
    status: "unissued",
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Card registered successfully",
    data: newCard,
  });
};



const issueCard = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw ApiError.badRequest("UserId is required to issue a card");
  }

  const card = await CardModel.findById(id);
  if (!card) {
    throw ApiError.notFound("Card not found");
  }

  if (card.status !== "unissued") {
    throw ApiError.badRequest(`Card is currently in "${card.status}" state and cannot be issued`);
  }

  // Find passenger
  const passenger = await PassengerModel.findById(userId);
  if (!passenger) {
    throw ApiError.notFound("Passenger user not found");
  }

  // Reject if passenger already has a card linked (checked in both CardModel and PassengerModel)
  if (passenger.nfcUid) {
    throw ApiError.badRequest("User already has an NFC UID linked");
  }

  const existingUserCard = await CardModel.findOne({ userId });
  if (existingUserCard) {
    throw ApiError.badRequest("User already has a card linked");
  }

  // Update card details
  card.userId = passenger._id as any;
  card.status = "active";
  card.issuedAt = new Date();
  await card.save();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Card issued successfully",
    data: card,
  });
};


const blockCard = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const card = await CardModel.findByIdAndUpdate(
    id,
    { $set: { status: "blocked" } },
    { new: true, runValidators: true }
  );

  if (!card) {
    throw ApiError.notFound("Card not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Card blocked successfully",
    data: card,
  });
};


const getMyCard = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  const card = await CardModel.findOne({ userId }).lean();
  if (!card) {
    throw ApiError.notFound("No card found linked to your user account");
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Card details retrieved successfully",
    data: {
      _id: card._id,
      nfcUid: card.nfcUid,
      balance: card.balance,
      status: card.status,
      lastUsedAt: card.lastUsedAt,
    },
  });
};


const getCardDetails = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const card = await CardModel.findById(id).populate("userId issuedBy").lean();
  if (!card) {
    throw ApiError.notFound("Card not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Card details retrieved successfully",
    data: card,
  });
};


const initRecharge = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { amount } = req.body;

  const rechargeAmount = parseFloat(amount);
  if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
    throw ApiError.badRequest("A valid positive amount is required for recharge");
  }

  const card = await CardModel.findOne({ userId });
  if (!card) {
    throw ApiError.notFound("No card found linked to your account");
  }

  if (card.status !== "active") {
    throw ApiError.badRequest(`Cannot recharge a card in "${card.status}" state`);
  }

  const tran_id = `tms_rc_${card._id}_${Date.now()}`;


  const verify_sign = computeSignature(tran_id, rechargeAmount.toString());


  const port = process.env.PORT || 4000;
  const paymentUrl = `http://localhost:${port}/api/v1/cards/recharge/mock-gateway?tran_id=${tran_id}&amount=${rechargeAmount}&nfcUid=${card.nfcUid}&verify_sign=${verify_sign}`;

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Recharge session initiated successfully",
    data: {
      paymentUrl,
    },
  });
};


const rechargeCard = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { amount } = req.body;

  const rechargeAmount = parseFloat(amount);
  if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
    throw ApiError.badRequest("A valid positive amount is required for recharge");
  }

  const card = await CardModel.findOne({ userId });
  if (!card) {
    throw ApiError.notFound("No card found linked to your account");
  }

  if (card.status !== "active") {
    throw ApiError.badRequest(`Cannot recharge a card in "${card.status}" state`);
  }

  const updatedCard = await CardModel.findByIdAndUpdate(
    card._id,
    {
      $inc: { balance: rechargeAmount },
    },
    { new: true }
  );

  if (!updatedCard) {
    throw ApiError.notFound("Card not found");
  }

  await PassengerModel.findByIdAndUpdate(userId, {
    $inc: { balance: rechargeAmount },
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Card recharged successfully",
    data: {
      _id: updatedCard._id,
      nfcUid: updatedCard.nfcUid,
      balance: updatedCard.balance,
      status: updatedCard.status,
      lastUsedAt: updatedCard.lastUsedAt,
      rechargedAmount: rechargeAmount,
    },
  });
};

const mockGatewayPage = async (req: Request, res: Response): Promise<void> => {
  const { tran_id, amount, nfcUid, verify_sign } = req.query;

  if (!tran_id || !amount || !nfcUid || !verify_sign) {
    res.status(StatusCodes.BAD_REQUEST).send("Invalid checkout parameters");
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Transnova Secure Checkout</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Outfit', sans-serif;
      background: radial-gradient(circle at top right, #1a1b3a, #0b0c16);
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .checkout-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 40px;
      width: 450px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
      position: relative;
    }
    .checkout-card::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 150px;
      height: 150px;
      background: linear-gradient(135deg, #7f00ff, #e100ff);
      border-radius: 50%;
      filter: blur(80px);
      z-index: -1;
      opacity: 0.5;
    }
    .checkout-card::after {
      content: '';
      position: absolute;
      bottom: -50px;
      left: -50px;
      width: 150px;
      height: 150px;
      background: linear-gradient(135deg, #00f2fe, #4facfe);
      border-radius: 50%;
      filter: blur(80px);
      z-index: -1;
      opacity: 0.5;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(to right, #00f2fe, #e100ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-align: center;
      margin-bottom: 30px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .amount-display {
      text-align: center;
      margin-bottom: 30px;
    }
    .amount-val {
      font-size: 48px;
      font-weight: 800;
      color: #00f2fe;
    }
    .amount-label {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 5px;
    }
    .details {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 30px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      color: rgba(255, 255, 255, 0.5);
    }
    .detail-val {
      font-weight: 600;
    }
    .btn {
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 12px;
    }
    .btn-pay {
      background: linear-gradient(135deg, #7f00ff, #e100ff);
      color: #fff;
      box-shadow: 0 8px 20px rgba(225, 0, 255, 0.3);
    }
    .btn-pay:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(225, 0, 255, 0.4);
    }
    .btn-cancel {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 0;
    }
    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="checkout-card">
    <div class="logo">Transnova Pay</div>
    <div class="amount-display">
      <div class="amount-val">৳ ${amount}</div>
      <div class="amount-label">Payment Amount</div>
    </div>
    <div class="details">
      <div class="detail-row">
        <span class="detail-label">NFC Card ID</span>
        <span class="detail-val">${nfcUid}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Transaction ID</span>
        <span class="detail-val" style="font-size:11px; color:#00f2fe;">${tran_id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Gateway</span>
        <span class="detail-val">SSLCommerz Sandbox</span>
      </div>
    </div>
    
    <form action="/api/v1/cards/recharge/webhook" method="POST">
      <input type="hidden" name="status" value="VALID">
      <input type="hidden" name="tran_id" value="${tran_id}">
      <input type="hidden" name="amount" value="${amount}">
      <input type="hidden" name="verify_sign" value="${verify_sign}">
      <button type="submit" class="btn btn-pay">Authorize & Pay</button>
    </form>
    
    <form action="/api/v1/cards/recharge/webhook" method="POST">
      <input type="hidden" name="status" value="FAILED">
      <input type="hidden" name="tran_id" value="${tran_id}">
      <input type="hidden" name="amount" value="${amount}">
      <input type="hidden" name="verify_sign" value="${verify_sign}">
      <button type="submit" class="btn btn-cancel">Cancel Payment</button>
    </form>
  </div>
</body>
</html>
  `;

  res.send(html);
};


const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const { status, tran_id, amount, verify_sign } = req.body;

  if (!tran_id || !amount || !verify_sign) {
    throw ApiError.badRequest("Invalid webhook payload");
  }


  const computed = computeSignature(tran_id, amount);
  if (computed !== verify_sign) {
    throw ApiError.badRequest("Invalid webhook signature");
  }

  if (status !== "VALID") {
    res.send(`
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Outfit', sans-serif; background:#0b0c16; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
            .box { text-align:center; border: 1px solid #ff3333; padding: 40px; border-radius: 16px; background: rgba(255,51,51,0.03); max-width: 450px; }
            h2 { color: #ff3333; margin-bottom: 20px; }
            p { color: rgba(255,255,255,0.7); font-size:14px; margin-bottom:10px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>Payment Cancelled or Failed</h2>
            <p>Transaction ID: ${tran_id}</p>
            <p>Your payment session has ended without charging your account.</p>
          </div>
        </body>
      </html>
    `);
    return;
  }


  const parts = tran_id.split("_");
  if (parts.length < 3 || parts[0] !== "tms" || parts[1] !== "rc") {
    throw ApiError.badRequest("Invalid transaction ID format");
  }
  const cardId = parts[2];

  const rechargeAmount = parseFloat(amount);
  if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
    throw ApiError.badRequest("Invalid amount");
  }


  const updatedCard = await CardModel.findByIdAndUpdate(
    cardId,
    {
      $inc: { balance: rechargeAmount },
    },
    { new: true }
  );

  if (!updatedCard) {
    throw ApiError.notFound("Card not found");
  }


  if (updatedCard.userId) {
    await PassengerModel.findByIdAndUpdate(updatedCard.userId, {
      $inc: { balance: rechargeAmount },
    });
  }

  res.send(`
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Outfit', sans-serif; background:#0b0c16; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
          .box { text-align:center; border: 1px solid #00f2fe; padding: 40px; border-radius: 16px; background: rgba(0,242,254,0.03); max-width: 450px; }
          h2 { color: #00f2fe; margin-bottom: 20px; }
          p { color: rgba(255,255,255,0.7); font-size:14px; margin-bottom:10px; }
          .val { color:#fff; font-weight:600; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>Payment Successful!</h2>
          <p>Transaction ID: <span class="val">${tran_id}</span></p>
          <p>Amount: <span class="val">৳ ${amount}</span></p>
          <p>New Card Balance: <span class="val">৳ ${updatedCard.balance}</span></p>
        </div>
      </body>
    </html>
  `);
};

const getAllCards = async (req: Request, res: Response): Promise<void> => {
  const cards = await CardModel.find({}).populate("userId").lean();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Cards retrieved successfully",
    data: cards,
  });
};

const unblockCard = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const card = await CardModel.findByIdAndUpdate(
    id,
    { $set: { status: "active" } },
    { new: true, runValidators: true }
  );

  if (!card) {
    throw ApiError.notFound("Card not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Card unblocked successfully",
    data: card,
  });
};

export const CardController = {
  registerCard,
  issueCard,
  blockCard,
  unblockCard,
  getMyCard,
  getCardDetails,
  initRecharge,
  rechargeCard,
  mockGatewayPage,
  handleWebhook,
  getAllCards,
};
