import mongoose, { ClientSession } from "mongoose";
import ApiError from "../../../errors/ApiError";
import { CardModel } from "../card/card.model";
import { FareMatrix } from "../fareMatrix/fareMatrix.model";


export const calculateFare = async (
  startStoppage: string,
  endStoppage: string,
  routeId: string
): Promise<number> => {
  console.log(startStoppage, endStoppage, routeId);

  const routeFareEntry = await FareMatrix.findOne({
    routeId: new mongoose.Types.ObjectId(routeId),
    from: startStoppage,
    to: endStoppage,
  }).lean();

  console.log("FareMatrix entry:", routeFareEntry);

  if (!routeFareEntry) {
    throw ApiError.notFound(`Fare not defined between "${startStoppage}" and "${endStoppage}" on this route`);
  }

  return routeFareEntry.fare;
};


export const deductFare = async (
  cardId: string,
  fare: number,
  session: ClientSession
): Promise<number> => {
  const card = await CardModel.findById(cardId).session(session);
  if (!card) {
    throw ApiError.notFound("Card not found");
  }

  if (card.balance - fare < -100) {
    throw ApiError.badRequest("Insufficient balance (minimum balance limit is -100)");
  }

  const updatedCard = await CardModel.findByIdAndUpdate(
    cardId,
    {
      $inc: { balance: -fare },
      $set: { lastUsedAt: new Date() },
    },
    { session, new: true }
  );

  if (!updatedCard) {
    throw ApiError.notFound("Card not found");
  }

  return updatedCard.balance;
};
