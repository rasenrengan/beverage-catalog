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
                renderProducts(allProducts, true);
            })
            .catch(error => console.error('Error loading products:', error));

        // Category Filtering
        categoryFilters.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                categoryFilters.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                e.target.classList.add('active');

                const category = e.target.getAttribute('data-category');
                
                if (category === 'All') {
                    renderProducts(allProducts, true);
                } else {
                    const filtered = allProducts.filter(p => p.category === category);
                    renderProducts(filtered, false);
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
        function renderProducts(products, groupByCategory = false) {
            productsGrid.innerHTML = '';
            
            if (products.length === 0) {
                productsGrid.innerHTML = '<p style="color: #a0aab2; grid-column: 1/-1; text-align: center;">No products found.</p>';
                return;
            }

            if (groupByCategory) {
                // Change grid to block container for sections
                productsGrid.style.display = 'block';
                
                // Group by category
                const groups = {};
                products.forEach(p => {
                    if (!groups[p.category]) groups[p.category] = [];
                    groups[p.category].push(p);
                });
                
                // Category display order
                const categoryOrder = ['Wine', 'Spirits', 'Beer', 'RTDs', 'Accessories', 'Extras'];
                
                categoryOrder.forEach(cat => {
                    const groupProducts = groups[cat];
                    if (groupProducts && groupProducts.length > 0) {
                        const section = document.createElement('div');
                        section.className = 'category-section';
                        section.style.marginBottom = '60px';
                        
                        const title = document.createElement('h2');
                        title.className = 'category-section-title';
                        title.innerText = cat === 'Wine' ? 'Premium Wines' : 
                                          cat === 'Spirits' ? 'Luxury Spirits' : 
                                          cat === 'Beer' ? 'Craft Beers' : 
                                          cat === 'RTDs' ? 'RTDs & Premixes' : cat;
                        title.style.fontSize = '2rem';
                        title.style.borderBottom = '2px solid var(--accent)';
                        title.style.paddingBottom = '10px';
                        title.style.marginBottom = '25px';
                        title.style.color = 'var(--text-main)';
                        
                        const grid = document.createElement('div');
                        grid.className = 'products-grid';
                        grid.style.display = 'grid';
                        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                        grid.style.gap = '30px';
                        
                        groupProducts.forEach(product => {
                            const card = createProductCard(product);
                            grid.appendChild(card);
                        });
                        
                        section.appendChild(title);
                        section.appendChild(grid);
                        productsGrid.appendChild(section);
                    }
                });
                
                // Trigger transitions
                const cards = productsGrid.querySelectorAll('.product-card');
                cards.forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 15);
                });
            } else {
                // Single grid view
                productsGrid.style.display = 'grid';
                productsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                productsGrid.style.gap = '30px';
                
                products.forEach(product => {
                    const card = createProductCard(product);
                    productsGrid.appendChild(card);
                });
                
                // Trigger transitions
                const cards = productsGrid.querySelectorAll('.product-card');
                cards.forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 30);
                });
            }
        }

        function createProductCard(product) {
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
            return card;
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
            if (productsGrid && typeof allProducts !== 'undefined') {
                if (categoryFilters) {
                    categoryFilters.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                    const allLi = categoryFilters.querySelector('li[data-category="All"]');
                    if (allLi) allLi.classList.add('active');
                }
                renderProducts(allProducts, true);
                const newUrl = `${window.location.pathname}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
            }
            return;
        }
        
        if (productsGrid && typeof allProducts !== 'undefined') {
            const filtered = allProducts.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) || 
                product.category.toLowerCase().includes(query.toLowerCase())
            );
            
            if (categoryFilters) {
                categoryFilters.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            }
            
            renderProducts(filtered, false);
            
            const newUrl = `${window.location.pathname}?search=${encodeURIComponent(query)}`;
            window.history.replaceState({ path: newUrl }, '', newUrl);
        } else {
            window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
        }
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                performSearch(searchInput.value);
            });
        }
        
        if (productsGrid) {
            const urlParams = new URLSearchParams(window.location.search);
            const searchParam = urlParams.get('search');
            if (searchParam) {
                searchInput.value = searchParam;
                const checkProductsLoaded = setInterval(() => {
                    if (typeof allProducts !== 'undefined' && allProducts.length > 0) {
                        clearInterval(checkProductsLoaded);
                        performSearch(searchParam);
                    }
                }, 50);
            }
        }
    }

    // 5. Global Age Verification Gate (Age Verification Wall)
    if (localStorage.getItem('age_verified') !== 'true') {
        // Prevent background page scroll while active
        document.body.style.overflow = 'hidden';

        const overlay = document.createElement('div');
        overlay.className = 'age-gate-overlay';
        overlay.innerHTML = `
            <div class="age-gate-modal">
                <img src="images/logo.png" alt="Royal Logo" class="age-gate-logo">
                <h2>Welcome to <span>Royal</span></h2>
                <p>You must be 21 years of age or older to view our premium beverage selection. Please verify your age to continue.</p>
                <div class="age-gate-buttons">
                    <button class="btn-age-confirm" id="age-confirm-btn">Yes, I am 21+</button>
                    <button class="btn-age-reject" id="age-reject-btn">Under 21</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        
        // Trigger show class for transition effect
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);

        // Yes button click
        document.getElementById('age-confirm-btn').addEventListener('click', () => {
            localStorage.setItem('age_verified', 'true');
            overlay.style.opacity = '0';
            document.body.style.overflow = 'auto';
            setTimeout(() => {
                overlay.remove();
            }, 500);
        });

        // Under 21 button click
        document.getElementById('age-reject-btn').addEventListener('click', () => {
            window.location.href = 'https://www.responsibility.org/';
        });
    }
});
