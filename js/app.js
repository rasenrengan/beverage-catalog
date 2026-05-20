document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('products-grid');
    const categoryFilters = document.getElementById('category-filters');
    
    if (!productsGrid || !categoryFilters) return;

    let allProducts = [];

    // Fetch products
    fetch('data/products.json')
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            renderProducts(allProducts);
        })
        .catch(error => console.error('Error loading products:', error));

    // Category Filtering
    categoryFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            // Update active class
            categoryFilters.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            e.target.classList.add('active');

            const category = e.target.getAttribute('data-category');
            
            if (category === 'All') {
                renderProducts(allProducts);
            } else {
                const filtered = allProducts.filter(p => p.category === category);
                renderProducts(filtered);
            }
        }
    });

    // Check URL parameters for category filtering (from homepage)
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category');
    
    if (initialCategory) {
        setTimeout(() => {
            const filterLi = document.querySelector(`li[data-category="${initialCategory}"]`);
            if (filterLi) {
                filterLi.click();
            }
        }, 100);
    }

    // Render Function
    function renderProducts(products) {
        productsGrid.innerHTML = '';
        
        if (products.length === 0) {
            productsGrid.innerHTML = '<p style="color: #a0aab2; grid-column: 1/-1; text-align: center;">No products found in this category.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('a');
            card.href = `product.html?id=${product.id}`;
            card.className = 'product-card';
            
            // Format price
            const formattedPrice = new Intl.NumberFormat('en-EG', {
                style: 'currency',
                currency: 'EGP'
            }).format(product.price);

            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-img">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${formattedPrice}</div>
            `;
            
            productsGrid.appendChild(card);
        });
        
        // Add subtle animation to new cards
        const cards = productsGrid.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    // Product Detail Page Logic
    const productDetailContainer = document.getElementById('product-detail-container');
    if (productDetailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            fetch('data/products.json')
                .then(response => response.json())
                .then(data => {
                    const product = data.find(p => p.id === productId);
                    if (product) {
                        const formattedPrice = new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(product.price);
                        
                        // Set document title dynamically
                        document.title = `${product.name} | Royal Beverages`;

                        productDetailContainer.innerHTML = `
                            <div style="flex: 1;">
                                <img src="${product.image}" alt="${product.name}" style="width: 100%; max-height: 500px; object-fit: contain; border-radius: 10px;">
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                                <div style="color: var(--accent); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">${product.category}</div>
                                <h1 style="font-size: 2.5rem; margin-bottom: 20px;">${product.name}</h1>
                                <div style="font-size: 2rem; font-weight: 800; margin-bottom: 30px;">${formattedPrice}</div>
                                <p style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.8; margin-bottom: 40px;">
                                    ${product.description || 'A premium beverage crafted for the discerning palate.'}
                                </p>
                                <div style="padding: 20px; border: 1px solid var(--accent); border-radius: 8px; text-align: center;">
                                    <p style="color: var(--accent); font-weight: 600;">Visit our store to purchase</p>
                                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">*Not available for online sale</p>
                                </div>
                            </div>
                        `;
                    } else {
                        productDetailContainer.innerHTML = '<p>Product not found.</p>';
                    }
                })
                .catch(error => {
                    console.error('Error loading product details:', error);
                    productDetailContainer.innerHTML = '<p>Error loading product details.</p>';
                });
        } else {
            productDetailContainer.innerHTML = '<p>No product specified.</p>';
        }
    }
});
