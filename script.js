let products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 1499,
        image: "🎧",
        category: "electronics"
    },
    {
        id: 2,
        name: "Mechanical Keyboard",
        price: 2499,
        image: "⌨️",
        category: "electronics"
    },
    {
        id: 3,
        name: "Wireless Mouse",
        price: 799,
        image: "🖱️",
        category: "electronics"
    },
    {
        id: 4,
        name: "Smart Watch",
        price: 1999,
        image: "⌚",
        category: "accessories"
    }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function displayProducts(productList) {

    let productContainer = document.getElementById("products");

    productContainer.innerHTML = "";

    if (productList.length === 0) {
        productContainer.innerHTML = "<p>No products found.</p>";
        return;
    }

    productList.forEach(function(product) {

        productContainer.innerHTML += `
            <div class="product-card">

                <div class="product-image">
                    ${product.image}
                </div>

                <h3>${product.name}</h3>

                <p>₹${product.price}</p>

                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

            </div>
        `;
    });
}


function filterProducts() {

    let searchText = document.getElementById("search").value.toLowerCase();

    let category = document.getElementById("category").value;

    let filteredProducts = products.filter(function(product) {

        let matchesSearch =
            product.name.toLowerCase().includes(searchText);

        let matchesCategory =
            category === "all" ||
            product.category === category;

        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}


function addToCart(productId) {

    let product = products.find(function(item) {
        return item.id === productId;
    });

    let existingProduct = cart.find(function(item) {
        return item.id === productId;
    });

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    displayCart();
}


function displayCart() {

    let cartItems = document.getElementById("cart-items");
    let cartCount = document.getElementById("cart-count");
    let totalElement = document.getElementById("total");

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    if (cart.length === 0) {

        cartItems.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';

    } else {

        cart.forEach(function(product, index) {

            let itemTotal = product.price * product.quantity;

            total += itemTotal;
            count += product.quantity;

            cartItems.innerHTML += `
                <div class="cart-item">

                    <div class="cart-item-info">

                        <div>
                            <h3>${product.name}</h3>
                            <p>₹${product.price}</p>
                        </div>

                        <div class="quantity">

                            <button onclick="decreaseQuantity(${index})">
                                -
                            </button>

                            <span>${product.quantity}</span>

                            <button onclick="increaseQuantity(${index})">
                                +
                            </button>

                        </div>

                    </div>

                    <div>
                        <strong>₹${itemTotal}</strong>

                        <button
                            class="remove-btn"
                            onclick="removeFromCart(${index})">
                            Remove
                        </button>
                    </div>

                </div>
            `;
        });
    }

    cartCount.textContent = count;
    totalElement.textContent = total;
}


function increaseQuantity(index) {

    cart[index].quantity++;

    saveCart();
    displayCart();
}


function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }

    saveCart();
    displayCart();
}


function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();
    displayCart();
}


function clearCart() {

    cart = [];

    saveCart();
    displayCart();
}

function saveCart() {

    localStorage.setItem("cart", JSON.stringify(cart));
}


displayProducts(products);
displayCart();


async function placeOrder() {

    let name =
        document.getElementById("customer-name").value.trim();

    let email =
        document.getElementById("customer-email").value.trim();

    let address =
        document.getElementById("customer-address").value.trim();


    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }


    if (!name || !email || !address) {

        alert("Please fill all details!");

        return;
    }


    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        alert("Please enter a valid email!");

        return;
    }


    let orderId =
        "ORD-" +
        Math.floor(100000 + Math.random() * 900000);


    let total = 0;


    let itemsData = cart.map(function(item) {

        let amount =
            item.price * item.quantity;

        total += amount;


        return (
            item.name +
            "~" +
            item.quantity +
            "~" +
            amount
        );

    }).join(";");


    let orderData =
        orderId +
        "|" +
        name +
        "|" +
        email +
        "|" +
        address +
        "|" +
        itemsData +
        "|" +
        total;


    try {

        let response = await fetch(
            "http://localhost:8080/order",
            {

                method: "POST",

                headers: {
                    "Content-Type": "text/plain"
                },

                body: orderData
            }
        );


        if (!response.ok) {

            throw new Error(
                "Backend request failed"
            );
        }


        let result =
            await response.json();


        document.getElementById(
            "order-message"
        ).innerHTML = `

            <div class="order-confirmation">

                <h2>
                    🎉 Order Placed Successfully!
                </h2>

                <p>
                    <strong>Order ID:</strong>
                    ${orderId}
                </p>

                <p>
                    <strong>Customer:</strong>
                    ${name}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${email}
                </p>

                <p>
                    <strong>Address:</strong>
                    ${address}
                </p>

                <h3>Order Details</h3>

                ${cart.map(function(item) {

                    return `
                        <p>
                            ${item.name}
                            × ${item.quantity}
                            = ₹${item.price * item.quantity}
                        </p>
                    `;

                }).join("")}

                <h3>
                    Total: ₹${total}
                </h3>

                <p>
                    ${result.message}
                </p>

            </div>
        `;


        cart = [];

        saveCart();

        displayCart();


        document.getElementById(
            "customer-name"
        ).value = "";

        document.getElementById(
            "customer-email"
        ).value = "";

        document.getElementById(
            "customer-address"
        ).value = "";


    } catch (error) {

        document.getElementById(
            "order-message"
        ).innerHTML = `

            <p>
                ❌ Cannot connect to Java backend.
                Please start the Java server first.
            </p>
        `;

        console.error(error);
    }
}