import mongoose, { ClientSession } from "mongoose";
import ApiError from "../../../errors/ApiError";
import { CardModel } from "../card/card.model";
import { FareMatrix } from "../fareMatrix/fareMatrix.model";

/**
 * Looks up fare matrix for the route and retrieves fare for the stoppage pair.
 */

export const calculateFare = async (
  startStoppage: string,
  endStoppage: string,
  routeId: string
): Promise<number> => {
  console.log(startStoppage, endStoppage, routeId);

  const routeStopages = await FareMatrix.findOne({
    routeId: new mongoose.Types.ObjectId(routeId)
  }).lean();

  console.log("FareMatrix entry:", routeStopages);

  if (!routeStopages) {
    throw ApiError.notFound("Fare matrix not found for this route");
  }

  const fare = routeStopages.fareMatrix?.[startStoppage]?.[endStoppage];

  if (fare === undefined) {
    throw ApiError.notFound(`Fare not defined between "${startStoppage}" and "${endStoppage}" on this route`);
  }

  return fare;
};

/**
 * Deducts fare from card balance within a session.
 * Rejects if balance would fall below -100.
 */
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
