class CashRegister {
  constructor() {
    this.itemsForSale = {
      "Phone": 300,
      "Smart TV": 220,
      "Gaming Console": 150
    };
    this.shoppingCart = [];
  }

  // Add item to cart
  addItem(itemName) {
    if (this.itemsForSale[itemName]) {
      this.shoppingCart.push(itemName);
      this.updateCartDisplay();
      this.showMessage(`${itemName} added to cart.`);
    } else {
      this.showMessage(`Sorry, we don’t sell ${itemName}.`);
    }
  }

  // Calculate totals
  calculateTotals() {
    let totalBefore = 0;
    for (let item of this.shoppingCart) {
      totalBefore += this.itemsForSale[item];
    }

    let totalAfter = totalBefore;
    if (totalBefore > 400) {
      totalAfter = totalBefore * 0.9; // Apply 10% discount
    }

    return { totalBefore, totalAfter };
  }

  // Payment method
  pay(paymentAmount) {
    const { totalBefore, totalAfter } = this.calculateTotals();

    if (this.shoppingCart.length === 0) {
      this.showMessage("Your cart is empty. Add items first!");
      return;
    }

    if (paymentAmount === totalAfter) {
      this.showMessage(`Total: $${totalBefore} → After 10% discount: $${totalAfter.toFixed(2)}. Payment exact. Thank you!`);
    } else if (paymentAmount > totalAfter) {
      let change = paymentAmount - totalAfter;
      this.showMessage(`Total: $${totalBefore} → After 10% discount: $${totalAfter.toFixed(2)}. Payment successful. Change: $${change.toFixed(2)}.`);
    } else {
      let shortage = totalAfter - paymentAmount;
      this.showMessage(`Total: $${totalBefore} → After 10% discount: $${totalAfter.toFixed(2)}. Insufficient payment. You need $${shortage.toFixed(2)} more.`);
    }
  }

  // Update cart display
  updateCartDisplay() {
    const cartList = document.getElementById("cartList");
    cartList.innerHTML = "";
    for (let item of this.shoppingCart) {
      let li = document.createElement("li");
      li.textContent = `${item} - $${this.itemsForSale[item]}`;
      cartList.appendChild(li);
    }

    const { totalBefore, totalAfter } = this.calculateTotals();
    document.getElementById("totalBefore").textContent = totalBefore.toFixed(2);
    document.getElementById("totalAfter").textContent = totalAfter.toFixed(2);
  }

  // Show message
  showMessage(message) {
    document.getElementById("output").textContent = message;
  }

  // Clear cart
  clearCart() {
    this.shoppingCart = [];
    this.updateCartDisplay();
    this.showMessage("Cart cleared.");
  }
}

// Create register instance
let register = new CashRegister();

// Handle payment
function makePayment() {
  let paymentInput = document.getElementById("paymentInput").value;
  let amount = parseFloat(paymentInput);
  if (!isNaN(amount)) {
    register.pay(amount);
  } else {
    register.showMessage("Please enter a valid payment amount.");
  }
}

// Handle adding custom item
function addCustomItem() {
  let itemInput = document.getElementById("itemInput").value.trim();
  if (itemInput) {
    register.addItem(itemInput);
    document.getElementById("itemInput").value = "";
  } else {
    register.showMessage("Please enter an item name.");
  }
}

// Clear cart
function clearCart() {
  register.clearCart();
}
