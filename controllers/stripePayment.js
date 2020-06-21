require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const uuid = require("uuid/v4");

exports.makePayment = (req, res) => {
  const { products, token } = req.body; // token consist of every info that we need
  console.log("PRODUCTS", products);
  const amount = products.reduce(
    (accumulator, currentVal) => accumulator + currentVal.price,
    0
  );

  const idempotencyKey = uuid(); // Not to charge user multiple times in case of network failure

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges
        .create(
          {
            amount: amount * 100,
            currency: "INR",
            customer: customer.id,
            receipt_email: "shubhamgupta.com@gmail.com", // token.email is the right value actually
            description: "product description",
            shipping: {
              name: token.card.name,
              address: {
                line1: token.card.address_line1,
                line2: token.card.address_line2,
                city: token.card.address_city,
                country: token.card.address_country,
                postal_code: token.card.address_zip,
              },
            },
          },
          { idempotencyKey }
        ) // in the first '{}', info like amount and currency is stored
        .then((result) => res.status(200).json(result))
        .catch((err) => console.log(err));
    });
};
