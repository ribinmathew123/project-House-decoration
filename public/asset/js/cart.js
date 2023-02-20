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

function deleteItem(productId,price) {

//   fetch(`/product/removecart?id=${productId}`, { method: "PUT" })
//     .then((response) => {
//       if (response.ok) {
//         console.log(
//           `Item with product id ${productId} was deleted successfully.`
//         );
//         const itemRow = document.getElementById(`cart-item-${productId}`);
//         if (itemRow) {
//           itemRow.remove();
//         }
//       } else {
//         console.error(
//           "Failed to delete item:",
//           response.status,
//           response.statusText
//         );
//       }
//     })
//     .catch((error) => {
//       console.error("Failed to delete item:", error);
//     });
// }


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
  })
  .then((willDelete) => {
    if (willDelete) {
      fetch(`/product/removecart?id=${productId}`, {
        method: 'PUT',
      })
      .then(response => {
        console.log(response);
        const itemRow = document.getElementById(`cart-item-${productId}`);
        if (itemRow) {
          itemRow.remove();
          total.innerText = parseInt(total.innerText) - Number(price);
          total_amount.innerText = Number(total_amount.innerText) - Number(price);
          sub_total.innerText = Number(sub_total.innerText) - Number(price);
        }
      })
      .catch(error => {
        // Handle errors here
        console.error(error);
      });
    }
  });
}


  





// coupon code
function applyCoupon() {
  const couponCode = document.getElementById("coupon-code-input").value;
  let total_amount = document.querySelector("#total-amount1");
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
      total_amount.innerText =Number(total_amount.innerText-data.discount)
    })
    .catch((error) => {
      console.error("Failed to apply coupon:" + error);
    });
}



