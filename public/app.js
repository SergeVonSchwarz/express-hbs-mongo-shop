const toCurrency = () => {
    document.querySelectorAll(".price").forEach((node) => {
        node.textContent = new Intl.NumberFormat("ru-RU", {
            currency: "eur",
            style: "currency",
        }).format(parseInt(node.textContent))
    })
}

const toDate = (date) => {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date(date))
}

document.querySelectorAll(".date").forEach((node) => {
    node.textContent = toDate(node.textContent)
})

const addEvents = () => {
    document.querySelectorAll(".delete-course").forEach((node) => {
        node.addEventListener("click", (event) => {
            const id = event.target.dataset.id
            const csrf = event.target.dataset.csrf
            fetch(`/cart/delete/${id}`, {
                method: "delete",
                headers: {
                    "X-XSRF-TOKEN": csrf,
                },
            })
                .then((res) => res.json())
                .then((cart) => {
                    if (cart.courses.length) {
                        // edit
                        editCart(cart, csrf)
                    } else {
                        // drop
                        document.querySelector(".cart-container").innerHTML =
                            "<p>Cart empty</p>"
                    }
                })
        })
    })
}

const editCart = (cart, csrf) => {
    const { courses, price } = cart
    const priceNode = document.querySelector(".cart-total-price")
    priceNode.textContent = price

    const html = courses
        .map((course) => {
            return `<tr>
                    <td class="price-title">${course.title}</td>
                    <td class="price-count">${course.count}</td>
                    <td class="price cart-price">${course.price}</td>
                    <td>
                        <button data-csrf=${csrf} data-id=${course._id} class="btn btn-small delete-course">Delete</button>
                    </td>
                </tr>`
        })
        .join("")
    document
        .getElementById("cart-table")
        .querySelector("tbody").innerHTML = html

    toCurrency()
    addEvents()
}

const init = () => {
    toCurrency()
    addEvents()
}

init()

M.Tabs.init(document.querySelectorAll(".tabs"))
