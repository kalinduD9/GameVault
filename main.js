document.addEventListener('DOMContentLoaded', () => {
    // Add to Favourites
    document.querySelectorAll('[id^="add-"]').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.parentElement;
            const name = item.querySelector('p').textContent; // Get the name of the item
            const priceText = item.querySelector('.item-price').textContent; // Get the price text
            const price = parseFloat(priceText.replace('Price: $', '')); // Extract the numeric price

            // Retrieve existing favourites or initialize an empty array
            const favourites = JSON.parse(localStorage.getItem('favourites') || '[]');

            // Check if the item already exists in favourites
            const existingItem = favourites.find(fav => fav.name === name);
            if (!existingItem) {
                // Add new item to the favourites array
                favourites.push({ name, price });
                localStorage.setItem('favourites', JSON.stringify(favourites));
            } else {
                // Notify the user that the item is already in favourites
                alert('This item is already in your favourites.');
            }
        });
    });

    // Apply Favourites in Favourites Page
    const applyFavouritesButton = document.getElementById('apply-favorites');
    if (applyFavouritesButton) {
        applyFavouritesButton.addEventListener('click', () => {
            const favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
            const tableBody = document.querySelector('#cart-table tbody');
            tableBody.innerHTML = ''; // Clear existing rows

            if (favourites.length > 0) {
                favourites.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td><input type="number" min="1" value="1" class="quantity"></td>
                        <td>$${item.price}</td>
                        <td class="total">$${item.price}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `<td colspan="4" class="empty-cart-message">Your cart is currently empty.</td>`;
                tableBody.appendChild(emptyRow);
            }
        });
    }

    // Confirm Button Functionality
    const confirmButton = document.getElementById('confirm');
    if (confirmButton) {
        confirmButton.addEventListener('click', () => {
            let grandTotal = 0;
            document.querySelectorAll('#cart-table tbody tr').forEach(row => {
                const quantityInput = row.querySelector('.quantity');
                if (quantityInput) {
                    const quantity = parseInt(quantityInput.value, 10);
                    const price = parseFloat(row.children[2].textContent.replace('$', ''));
                    const total = quantity * price;
                    row.querySelector('.total').textContent = `$${total.toFixed(2)}`;
                    grandTotal += total;
                }
            });
            document.getElementById('grand-total').textContent = `$${grandTotal.toFixed(2)}`;
        });
    }

    // Redirect to Order Form and Display Summary
    const buyNowButton = document.getElementById('buy-now');
    if (buyNowButton) {
        buyNowButton.addEventListener('click', () => {
            const orderDetails = [];
            let grandTotal = 0;

            document.querySelectorAll('#cart-table tbody tr').forEach(row => {
                const name = row.children[0].textContent;
                const quantityInput = row.querySelector('.quantity');
                if (quantityInput) {
                    const quantity = parseInt(quantityInput.value, 10);
                    const price = parseFloat(row.children[2].textContent.replace('$', ''));
                    const total = quantity * price;
                    grandTotal += total;
                    orderDetails.push({ name, quantity, price: `$${total.toFixed(2)}` });
                }
            });

            localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
            localStorage.setItem('grandTotal', `$${grandTotal.toFixed(2)}`);
            window.location.href = 'orderform.html';
        });
    }

    // Display Order Details in Order Form Page
    if (window.location.pathname.endsWith('orderform.html')) {
        const orderDetails = JSON.parse(localStorage.getItem('orderDetails') || '[]');
        const grandTotal = localStorage.getItem('grandTotal') || '$0';

        const orderDetailsContainer = document.getElementById('order-details');
        const grandTotalElement = document.getElementById('grand-total');
        const form = document.getElementById('order-form'); // Make sure the form element is selected

        // Append order details
        orderDetails.forEach(item => {
            const p = document.createElement('p');
            p.textContent = `${item.quantity} x ${item.name}: ${item.price}`;
            orderDetailsContainer.appendChild(p);
        });

        // Update grand total
        grandTotalElement.textContent = `Grand Total: ${grandTotal}`;

        // Set a constant delivery date (e.g., 5 days from today)
        const today = new Date();
        const deliveryDate = new Date(today.setDate(today.getDate() + 5));
        const formattedDeliveryDate = deliveryDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        // Handle Form Submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.querySelector('#name').value;
            if (name) {
                alert(`Thank you for your purchase! Your items will be delivered on ${formattedDeliveryDate}.`);
                localStorage.removeItem('favourites'); // Clear localStorage after the order
                localStorage.removeItem('orderDetails');
                localStorage.removeItem('grandTotal');
            } else {
                alert('Please fill in all the fields.');
            }
        });
    };
});