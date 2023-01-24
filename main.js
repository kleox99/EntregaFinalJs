let cards;
let cart = [];
let page = 1;
let pokemon = "";
const namePokemon = document.getElementById("namePokemon");
const catalogDiv = document.getElementById("catalog");
const cartDiv = document.getElementById("cart");
const totalPrice = document.getElementById("total");
const clearButton = document.getElementById("clearButton")

const createToast = msg => {
	return Toastify({
		text: msg,
		duration: 3000,
		destination: "#cart",
		close: true,
		gravity: "bottom",
		position: "right",
		stopOnFocus: true,
		style: {
			background: "#dc3545dd",
		}
	})
}

const getCards = async (page, pokemon) => {
	const query = pokemon ?
		`q=name:${pokemon}&page=${page}&pageSize=8` :
		`page=${page}&pageSize=8`;
	const res = await fetch(`https://api.pokemontcg.io/v2/cards?${query}`).then(data =>
		data.json()
	);
	cards = res.data;
	cards.forEach(card => (card.price = Math.floor(Math.random() * 100)));
};

const handleChange = event => {
	pokemon = event.target.value;
	showCatalog();
};

const getCardById = id => {
	const card = cards.find(card => card.id === id);
	return card;
};

const showCatalog = async () => {
	await getCards(page, pokemon);
	catalogDiv.innerHTML = "";
	if (cards.length === 0) {
		const errorMessage = document.createElement("span");
		errorMessage.innerHTML = "No se ha encontrado el pokemon ingresado, vuelva a intentarlo";
		errorMessage.classList.add("text-danger");
		catalogDiv.appendChild(errorMessage);
	}
	cards.forEach(card => {
		const cardDiv = document.createElement("div");
		cardDiv.classList.add("col-xl-3", "col-md-6", "col-xs-12", "d-flex", "justify-content-center");
		cardDiv.innerHTML = `
			<div class="card text-center mb-3 border border-danger border-5" style="width: 18rem;">
				<img src="${card.images.small}" class="card-img-top p-2 imgProductos" alt="${card.name}">
				<div class= "card-body p-2">
					<h5 class="fs-3">${card.name}</h5>
					<b class="fs-4">$${card.price} </b>
					<p class="fs-5">Rareza: ${card.rarity ? card.rarity : "Normal"}</p>
					<p class="fs-5">Tipo: ${card.types[0]} ${card.types[1] ? card.types[1] : ""}</p>
					<button class="btn btn-primary btn-danger" id="addButton${card.id}">
						Agregar al Carrito
					</button>
				</div>
			</div>
			`;
		catalogDiv.appendChild(cardDiv);
		const boton = document.getElementById(`addButton${card.id}`);
		boton.addEventListener("click", () => {
			addToCart(card);
		});
	});
};

const showCart = () => {
	cartDiv.innerHTML = "";
	cart.forEach(card => {
		const cardDiv = document.createElement("div");
		cardDiv.classList.add("col-xl-3", "col-md-6", "col-xs-12", "d-flex", "justify-content-center");
		cardDiv.innerHTML = `
			<div class="card text-center mb-3 border border-danger border-5" style="width: 18rem;">
				<img src="${card.images.small}" class="card-img-top p-2 imgProductos" alt="${card.name}">
				<div class= "card-body p-2">
					<h5 class="fs-3">${card.name}</h5>
					<b class="fs-4">$${card.price} </b>
					<div class="d-flex justify-content-between">
						<button class="d-flex btn btn-danger fs-4 lh-1 p-1 mb-2" id="minus${card.id}">➖</button>
						<b class="fs-5" id="quantity${card.id}">x${card.quantity}</b>
						<button class="d-flex btn btn-danger fs-4 lh-1 p-1 mb-2" id="plus${card.id}">➕</button>
					</div>	
					<button class="btn btn-danger" id="removeButton${card.id}"> Eliminar del carrito </button>
				</div>
			</div>
			`;
		cartDiv.appendChild(cardDiv);
		const removeButton = document.getElementById(`removeButton${card.id}`);
		removeButton.addEventListener("click", () => {
			removeCard(card.id);
		});
		const minusButton = document.getElementById(`minus${card.id}`);
		minusButton.addEventListener("click", () => {
			editQuantityInCart("-", card);
		})
		const plusButton = document.getElementById(`plus${card.id}`);
		plusButton.addEventListener("click", () => {
			editQuantityInCart("+", card);
		})
	});
	let total = 0;
	cart.forEach(card => {
		total += card.price * card.quantity;
	});
	totalPrice.innerHTML = total;
};

const addToCart = card => {
	const cardInCart = cart.find(cardInCart => cardInCart.id === card.id);
	const toast = createToast(`Se ha añadido ${card.name} al carrito`);
	if (cardInCart) {
		cardInCart.quantity++;
	} else {
		card.quantity = 1;
		cart.push(card);
	}
	localStorage.setItem("cart", JSON.stringify(cart));
	showCart();
	toast.showToast();
};

const removeCard = id => {
	const cardInCart = cart.find(cardInCart => cardInCart.id === id);
	const cardIndex = cart.indexOf(cardInCart);
	const toast = createToast(`Se ha eliminado ${cardInCart.name} del carrito`);
	cart.splice(cardIndex, 1);
	localStorage.setItem("cart", JSON.stringify(cart));
	showCart();
	toast.showToast();
};

const editQuantityInCart = (sign, card) => {
	const quantity = document.getElementById(`quantity${card.id}`);
	sign === "+" ? card.quantity++ : card.quantity--;
	card.quantity === 0 ? removeCard(card.id) : quantity.innerHTML = "x" + card.quantity
}

const clearCart = () => {
	cart = [];
	localStorage.removeItem("cart");
	showCart();
};

const nextPage = () => {
	page++;
	showCatalog();
};

const previousPage = () => {
	if (page > 1) {
		page--;
		showCatalog();
	}
};

if (localStorage.getItem("cart")) {
	cart = JSON.parse(localStorage.getItem("cart"));
	showCart();
}

namePokemon.addEventListener("change", handleChange);
clearButton.addEventListener("click", () => {
	Swal.fire({
		title: '¿Está seguro que que desea vaciar el carrito?',
		text: "Tener presente que este cambio no es reversible",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#dc3545',
		cancelButtonColor: '#dc3545',
		confirmButtonText: 'Si, deseo vaciarlo'
	}).then((result) => {
		if (result.isConfirmed) {
		clearCart()	
		Swal.fire({
			title:'¡Vacio!',
			text:'El carrito se ha vaciado con exito',
			icon:'success',
			confirmButtonColor: '#dc3545',
		})
		}
	})
});

showCatalog();