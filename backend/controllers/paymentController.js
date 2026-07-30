import Stripe from "stripe";
import Course from "../models/Course.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";

// IMPORTANT: don't build the Stripe client at module load time. ES module
// imports run before dotenv.config() has populated process.env, so a
// top-level `new Stripe(process.env.STRIPE_SECRET_KEY)` here would always
// capture an empty key regardless of what's actually in .env. Creating it
// lazily on first real use (well after the server has finished starting up)
// guarantees it always reads the real value.
let stripeClient = null;
const getStripe = () => {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
  }
  return stripeClient;
};

// Shared by both the webhook and the verify-session fallback below, so a
// purchase completes the same way regardless of which path notices it paid.
const completeOrder = async (order) => {
  if (order.status === "paid") return order; // already handled, avoid double-enrolling

  order.status = "paid";
  await order.save();

  await Course.findByIdAndUpdate(order.course, { $inc: { enrolledCount: 1 } });
  await User.findByIdAndUpdate(order.user, {
    $addToSet: { enrolledCourses: order.course },
  });
  await Progress.findOneAndUpdate(
    { user: order.user, course: order.course },
    {},
    { upsert: true, setDefaultsOnInsert: true }
  );

  return order;
};

// POST /api/payments/checkout  { courseId, couponCode }
// Creates a Stripe Checkout session for a single course purchase.
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { courseId, couponCode } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    let amount = Math.round(course.price * 100); // to cents

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        amount = Math.round(amount * (1 - coupon.percentOff / 100));
      } else {
        coupon = null;
      }
    }

    const order = await Order.create({
      user: req.user._id,
      course: course._id,
      amount,
      couponCode: coupon ? coupon.code : null,
      status: "pending",
    });

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: course.title },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: order._id.toString(), courseId: course._id.toString() },
      success_url: `${process.env.CLIENT_URL}/checkout/success?order=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.status(201).json({ url: session.url, orderId: order._id });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/webhook  (Stripe calls this; raw body required, see server.js)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const order = await Order.findById(session.metadata.orderId);
    if (order) await completeOrder(order);
  }

  res.json({ received: true });
};

// GET /api/payments/orders/:orderId/verify
// Fallback for local dev (or as a safety net in production) when the
// webhook hasn't fired yet: checks the order's Stripe session directly and
// completes the enrollment if Stripe confirms it was actually paid.
export const verifyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "paid") {
      return res.json({ status: "paid", order });
    }

    if (!order.stripeSessionId) {
      return res.json({ status: order.status, order });
    }

    const session = await getStripe().checkout.sessions.retrieve(order.stripeSessionId);
    if (session.payment_status === "paid") {
      const updated = await completeOrder(order);
      return res.json({ status: "paid", order: updated });
    }

    res.json({ status: order.status, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/orders/mine
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("course", "title price");
    res.json(orders);
  } catch (err) {
    next(err);
  }
};
