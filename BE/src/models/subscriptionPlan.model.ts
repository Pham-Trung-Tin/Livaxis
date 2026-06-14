import { Schema, model, Document } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  planId: string; // 'free' | 'starter' | 'standard' | 'premium'
  name: {
    vi: string;
    en: string;
  };
  tagline: {
    vi: string;
    en: string;
  };
  price: number; // raw price in VND
  priceNote?: {
    vi: string;
    en: string;
  };
  turns: number;
  turnsNote?: {
    vi: string;
    en: string;
  };
  turnsToAdd: number;
  cta: {
    vi: string;
    en: string;
  };
  ctaStyle: 'ghost' | 'outline' | 'charcoal' | 'gold';
  badge?: {
    vi: string;
    en: string;
  };
  features: {
    vi: string[];
    en: string[];
  };
  extras?: {
    vi: string[];
    en: string[];
  };
  order: number;
  isActive: boolean;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      vi: { type: String, required: true },
      en: { type: String, required: true },
    },
    tagline: {
      vi: { type: String, required: true },
      en: { type: String, required: true },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceNote: {
      vi: { type: String },
      en: { type: String },
    },
    turns: {
      type: Number,
      required: true,
    },
    turnsNote: {
      vi: { type: String },
      en: { type: String },
    },
    turnsToAdd: {
      type: Number,
      required: true,
    },
    cta: {
      vi: { type: String, required: true },
      en: { type: String, required: true },
    },
    ctaStyle: {
      type: String,
      enum: ['ghost', 'outline', 'charcoal', 'gold'],
      required: true,
    },
    badge: {
      vi: { type: String },
      en: { type: String },
    },
    features: {
      vi: { type: [String], required: true },
      en: { type: [String], required: true },
    },
    extras: {
      vi: { type: [String] },
      en: { type: [String] },
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'subscription_plans',
  }
);

const SubscriptionPlan = model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);

export default SubscriptionPlan;
