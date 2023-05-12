async function getProducts(){
    try {
        const data = await fetch('https://ecommercebackend.fundamentos-29.repl.co/');
        const res = await data.json();
        window.localStorage.setItem("products", JSON.stringify(res));
        return res;
    } catch (error) {
        console.log(error);
    }
}

function printProducts(products){
    const productsHTML = document.querySelector(".products");
    let html = "";
    for (const product in products) {
        const {image,name,quantity,id,price,category} = products[product]
        html += `
        <div class="product">
            <div class="product__img">
                    <img src="${image}" alt="image"/>
            </div>
            <div class="product__info">
            <h5 class="capitalize">
            ${category}
            </h5>
                <h4>
                ${name} | <span><b>Stock</b>: ${quantity}</span></h4>
                <h5>
                    $${price}
                    ${quantity ? `<i class='bx bx-plus' id='${id}'></i>` : `<span class="sold__out">Sold Out</span> `}
                </h5>
                
            
            </div>
        </div>
        `;
        productsHTML.innerHTML = html;
    }
}

function printProductsArtCart(db){
    
    
    const cardProducts = document.querySelector(".cart__products")
    let html = '' 
    
    for (const product in db.cart) { 
        const {quantity,price,name,image,id,amount} = db.cart[product]
        html += `
        <div class="card__product">
            <div class="card__product--img">
                <img src="${image}" alt="image" />
            </div>
            <div class="cart__product--body">
                <h4>${name} | $${price}</h4>
                <p>Stock: ${quantity}</p>
                <div class="cart__product--body-bot" id='${id}'>
                    <i class='bx bx-minus'></i>
                    <span>${amount} unit</span>
                    <i class='bx bx-plus' ></i>
                    <i class='bx bx-trash' ></i>
                </div>
            </div>
        </div>
        `
        printTotal(db);
    }
    cardProducts.innerHTML = html;
}

function addToCart(db){
    const productsHTML = document.querySelector(".products");
    
    
    productsHTML.addEventListener("click",function (e){
        if (e.target.classList.contains("bx-plus")) {

            const id = Number (e.target.id)

            const productFind = db.products.find(
                product => product.id === id 
            );

            if(db.cart[productFind.id]){
                if(productFind.quantity === db.cart[productFind.id].amount){
                    Swal.fire(
                        'Ups!',
                        'No hay mas en bodega!',
                        'warning'
                    );
                    return;
                }
                db.cart[productFind.id].amount++;
            }else{
                db.cart[productFind.id] = {
                    ...productFind, amount: 1
                };
            }

            window.localStorage.setItem("cart", JSON.stringify(db.cart))
            printProductsArtCart(db);
            printTotal(db);
            handlerAmount(db);
            
        }
    });
}

function cartHandler(){
    const iconCartHTML = document.querySelector(".bx-cart");
    const close = document.querySelector(".close__cart > i");
    const cartTML = document.querySelector(".cart");

    iconCartHTML.addEventListener("click", function () {
        cartTML.classList.toggle("cart__show");
    });

    close.addEventListener("click", function () {
        cartTML.classList.toggle("cart__show");
    });

}

function handlerProductInCart(db){
    const cartProducts = document.querySelector(".cart__products")  
    cartProducts.addEventListener("click",function(e){
        if(e.target.classList.contains("bx-plus")) {
            const id = Number(e.target.parentElement.id);
    
            const productFind = db.products.find(
                (product) => product.id === id
            );
    
            if(productFind.quantity === db.cart[productFind.id].amount){
                Swal.fire(
                    'Ups!',
                    'No hay mas en bodega!',
                    'warning'
                );
                return;
            }
            db.cart[id].amount++;
        }
        if(e.target.classList.contains("bx-minus")) {
            const id = Number(e.target.parentElement.id);
            if(db.cart[id].amount === 1){
                const response = confirm('estas seguro que quieres eliminar este producto')
                if(!response) return;
                delete db.cart[id]
            }else{
                db.cart[id].amount--;
            }
        }
        if(e.target.classList.contains("bx-trash")) {
            const id = Number(e.target.parentElement.id);
            const response = confirm('estas seguro que quieres eliminar este producto')
            if(!response) return;
            delete db.cart[id];
        }
    
        window-localStorage.setItem('cart', JSON.stringify(db.cart))
        printProductsArtCart(db);
        printTotal(db);
        handlerAmount(db);
    });
}

