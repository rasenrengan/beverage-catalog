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
            const card = document.createElement('div');
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
});
