import { Router, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config({ path: "variables.env" });
var Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const routerStripe = Router();

routerStripe.post("/create-payment-intent", async (req, res) => {
  const {
    amount,
    currency,
    customer,
    request_three_d_secure,
    payment_method_types = [],
  }: {
    amount: number;
    currency: string;
    customer: string;
    payment_method_types: string[];
    request_three_d_secure: "any" | "automatic";
  } = req.body;

  const params = {
    amount: amount,
    currency: currency,
    customer: customer,
    payment_method_options: {
      card: {
        request_three_d_secure: request_three_d_secure || "automatic",
      },
    },
    payment_method_types: payment_method_types,
  };

  try {
    const paymentIntent = await Stripe.paymentIntents.create(params);
    return res.send({
      paymentIntent: paymentIntent,
    });
  } catch (error) {
    return res.send({
      error: error.raw.message,
    });
  }
});


routerStripe.post("/delete-card", async (req, res) => {
  const { cardID } = req.body;
  const done = await Stripe.paymentMethods.detach(cardID);

  if (done) {
    res
      .status(200)
      .json({ success: true, message: "success_delete_card" })
      .end();
  } else {
    res
      .status(400)
      .json({ success: false, message: "error_delete_card" })
      .end();
  }
});

routerStripe.get("/get-card", async (req: Request, res: Response) => {
  const { customers } = req.query;
  if (customers) {
    const paymentMethods = await Stripe.paymentMethods.list({
      customer: customers,
      type: "card",
    });
    res.status(200).json(paymentMethods).end();
  } else {
    res.status(400).json(null).end();
  }
});

export default routerStripe;
