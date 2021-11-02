/*
    Core Logic/payment flow and CSS comes from:
    https://stripe.com/docs/libraries
*/

var stripePublicKey = $("#id_stripe_public_key").text().slice(1, -1);
var clientSecret = $("#id_client_secret").text().slice(1, -1);
var stripe = Stripe(stripePublicKey);
var elements = stripe.elements();

var style = {
  base: {
    color: "#000",
    "::placeholder": {
      color: "#aab7c4",
    },
  },
  invalid: {
    color: "#dc3545",
    iconColor: "#dc3545",
  },
};

var card = elements.create("card", { style: style });
card.mount("#checkout__card-element");

// Handle realtime validation errors on the card element
card.addEventListener("change", function (event) {
  var errorDiv = document.getElementById("checkout__card-errors");
  if (event.error) {
    var html = `
            <span class="icon">
                <i class="fas fa-times"></i>
            </span>
            <span>${event.error.message}</span>
        `;
    $(errorDiv).html(html);
  } else {
    errorDiv.textContent = "";
  }
});

// Handle form submit

var form = document.getElementById("checkout__payment-form");

form.addEventListener("submit", function (ev) {
  ev.preventDefault();
  card.update({ disabled: true });
  $("#submit-button").attr("disabled", true);
  $("#checkout__payment-form").fadeToggle(100);
  $("#checkout__loading-overlay").fadeToggle(100);
  stripe
    .confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      },
    })
    .then(function (result) {
      if (result.error) {
        // Show error to customer
        var errorDiv = document.getElementById("checkout__card-errors");
        var html = `
            <span class="icon">
                <i class="fas fa-times"></i>
            </span>
            <span>${result.error.message}</span>
        `;
        $(errorDiv).html(html);
        $("#checkout__payment-form").fadeToggle(100);
        $("#checkout__loading-overlay").fadeToggle(100);
        card.update({ disable: false });
        $("#submit-button").attr("disabled", false);
      } else {
        // Payment has been processed!
        if (result.paymentIntent.status === "succeeded") {
          form.submit();
        }
      }
    });
});
