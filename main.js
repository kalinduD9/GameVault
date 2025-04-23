// Wait until the HTML is fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // Button references
    const applyButton = document.getElementById('apply-favorites');
    const confirmButton = document.getElementById('confirm');
    const buyNowButton = document.getElementById('buy-now');

    // Initial state of buttons
    if (applyButton) applyButton.disabled = false;
    if (confirmButton) confirmButton.disabled = true;
    if (buyNowButton) buyNowButton.disabled = true;

    // Notification element for already existing items and successful purchases
    const notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);
  
    // Massage for empty favoirites
    const MESSAGE = {
         EMPTY_FAV: 'Your favourites are currently empty.',
    };

    // Function to handle adding items to favourites
    function addToFavourites(event) {
        const button = event.target;
        const item = button.parentElement;

        // Get item name and price
        const name = item.querySelector('p').textContent;
        const priceText = item.querySelector('.item-price').textContent;
        const price = parseFloat(priceText.replace('Price: $', ''));

        // Get existing favourites or create a new empty list
        let favourites = JSON.parse(localStorage.getItem('favourites') || '[]');

        // Check if the item is already in the favourites
        let itemExists = false;
        for (let i = 0; i < favourites.length; i++) {
            if (favourites[i].name === name) {
                itemExists = true;
                break;
            }
        }

        // If item is not already in favourites, add it
        if (!itemExists) {
            favourites.push({ name: name, price: price });
            localStorage.setItem('favourites', JSON.stringify(favourites));
        } else {
            notification.textContent = 'This item is already in your favourites.';
            notification.classList.add('visible');

            setTimeout(() => {
                notification.classList.remove('visible');
            }, 3000);
        }
    }

    // Add click event to all add to favourites buttons
    const addButtons = document.querySelectorAll('[id^="add-"]');
    for (let i = 0; i < addButtons.length; i++) {
        addButtons[i].addEventListener('click', addToFavourites);
    }

    // Add items from favourites to the cart when button is clicked
    if (applyButton) {
        applyButton.addEventListener('click', function () {
            const favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
            const tableBody = document.querySelector('#cart-table tbody');
            tableBody.innerHTML = ''; // Clear previous rows

            // Add favourites items to the cart table
            if (favourites.length > 0) {
                favourites.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML =
                        '<td>' + item.name + '</td>' +
                        '<td><input type="number" min="1" value="1" class="quantity"></td>' +
                        '<td>$' + item.price + '</td>' +
                        '<td class="total">$' + item.price + '</td>';
                    tableBody.appendChild(row);
                });
                
                // Enable the confirm button
                confirmButton.disabled = false; 

            } else {
                // Show a message if favourites are empty
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="4">' + MESSAGE.EMPTY_FAV + '</td>';
                tableBody.appendChild(row);
            }    
        });
    }

    // Calculate total price when "Confirm" button is clicked
    if (confirmButton) {
        confirmButton.addEventListener('click', function () {
            let grandTotal = 0;
            const rows = document.querySelectorAll('#cart-table tbody tr');

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const quantity = parseInt(row.querySelector('.quantity').value);
                const price = parseFloat(row.children[2].textContent.replace('$', ''));
                const total = quantity * price;

                // Update the total for this item
                row.querySelector('.total').textContent = '$' + total.toFixed(2);
                grandTotal += total; // Add to the grand total
            }

            // Show the final total on the page
            document.getElementById('grand-total').textContent = '$' + grandTotal.toFixed(2);
            
            // Enable the buy Now button
            buyNowButton.disabled = false; 
        });
    }

    // Handle "Buy Now" button: save order and go to order form
    if (buyNowButton) {
        buyNowButton.addEventListener('click', function () {
            const orderDetails = [];
            let grandTotal = 0;
            const rows = document.querySelectorAll('#cart-table tbody tr');

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const name = row.children[0].textContent;
                const quantity = parseInt(row.querySelector('.quantity').value);
                const price = parseFloat(row.children[2].textContent.replace('$', ''));
                const total = quantity * price;

                // Save order info
                orderDetails.push({ name: name, quantity: quantity, price: total });
                grandTotal += total;
            }

            // Save order info in localStorage and redirect to order form
            localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
            localStorage.setItem('grandTotal', '$' + grandTotal.toFixed(2));
            window.location.href = 'orderform.html'; // Go to order form page
        });
    }

    // If we are on the order form page, show the order summary
    if (window.location.href.includes('orderform.html')) {
        const orderDetails = JSON.parse(localStorage.getItem('orderDetails') || '[]');
        const grandTotal = localStorage.getItem('grandTotal') || '$0';
        const orderDetailsContainer = document.getElementById('order-details');
        const grandTotalElement = document.getElementById('grand-total');
        const form = document.getElementById('order-form');

        // Show each item in the order summary
        for (let i = 0; i < orderDetails.length; i++) {
            const item = orderDetails[i];
            const p = document.createElement('p');
            p.textContent = item.quantity + ' x ' + item.name + ': $' + item.price.toFixed(2);
            orderDetailsContainer.appendChild(p);
        }

        // Show the grand total
        grandTotalElement.textContent = 'Grand Total: ' + grandTotal;

        // Define a configurable delivery time in days
        const DELIVERY_TIME_DAYS = 5;

        // Calculate delivery date based on the configurable delivery time
        const today = new Date();
        today.setDate(today.getDate() + DELIVERY_TIME_DAYS);
        const deliveryDate = today.toISOString().split('T')[0];

        // Handle form submission
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const nameInput = form.querySelector('#name').value;

            if (nameInput) {
            // Show confirmation message
            notification.textContent = 'Thank you for your purchase! Your items will be delivered on ' + deliveryDate + '.';
            notification.classList.add('visible');

            setTimeout(() => {
                notification.classList.remove('visible');
            }, 4000);

            // Clear saved data after submitting
            localStorage.removeItem('favourites');
            localStorage.removeItem('orderDetails');
            localStorage.removeItem('grandTotal');

            // Clear the form fields
            form.reset();
            } else {
            alert('Please fill in all the fields.');
            }
        });
    }

});
