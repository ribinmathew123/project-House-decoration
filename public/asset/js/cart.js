
function incrementCount(userId, productId, price) {
  const baseUrl = window.location.origin;
  let quantity = document.querySelector("#Quantity" + productId);
  let total = document.querySelector("#total-price" + productId);
  let sub_total = document.querySelector("#total-amount1");
  let total_amount = document.querySelector("#total-amount2");

  fetch(baseUrl + "/product/increment-decrement-count/inc", {
    method: "PUT",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      user_id: userId,
    }),
  }).then(() => {
    quantity.innerText = Number(quantity.innerText) + 1;
    total_amount.innerText = Number(total_amount.innerText) + Number(price);
    sub_total.innerText = Number(sub_total.innerText) + Number(price);
    total.innerText = parseInt(total.innerText) + Number(price);
  });
}




function decrementCount(userId, productId, price) {
  let quantity = document.querySelector("#Quantity" + productId);
  let total = document.querySelector("#total-price" + productId);
  let sub_total = document.querySelector("#total-amount1");
  let total_amount = document.querySelector("#total-amount2");
  const baseUrl = window.location.origin;
  if (Number(quantity.innerText) > 1) { 
    fetch(baseUrl + "/product/increment-decrement-count/dec", {
      method: "PUT",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        user_id: userId,
      }),
    }).then(() => {
      quantity.innerText = Number(quantity.innerText) - 1;
      total.innerText = parseInt(total.innerText) - Number(price);
      total_amount.innerText = Number(total_amount.innerText) - Number(price);
      sub_total.innerText = Number(sub_total.innerText) - Number(price);
    });
  } else {
    console.log("error");
  }
}




// Make an AJAX request to update the total price
function updateTotalPrice(quantity, productId) {
  $.ajax({
    url: "/update-total-price",
    type: "POST",
    data: {
      quantity: quantity,
      productId: productId,
    },
    success: function (data) {
      // Update the total price on the page
      $("#total-price").text(data.totalPrice);
    },
  });
}

// cart product delete




function deleteItem(productId, price) {  

  let quantity = document.querySelector("#Quantity" + productId);
  let total = document.querySelector("#total-price" + productId);
  let sub_total = document.querySelector("#total-amount1");
  let total_amount = document.querySelector("#total-amount2");
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this item!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      fetch(`/product/removecart?id=${productId}`, {
        method: "PUT",
      })
        .then((response) => {
          console.log(response);
          const itemRow = document.getElementById(`cart-item-${productId}`);
          if (itemRow) {
            itemRow.remove();
            total.innerText = parseInt(total.innerText) - Number(price);
            total_amount.innerText =
              Number(total_amount.innerText) - Number(price);
            sub_total.innerText = Number(sub_total.innerText) - Number(price);
          }
        })
        .catch((error) => {
          // Handle errors here
          console.error(error);
        });
    }
  });
}

let status = false

function applyCoupon() {
  const couponCode = document.getElementById("coupon-code-input").value;
  let total_amount = document.querySelector("#total-amount1");

  if(!status){
    fetch("/product/couponcheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ couponCode: couponCode }),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      console.log(data.minimumAmount);

      if (data.minimumAmount <= total_amount.innerText) {
        const discountAmount = data.discount / 100;
        const totalDiscount = Number(total_amount.innerText * discountAmount);
        const newTotal = Number(total_amount.innerText - totalDiscount);
        total_amount.innerText = newTotal;
        status=true;
        Swal.fire({
          icon: 'success',
          title: 'Coupon applied successfully!',
          text: `Discount: ${totalDiscount.toFixed(2)}\nNew total: ${newTotal.toFixed(2)}`,
        });
      } else {
        console.log("Minimum amount not met");
        Swal.fire({
          icon: 'warning',
          title: 'Minimum amount not met',
          text: `The minimum amount required for this coupon is ${data.minimumAmount}`,
        });
      }
    })
    .catch((error) => {
      console.error("Failed to apply coupon:" + error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to apply coupon',
      });
    });
  }
}





function onlinePayment(userId) {
  const amount = document.querySelector("#totalAmount").innerText;
  const name = document.querySelector("#name").value;
  const shop = document.querySelector("#shop").value;
  const state = document.querySelector("#state").value;
  const city = document.querySelector("#city").value;
  const street = document.querySelector("#street").value;
  const code = document.querySelector("#code").value;
  const email = document.querySelector("#email").value;
  const mobile = document.getElementById("mobile").value;

  const status = document.getElementById("rzp-button1");
  const statusdata = status.getAttribute("data-value");

  fetch("/product/order", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      var options = {
        key: "rzp_test_7gAGPftwtY20XB", // Enter the Key ID generated from the Dashboard
        name: "Test Company",
        amount: res.order.amount,
        order_id: res.order.id, // For one time payment
        handler: function (response) {
          console.log(response);


          fetch("/product/confirm-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              shop,
              state,
              city,
              street,
              code,
              email,
              mobile,
              userId,
              statusdata,
              response,
            }),
          })
            .then(() => {
              console.log("Order confirmation successful");
              // Show a sweet alert upon successful payment
              swal({
                title: "Payment Successful",
                text: "Thank you for your purchase.",
                icon: "success",
              }).then(() => {
                window.location.href = "/";
              });
            })
            .catch((error) => {
              console.error("Error while confirming order:", error);
            });
        },
      };

      var rzp1 = new Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        swal({
          title: "Payment Failed",
          text: response.error.description,
          icon: "error",
        });
        console.log(response.error);
      });
      rzp1.open();
    })
    .catch((error) => {
      console.error("Error while fetching order:", error);
    });
}


// cashondelivery


function cashOnDelivary(userId){
  const amount = document.querySelector("#totalAmount").innerText;
  const name = document.querySelector("#name").value;
  const shop = document.querySelector("#shop").value;
  const state = document.querySelector("#state").value;
  const city = document.querySelector("#city").value;
  const street = document.querySelector("#street").value;
  const code = document.querySelector("#code").value;
  const email = document.querySelector("#email").value;
  const mobile = document.getElementById("mobile").value;

  const url = window.location.origin;
  console.log(url);
  fetch(`${url}/cashon-delivery?userId=${userId}`, {
      method: 'POST',
      headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({

        amount,name,shop,state,city,street,code,email,mobile
     
      })
  })
      .then((response) => {
      if (response.ok) {
          return response.json();
      }
      throw new Error('Network response was not ok');
      })
      .then((data) => {
      console.log(data, 'This is data');
      swal({
          title: "Order Placed Successfully!",
          text: `Your order has been placed successfully! Your order id is ${data.orderId}`,
          icon: "success",
          button: "Okay",
      })
          .then(() => {
              window.location.href = `/success-page/${userId}`;
          });
          setTimeout(() => {
              window.location.href = `/success-page/${userId}`;
          }, 3000);
      })
      .catch((error) => {
      console.error(`There was a problem with the fetch operation: ${error.message}`);
      // Show error modal
      swal({
          title: "Error",
          text: "There was an error placing your order. Please try again later.",
          icon: "error",
          button: "Okay",
      });
      });
}
