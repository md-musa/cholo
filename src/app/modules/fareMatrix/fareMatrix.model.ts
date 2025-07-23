import mongoose, { Schema, Document } from 'mongoose';

interface FareMatrixType {
  [startStopage: string]: {
    [endStopage: string]: number;
  };
}

export interface IFareMatrix extends Document {
  routeId: mongoose.Types.ObjectId;
  fareMatrix: FareMatrixType;
}

const FareMatrixSchema: Schema = new Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
    unique: true, 
  },
  fareMatrix: {
    type: Map,
    of: {
      type: Map,
      of: Number,
    },
    required: true,
  },
});

export const FareMatrix = mongoose.model<IFareMatrix>('FareMatrix', FareMatrixSchema);


