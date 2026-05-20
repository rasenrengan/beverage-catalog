document.addEventListener('DOMContentLoaded', () => {
    // 1. Product Detail Page Logic
    const productDetailContainer = document.getElementById('product-detail-container');
    if (productDetailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            fetch('data/products.json')
                .then(response => response.json())
                .then(data => {
                    // Fix: Compare string to string since JSON ids are numbers
                    const product = data.find(p => p.id.toString() === productId);
                    if (product) {
                        const formattedPrice = new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(product.price);
                        document.title = `${product.name} | Royal Beverages`;

                        // Add mobile responsive styling inline for the detail view
                        productDetailContainer.innerHTML = `
                            <div class="product-image-wrap" style="flex: 1; min-width: 300px;">
                                <img src="${product.image}" alt="${product.name}" style="width: 100%; max-height: 500px; object-fit: contain; border-radius: 10px;">
                            </div>
                            <div class="product-info-wrap" style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 300px;">
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
                        // Update container to wrap on mobile
                        productDetailContainer.style.flexWrap = 'wrap';
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

    // 2. Catalog Page Logic
    const productsGrid = document.getElementById('products-grid');
    const categoryFilters = document.getElementById('category-filters');
    
    if (productsGrid && categoryFilters) {
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
    }

    // 3. Global Floating Action Button (Call Us)
    const callFAB = document.createElement('a');
    callFAB.href = 'tel:+201234567890';
    callFAB.className = 'floating-call-btn';
    callFAB.setAttribute('aria-label', 'Call Us');
    callFAB.innerHTML = `
        <div class="fab-pulse"></div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
    `;
    document.body.appendChild(callFAB);

    // 4. Global Navbar Search Logic
    const searchInput = document.getElementById('global-search-input');
    const searchBtn = document.getElementById('global-search-btn');

    function performSearch(query) {
        if (!query.trim()) {
            // If query is empty and we are on catalog, reset to all products
            if (productsGrid && typeof allProducts !== 'undefined') {
                if (categoryFilters) {
                    categoryFilters.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                    const allLi = categoryFilters.querySelector('li[data-category="All"]');
                    if (allLi) allLi.classList.add('active');
                }
                renderProducts(allProducts);
                const newUrl = `${window.location.pathname}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
            }
            return;
        }
        
        // If we are already on catalog.html, filter products dynamically
        if (productsGrid && typeof allProducts !== 'undefined') {
            const filtered = allProducts.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) || 
                product.category.toLowerCase().includes(query.toLowerCase())
            );
            
            // Remove active class from categories list since we are custom searching
            if (categoryFilters) {
                categoryFilters.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            }
            
            renderProducts(filtered);
            
            // Update URL without reloading
            const newUrl = `${window.location.pathname}?search=${encodeURIComponent(query)}`;
            window.history.replaceState({ path: newUrl }, '', newUrl);
        } else {
            // Redirect to catalog page with search query
            window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
        }
    }

    if (searchInput) {
        // Listen to Enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });

        // Listen to button click
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                performSearch(searchInput.value);
            });
        }
        
        // If already on catalog page and there is a search param, pre-fill and perform filter
        if (productsGrid) {
            const urlParams = new URLSearchParams(window.location.search);
            const searchParam = urlParams.get('search');
            if (searchParam) {
                searchInput.value = searchParam;
                // Wait for allProducts to be fetched and populated in catalog page logic
                const checkProductsLoaded = setInterval(() => {
                    if (typeof allProducts !== 'undefined' && allProducts.length > 0) {
                        clearInterval(checkProductsLoaded);
                        performSearch(searchParam);
                    }
                }, 50);
            }
        }
    }
});