function printTotal(db){
    const infoTotal = document.querySelector(".info__total");
    const infoAmount = document.querySelector(".info__amount");
    
    let totalProduct = 0;
    let amountProduct = 0;

    for (const product in db.cart) {

        const {amount,price} = db.cart[product];
        totalProduct += price * amount;
        amountProduct += amount;
    }
    infoAmount.textContent = amountProduct + " units";
    infoTotal.textContent = '$' + totalProduct + '.00';
}

function handlerTotal(db){
    const btnBuy = document.querySelector(".btn__buy")
    btnBuy.addEventListener("click",function(){
        
        if(!Object.values(db.cart).length){
            Swal.fire(
                'Ups!',
                'No hay productos en el carrito!',
                'error'
            );    
            return;
        }

        Swal.fire({
            title: 'Desea hacer la compra?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Si',
            denyButtonText: `No`,
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                const curruentProducts = [];

                for (const product of db.products) {
                    const productCart = db.cart[product.id];
                    if(product.id === productCart?.id){
                        curruentProducts.push({
                            ...product,
                            quantity: product.quantity - productCart.amount,
                        });
                    }else{
                        curruentProducts.push(product)
                    }
                }

                db.products = curruentProducts;
                db.cart={};

                window.localStorage.setItem("products", JSON.stringify(db.products));
                window.localStorage.setItem("cart", JSON.stringify(db.cart));
                loadData(db);
                
                Swal.fire('Compra confirmada!', '', 'success');
            }
        })
    });
}


function handlerAmount(db){
    const amountProducts =document.querySelector(".amountProducts");

    let amount = 0;
    for (const product in db.cart) {
        amount += db.cart[product].amount;
    }
        
    amountProducts.textContent = amount;
}

function handlerButtons(db){    
    let html = ''
    const objProduct ={};
    let classBtn = "";
    objProduct.all = db.products.length;
    for (const product of db.products) {
        objProduct[product.category] = objProduct[product.category] + 1 || 1
    }
    
    Object.entries(objProduct).forEach((info) => {
        if(info[0]=="all"){
            classBtn ="active-btn";
        }   

        html += `
        <button data-filter="${info[0]}" class="btn capitalize ${classBtn}">
            <b> ${ info[0] == "all" ? "Show all" : info[0] } </b>
            </br>  
            ${ info[0] == "all" ? "Show all" : info[1] } products
        </button>
        `;

        classBtn = "";
    });
    document.querySelector(".butons").innerHTML = html;
}

async function loadData(db){
    printProducts(db.products);
    addToCart(db);
    printProductsArtCart(db);
    handlerProductInCart(db);
    printTotal(db);
    handlerAmount(db);
    handlerTotal(db);
    handlerButtons(db);
}

async function main(){
    
    const db = {
        products: 
            JSON.parse(window.localStorage.getItem("products"))
            || (await  getProducts()),
        cart: JSON.parse(window.localStorage.getItem("cart")) || {}
    }

    loadData(db);
    cartHandler();
    createFilters(db);

    window.addEventListener('scroll', function() { 
        scrollpos = window.scrollY;

        let nav = document.getElementsByTagName("nav")[0];
        if(scrollpos > 1){
            nav.style.backgroundColor = "#fff";
            nav.style.boxShadow = "0 .2rem 1rem rgba(0, 0, 0, .15)";
        }else{
            nav.style.backgroundColor = "hsl(206, 4%, 97%)";
            nav.style.boxShadow = "none";
        }

        let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        let productPos = (75 * h) / 100;

        let header = document.getElementsByClassName("menu");
        
        if (scrollpos >= productPos) {
            header[0].classList.remove('active-menu');
            header[1].classList.add('active-menu');
        } else {
            header[0].classList.add('active-menu');
            header[1].classList.remove('active-menu');
        }
    })
}

function createFilters(db){
    const butonsHTML = document.querySelector(".butons"); 

    butonsHTML.addEventListener("click",function(e){
        if(e.target.classList.contains("btn")){
            const collection = document.getElementsByClassName("btn");
            for (let index = 0; index < collection.length; index++) {
                const element = collection[index];
                element.classList.remove("active-btn");
            }

            e.target.classList.add("active-btn");

            const typeFilter = e.target.dataset.filter;
            
            if(typeFilter === "all"){
                return printProducts(db.products);
            }
            
            let newArray = db.products.filter(function(product){
                return product.category === typeFilter
            });

            printProducts(newArray);
        }
    });
}

main();
